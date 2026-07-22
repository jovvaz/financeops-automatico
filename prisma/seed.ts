import { PrismaClient, RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createDemoDatabase } from "../lib/demo-data";
import { getCashflow } from "../lib/services";

const prisma = new PrismaClient();
const demo = createDemoDatabase();

async function main() {
  await prisma.company.deleteMany({ where: { id: demo.company.id } });
  await prisma.company.create({ data: { id: demo.company.id, name: demo.company.name, document: demo.company.document, lowCashThreshold: demo.company.lowCashThreshold } });

  const roles = await Promise.all([
    [RoleName.ADMIN, "admin"], [RoleName.FINANCEIRO, "financeiro"], [RoleName.APROVADOR, "aprovador"], [RoleName.VISUALIZADOR, "visualizador"],
  ].map(async ([name, key]) => [key, await prisma.role.create({ data: { id: `role_${key}`, companyId: demo.company.id, name: name as RoleName } })] as const));
  const roleMap = Object.fromEntries(roles);
  const passwordHash = await bcrypt.hash("Demo@123", 10);
  await prisma.user.createMany({ data: demo.users.map((user) => ({ id: user.id, companyId: demo.company.id, roleId: roleMap[user.role].id, name: user.name, email: user.email, passwordHash })) });

  await prisma.customer.createMany({ data: demo.customers.map((customer) => ({ id: customer.id, companyId: customer.companyId, name: customer.name, document: customer.document, email: customer.email, phone: customer.phone, tradeName: customer.company, riskScore: customer.riskScore })) });
  await prisma.supplier.createMany({ data: demo.suppliers.map((supplier) => ({ id: supplier.id, companyId: supplier.companyId, name: supplier.name, document: supplier.document, category: supplier.category, recurrence: supplier.recurrence })) });
  const account = await prisma.financialAccount.create({ data: { id: "acc_demo", companyId: demo.company.id, name: "Conta Operacional", bankName: "Banco Demo", accountType: "CHECKING", balance: demo.company.currentBalance } });

  await prisma.receivable.createMany({ data: demo.receivables.map((item) => ({ id: item.id, companyId: item.companyId, customerId: item.customerId, description: item.description, amount: item.amount, dueDate: new Date(item.dueDate), status: item.status, paymentMethod: item.paymentMethod, paymentLink: item.paymentLink, paidAt: item.paidAt ? new Date(item.paidAt) : null, origin: item.origin, owner: item.owner, category: item.category })) });
  await prisma.payable.createMany({ data: demo.payables.map((item) => ({ id: item.id, companyId: item.companyId, supplierId: item.supplierId, description: item.description, amount: item.amount, dueDate: new Date(item.dueDate), status: item.status, category: item.category, costCenter: item.costCenter, recurrence: item.recurrence, owner: item.owner, approvedAt: item.approvedAt ? new Date(item.approvedAt) : null, paidAt: item.paidAt ? new Date(item.paidAt) : null })) });
  const receivedPayments = demo.receivables.filter((item) => item.status === "PAID" && item.paidAt).map((item) => ({ companyId: demo.company.id, financialAccountId: account.id, receivableId: item.id, amount: item.amount, direction: "IN", paidAt: new Date(item.paidAt!), externalReference: `SEED-REC-${item.id}`, idempotencyKey: `seed-receivable-${item.id}` }));
  const outgoingPayments = demo.payables.filter((item) => item.status === "PAID" && item.paidAt).map((item) => ({ companyId: demo.company.id, financialAccountId: account.id, payableId: item.id, amount: item.amount, direction: "OUT", paidAt: new Date(item.paidAt!), externalReference: `SEED-PAY-${item.id}`, idempotencyKey: `seed-payable-${item.id}` }));
  await prisma.payment.createMany({ data: [...receivedPayments, ...outgoingPayments] });
  await prisma.bankTransaction.createMany({ data: demo.bankTransactions.map((item) => ({ id: item.id, companyId: item.companyId, financialAccountId: account.id, postedAt: new Date(item.postedAt), description: item.description, amount: item.amount, direction: item.direction, externalId: item.externalId, status: item.status })) });

  const rules = [
    [-3, "Lembrete amigável: sua fatura vence em 3 dias."], [0, "Sua fatura vence hoje. Use o link para pagamento."], [2, "Identificamos atraso no pagamento."], [7, "Pagamento pendente há 7 dias. Regularize para evitar restrições."], [15, "Encaminhado para contato humano."],
  ];
  await prisma.collectionRule.createMany({ data: rules.map(([daysOffset, message], index) => ({ id: `rule_${index}`, companyId: demo.company.id, name: `Régua D${Number(daysOffset) >= 0 ? "+" : ""}${daysOffset}`, daysOffset: Number(daysOffset), channel: "EMAIL", message: String(message) })) });
  await prisma.collectionEvent.createMany({ data: demo.collectionEvents.map((event) => ({ id: event.id, companyId: event.companyId, receivableId: event.receivableId, channel: event.channel, message: event.message, status: event.status, sentAt: new Date(event.sentAt), automation: event.automation })) });

  await prisma.financialAlert.createMany({ data: demo.alerts.map((alert) => ({ ...alert, fingerprint: `seed-${alert.id}`, createdAt: new Date(alert.createdAt) })) });
  await prisma.automationRun.createMany({ data: demo.automationRuns.map(({ summary, ...run }) => ({ ...run, startedAt: new Date(run.startedAt), finishedAt: new Date(run.finishedAt), idempotencyKey: `seed-${run.id}`, summary: { message: summary } })) });
  await prisma.auditLog.createMany({ data: demo.auditLogs.map(({ actor, metadata, ...log }) => ({ ...log, createdAt: new Date(log.createdAt), metadata: { actor, message: metadata } })) });

  const cashflow = getCashflow(30);
  await prisma.cashflowSnapshot.createMany({ data: cashflow.map((point) => ({ companyId: demo.company.id, snapshotDate: new Date(point.date), openingBalance: demo.company.currentBalance, expectedIn: point.expectedIn, expectedOut: point.expectedOut, projectedBalance: point.projectedBalance })) });

  const matchedTransactions = demo.bankTransactions.filter((item) => item.suggestionId).slice(0, 80);
  await prisma.reconciliationMatch.createMany({ data: matchedTransactions.map((item) => ({ companyId: demo.company.id, bankTransactionId: item.id, receivableId: item.direction === "CREDIT" ? item.suggestionId : null, payableId: item.direction === "DEBIT" ? item.suggestionId : null, confidence: item.confidence ?? 0, status: item.status, confirmedAt: item.status === "MATCHED" ? new Date(item.postedAt) : null })) });
  await prisma.integration.createMany({ data: [
    { companyId: demo.company.id, provider: "n8n", status: "PLANNED", config: { events: ["receivable.due_soon", "receivable.overdue", "payment.approved", "alert.created", "report.generated"] } },
    { companyId: demo.company.id, provider: "kestra", status: "PLANNED", config: { flows: ["daily-bank-sync", "daily-cashflow-snapshot", "weekly-financial-report", "reconciliation-pipeline", "import-demo-spreadsheets"] } },
  ] });
  console.log(`Seed concluído: ${demo.customers.length} clientes, ${demo.suppliers.length} fornecedores, ${demo.receivables.length} recebíveis, ${demo.payables.length} pagáveis e ${demo.bankTransactions.length} transações.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
