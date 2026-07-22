import { getStore } from "./store";
import type { CashflowPoint, EntryStatus, ReconciliationStatus } from "./types";

const DAY = 86_400_000;
const activeStatuses: EntryStatus[] = ["PENDING", "APPROVED", "OVERDUE"];
const toDay = (value: string | Date) => new Date(new Date(value).toDateString()).getTime();
const today = () => toDay(new Date());
export const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export function getCashflow(days = 30): CashflowPoint[] {
  const db = getStore();
  let balance = db.company.currentBalance;
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today() + index * DAY);
    const expectedIn = sum(db.receivables.filter((r) => activeStatuses.includes(r.status) && toDay(r.dueDate) === date.getTime()).map((r) => r.amount));
    const expectedOut = sum(db.payables.filter((p) => activeStatuses.includes(p.status) && toDay(p.dueDate) === date.getTime()).map((p) => p.amount));
    balance += expectedIn - expectedOut;
    return { date: date.toISOString(), label: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), expectedIn, expectedOut, projectedBalance: balance };
  });
}

export function getDashboard() {
  const db = getStore();
  const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setMonth(end.getMonth() + 1);
  const inMonth = (date: string) => new Date(date) >= start && new Date(date) < end;
  const openReceivables = db.receivables.filter((r) => activeStatuses.includes(r.status));
  const openPayables = db.payables.filter((p) => activeStatuses.includes(p.status));
  const cashflow = getCashflow(30);
  const projected7 = cashflow[6]?.projectedBalance ?? db.company.currentBalance;
  const projected30 = cashflow[29]?.projectedBalance ?? projected7;
  const overdue = openReceivables.filter((r) => toDay(r.dueDate) < today());
  const dueToday = [...openReceivables, ...openPayables].filter((item) => toDay(item.dueDate) === today());
  const overdueByCustomer = new Map<string, number>();
  overdue.forEach((item) => overdueByCustomer.set(item.customer, (overdueByCustomer.get(item.customer) ?? 0) + item.amount));
  const expenseByCategory = new Map<string, number>();
  db.payables.filter((p) => inMonth(p.dueDate)).forEach((item) => expenseByCategory.set(item.category, (expenseByCategory.get(item.category) ?? 0) + item.amount));
  return {
    company: db.company,
    kpis: {
      currentBalance: db.company.currentBalance,
      projected7,
      projected30,
      receivableMonth: sum(openReceivables.filter((r) => inMonth(r.dueDate)).map((r) => r.amount)),
      payableMonth: sum(openPayables.filter((p) => inMonth(p.dueDate)).map((p) => p.amount)),
      delinquency: sum(overdue.map((r) => r.amount)),
      overdueCount: overdue.length,
      dueTodayCount: dueToday.length,
    },
    cashflow,
    revenueVsExpense: cashflow.map((point) => ({ label: point.label, revenue: point.expectedIn, expense: point.expectedOut })),
    topOverdueCustomers: [...overdueByCustomer.entries()].map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount).slice(0, 5),
    topExpenseCategories: [...expenseByCategory.entries()].map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount).slice(0, 5),
    criticalAlerts: db.alerts.filter((a) => a.status === "OPEN" && ["CRITICAL", "HIGH"].includes(a.severity)).slice(0, 6),
  };
}

export function listReceivables(filters: URLSearchParams) {
  const db = getStore();
  return db.receivables.filter((item) => {
    const status = filters.get("status"); const query = filters.get("q")?.toLowerCase();
    return (!status || item.status === status) && (!query || `${item.customer} ${item.description}`.toLowerCase().includes(query));
  });
}

export function listPayables(filters: URLSearchParams) {
  const db = getStore();
  return db.payables.filter((item) => {
    const status = filters.get("status"); const query = filters.get("q")?.toLowerCase();
    return (!status || item.status === status) && (!query || `${item.supplier} ${item.description}`.toLowerCase().includes(query));
  });
}

export function updateReceivable(id: string, status: EntryStatus) {
  const db = getStore(); const item = db.receivables.find((entry) => entry.id === id);
  if (!item) return null;
  if (item.status === status) return item;
  item.status = status; item.paidAt = status === "PAID" ? new Date().toISOString() : item.paidAt;
  addAudit("STATUS_UPDATED", "receivable", id, `Status alterado para ${status}`);
  return item;
}

export function updatePayable(id: string, status: EntryStatus) {
  const db = getStore(); const item = db.payables.find((entry) => entry.id === id);
  if (!item) return null;
  if (item.status === status) return item;
  item.status = status;
  if (status === "APPROVED") item.approvedAt = new Date().toISOString();
  if (status === "PAID") item.paidAt = new Date().toISOString();
  addAudit(status === "APPROVED" ? "PAYMENT_APPROVED" : "STATUS_UPDATED", "payable", id, `Status alterado para ${status}`);
  return item;
}

export function simulateCollection(receivableId: string) {
  const db = getStore(); const item = db.receivables.find((entry) => entry.id === receivableId);
  if (!item) return null;
  const existing = db.collectionEvents.find((event) => event.receivableId === receivableId && Date.now() - new Date(event.sentAt).getTime() < 60_000);
  if (existing) return { ...existing, duplicate: true };
  const event = { id: `col_${crypto.randomUUID()}`, companyId: db.company.id, customer: item.customer, receivableId: item.id, invoice: item.description, channel: "E-mail", message: `Olá! Este é um lembrete sobre ${item.description}. Link: ${item.paymentLink}`, status: "Simulado", sentAt: new Date().toISOString(), automation: "manual-demo" };
  db.collectionEvents.unshift(event); addAudit("COLLECTION_SIMULATED", "receivable", item.id, "Cobrança simulada por e-mail");
  return event;
}

export function confirmReconciliation(id: string, action: "confirm" | "ignore") {
  const db = getStore(); const item = db.bankTransactions.find((entry) => entry.id === id);
  if (!item) return null;
  item.status = (action === "confirm" ? "MATCHED" : "IGNORED") as ReconciliationStatus;
  addAudit(action === "confirm" ? "RECONCILIATION_CONFIRMED" : "RECONCILIATION_IGNORED", "bank_transaction", id, `Conciliação ${action}`);
  return item;
}

export function resolveAlert(id: string) {
  const db = getStore(); const item = db.alerts.find((entry) => entry.id === id);
  if (!item) return null;
  item.status = "RESOLVED"; addAudit("ALERT_RESOLVED", "financial_alert", id, "Alerta resolvido");
  return item;
}

function addAudit(action: string, entityType: string, entityId: string | null, metadata: string) {
  const db = getStore();
  db.auditLogs.unshift({ id: `audit_${crypto.randomUUID()}`, companyId: db.company.id, action, entityType, entityId, actor: "Usuário demo", createdAt: new Date().toISOString(), metadata });
}

export function runAutomation(name: "collection" | "alerts" | "cashflow" | "reconciliation") {
  const db = getStore(); const startedAt = new Date().toISOString(); let processed = 0; let summary = "";
  if (name === "collection") {
    const candidates = db.receivables.filter((item) => item.status === "OVERDUE" || (toDay(item.dueDate) - today()) / DAY === 3).slice(0, 12);
    candidates.forEach((item) => { if (!db.collectionEvents.some((event) => event.receivableId === item.id && toDay(event.sentAt) === today())) { db.collectionEvents.unshift({ id: `col_${crypto.randomUUID()}`, companyId: db.company.id, customer: item.customer, receivableId: item.id, invoice: item.description, channel: "E-mail", message: item.status === "OVERDUE" ? "Sua fatura está em atraso. Acesse o link para regularizar." : "Sua fatura vence em 3 dias. Conte conosco.", status: "Simulado", sentAt: new Date().toISOString(), automation: "collection-dunning-v1" }); processed += 1; } });
    summary = `${processed} cobranças criadas`;
  } else if (name === "alerts") {
    const candidates = db.payables.filter((item) => activeStatuses.includes(item.status) && item.amount > 20_000).slice(0, 5);
    candidates.forEach((item) => { const key = `expense-${item.id}`; if (!db.alerts.some((alert) => alert.id === key)) { db.alerts.unshift({ id: key, companyId: db.company.id, type: "Despesa incomum", severity: "HIGH", status: "OPEN", description: `Despesa de alto valor: ${item.description}`, entityType: "payable", entityId: item.id, createdAt: new Date().toISOString() }); processed += 1; } });
    summary = `${processed} novos alertas`;
  } else if (name === "cashflow") {
    processed = getCashflow(30).length; summary = "Snapshot de 30 dias recalculado";
  } else {
    const candidates = db.bankTransactions.filter((item) => item.status === "PENDING" || item.status === "UNIDENTIFIED").slice(0, 15);
    candidates.forEach((item) => { if (item.suggestionId) { item.status = "SUGGESTED"; processed += 1; } });
    summary = `${processed} sugestões de match atualizadas`;
  }
  const run = { id: `run_${crypto.randomUUID()}`, companyId: db.company.id, name, status: "SUCCESS", startedAt, finishedAt: new Date().toISOString(), processed, summary };
  db.automationRuns.unshift(run); addAudit("AUTOMATION_EXECUTED", "automation_run", run.id, summary); return run;
}
