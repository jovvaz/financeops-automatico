import type { DemoDatabase, EntryStatus, Severity } from "./types";

export const DEMO_COMPANY_ID = "cmp_financeops_demo";
const DAY = 86_400_000;
const now = new Date();
const dateAt = (offset: number, hour = 12) => {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour);
  date.setDate(date.getDate() + offset);
  return date.toISOString();
};
const brlRound = (value: number) => Math.round(value * 100) / 100;
const pick = <T,>(items: readonly T[], index: number) => items[index % items.length];

const customerNames = [
  "Aurora Tecnologia", "Verde Campo Alimentos", "Nexo Logística", "Clínica Horizonte", "Ponto Norte Varejo",
  "Lumina Educação", "Arco Engenharia", "Viva Saúde Digital", "Órbita Marketing", "Nativa Cosméticos",
  "Delta Analytics", "Mobi Urban", "Café do Centro", "Solaris Energia", "Atlas Segurança",
  "Métrica Consultoria", "Cubo Arquitetura", "Farol Seguros", "Plena RH", "Semente Agro",
  "Onda Telecom", "Prisma Jurídico", "Via Clara Turismo", "Essencial Farma", "Brisa Eventos",
  "Pilar Construções", "Mundo Pet", "Integra Contábil", "Trilha Esportes", "Casa Nova Decor",
];
const supplierNames = [
  "Cloudbase Infra", "Folha Certa RH", "Contábil Prime", "Imóvel Centro", "Legal Partners",
  "Ads Performance", "DataStack Software", "Office Mais", "SecureNet", "Telecom Pro",
  "DevHouse", "People Benefits", "TaxFlow", "Brand Studio", "ServerOne",
  "Limpeza Ideal", "Energia Sul", "Água & Cia", "Viagens Corp", "Equipamentos Alfa",
];
const revenueCategories = ["Mensalidade", "Projeto pontual", "Consultoria", "Implantação", "Suporte", "Recorrência SaaS"];
const expenseCategories = ["Folha de pagamento", "Impostos", "Software", "Marketing", "Aluguel", "Fornecedor", "Infraestrutura", "Contabilidade", "Jurídico"];
const owners = ["Marina Lima", "Rafael Costa", "Camila Alves", "Bruno Santos"];

export function createDemoDatabase(): DemoDatabase {
  const customers = customerNames.map((name, i) => ({
    id: `cus_${String(i + 1).padStart(3, "0")}`,
    companyId: DEMO_COMPANY_ID,
    name,
    document: `${String(12_000_000 + i * 73_931).padStart(8, "0")}/0001-${String(10 + i).padStart(2, "0")}`,
    email: `financeiro@${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "")}.demo`,
    phone: `(11) 9${String(8000_0000 + i * 713).slice(-8, -4)}-${String(8000_0000 + i * 713).slice(-4)}`,
    company: name,
    riskScore: i % 9 === 0 ? 82 : i % 6 === 0 ? 64 : 18 + (i * 7) % 35,
    totalOpen: 0,
    totalPaid: 0,
    invoiceCount: 0,
    history: "Relacionamento ativo, pagamentos monitorados pela régua automática.",
  }));

  const suppliers = supplierNames.map((name, i) => ({
    id: `sup_${String(i + 1).padStart(3, "0")}`,
    companyId: DEMO_COMPANY_ID,
    name,
    document: `${String(43_000_000 + i * 45_119).padStart(8, "0")}/0001-${String(20 + i).padStart(2, "0")}`,
    category: pick(expenseCategories, i),
    totalPaid: 0,
    totalPending: 0,
    recurrence: i % 3 === 0 ? "Mensal" : i % 3 === 1 ? "Pontual" : "Anual",
    history: "Fornecedor validado, histórico de despesas disponível para auditoria.",
  }));

  const receivables = Array.from({ length: 100 }, (_, i) => {
    const customer = customers[i % customers.length];
    const dueOffset = (i * 7) % 76 - 34;
    const status: EntryStatus = i % 5 === 0 ? "PAID" : dueOffset < 0 ? "OVERDUE" : "PENDING";
    const amount = brlRound(1800 + ((i * 1873) % 18_500) + (i % 4) * 249.9);
    const item = {
      id: `rec_${String(i + 1).padStart(4, "0")}`, companyId: DEMO_COMPANY_ID,
      customerId: customer.id, customer: customer.name,
      description: `${pick(revenueCategories, i)} · competência ${String((i % 12) + 1).padStart(2, "0")}/${now.getFullYear()}`,
      amount, dueDate: dateAt(dueOffset), status,
      paymentMethod: pick(["PIX", "Boleto", "Transferência"], i),
      paymentLink: `https://pay.financeops.demo/${String(i + 1).padStart(6, "0")}`,
      paidAt: status === "PAID" ? dateAt(dueOffset - (i % 3)) : null,
      origin: pick(["ERP", "CRM", "Manual", "Contrato"], i), owner: pick(owners, i), category: pick(revenueCategories, i),
    };
    customer.invoiceCount += 1;
    if (status === "PAID") customer.totalPaid += amount; else customer.totalOpen += amount;
    return item;
  });

  const payables = Array.from({ length: 80 }, (_, i) => {
    const supplier = suppliers[i % suppliers.length];
    const dueOffset = (i * 5) % 67 - 27;
    const status: EntryStatus = i % 4 === 0 ? "PAID" : dueOffset < 0 ? "OVERDUE" : i % 7 === 0 ? "APPROVED" : "PENDING";
    const amount = brlRound(950 + ((i * 2317) % 28_000) + (i % 5) * 137.5);
    const item = {
      id: `pay_${String(i + 1).padStart(4, "0")}`, companyId: DEMO_COMPANY_ID,
      supplierId: supplier.id, supplier: supplier.name,
      description: `${pick(expenseCategories, i)} · ${pick(["Contrato", "Fatura", "Serviço", "Licença"], i)}`,
      amount, dueDate: dateAt(dueOffset), status, category: pick(expenseCategories, i),
      costCenter: pick(["Operações", "Produto", "Comercial", "Administrativo", "Pessoas"], i),
      recurrence: supplier.recurrence, owner: pick(owners, i + 1),
      approvedAt: status === "APPROVED" || status === "PAID" ? dateAt(dueOffset - 5) : null,
      paidAt: status === "PAID" ? dateAt(dueOffset) : null,
    };
    if (status === "PAID") supplier.totalPaid += amount; else supplier.totalPending += amount;
    return item;
  });

  const settledReceivables = receivables.filter((item) => item.status === "PAID");
  const settledPayables = payables.filter((item) => item.status === "PAID");
  const bankTransactions = Array.from({ length: 150 }, (_, i) => {
    const credit = i % 2 === 0;
    const candidate = credit ? settledReceivables[i % settledReceivables.length] : settledPayables[i % settledPayables.length];
    const variant = i % 10;
    const status = variant < 5 ? "MATCHED" : variant === 5 ? "DIVERGENT" : variant === 6 ? "DUPLICATE" : variant < 9 ? "SUGGESTED" : "UNIDENTIFIED";
    const baseAmount = candidate.amount;
    return {
      id: `txn_${String(i + 1).padStart(4, "0")}`, companyId: DEMO_COMPANY_ID,
      postedAt: dateAt(-((i * 3) % 48)), description: credit ? `PIX RECEBIDO ${"customer" in candidate ? candidate.customer : "CLIENTE"}` : `PAGAMENTO ${"supplier" in candidate ? candidate.supplier : "FORNECEDOR"}`,
      amount: status === "DIVERGENT" ? brlRound(baseAmount * 0.97) : baseAmount,
      direction: credit ? "CREDIT" as const : "DEBIT" as const,
      externalId: `BANK-${String(900_000 + i)}`, status: status as import("./types").ReconciliationStatus,
      suggestionId: status === "UNIDENTIFIED" ? null : candidate.id,
      suggestionLabel: status === "UNIDENTIFIED" ? null : candidate.description,
      confidence: status === "UNIDENTIFIED" ? null : status === "MATCHED" ? 99 : status === "DIVERGENT" ? 71 : 88,
    };
  });

  const overdue = receivables.filter((item) => item.status === "OVERDUE");
  const collectionEvents = overdue.slice(0, 38).map((item, i) => ({
    id: `col_${String(i + 1).padStart(4, "0")}`, companyId: DEMO_COMPANY_ID, customer: item.customer,
    receivableId: item.id, invoice: item.description, channel: pick(["E-mail", "WhatsApp simulado", "In-app"], i),
    message: i % 4 === 0 ? "Identificamos um pagamento em atraso. Podemos ajudar com a regularização?" : "Lembrete automático: sua fatura está disponível no link de pagamento.",
    status: i % 9 === 0 ? "Falhou" : "Simulado", sentAt: dateAt(-(i % 12), 9 + (i % 8)), automation: "collection-dunning-v1",
  }));

  const alertTypes = ["Conta vencida", "Cliente inadimplente", "Caixa projetado baixo", "Despesa incomum", "Possível duplicidade", "Pagamento sem aprovação", "Falha em automação", "Conciliação pendente"];
  const alerts = Array.from({ length: 24 }, (_, i) => ({
    id: `alt_${String(i + 1).padStart(3, "0")}`, companyId: DEMO_COMPANY_ID,
    type: pick(alertTypes, i), severity: pick<Severity>(["CRITICAL", "HIGH", "MEDIUM", "LOW"], i),
    status: i % 6 === 0 ? "RESOLVED" as const : "OPEN" as const,
    description: `${pick(alertTypes, i)} detectado pela rotina automática e aguardando análise financeira.`,
    entityType: i % 2 ? "receivable" : "bank_transaction", entityId: i % 2 ? overdue[i % overdue.length].id : bankTransactions[i].id,
    createdAt: dateAt(-(i % 9), 8 + (i % 10)),
  }));

  const automationRuns = ["collection", "alerts", "cashflow", "reconciliation"].flatMap((name, group) =>
    Array.from({ length: 4 }, (_, i) => ({
      id: `run_${group}_${i}`, companyId: DEMO_COMPANY_ID, name, status: group === 1 && i === 3 ? "FAILED" : "SUCCESS",
      startedAt: dateAt(-i - group, 6 + group), finishedAt: dateAt(-i - group, 6 + group), processed: 18 + group * 12 + i,
      summary: `${18 + group * 12 + i} registros analisados`,
    })),
  );

  const auditLogs = Array.from({ length: 42 }, (_, i) => ({
    id: `audit_${String(i + 1).padStart(3, "0")}`, companyId: DEMO_COMPANY_ID,
    action: pick(["SEED_IMPORTED", "LOGIN_DEMO", "STATUS_UPDATED", "COLLECTION_SIMULATED", "RECONCILIATION_CONFIRMED", "ALERT_CREATED", "PAYMENT_APPROVED"], i),
    entityType: pick(["system", "user", "receivable", "collection_event", "bank_transaction", "financial_alert", "payable"], i),
    entityId: i % 3 ? `entity_${i + 1}` : null, actor: pick(["Sistema", ...owners], i), createdAt: dateAt(-(i % 14), 8 + (i % 9)), metadata: "Ação registrada para auditoria da empresa demo.",
  }));

  return {
    company: { id: DEMO_COMPANY_ID, name: "Outbox Tech Demo", document: "48.320.715/0001-42", currentBalance: 487_350.8, lowCashThreshold: 120_000 },
    users: [
      { id: "usr_admin", name: "Ana Admin", email: "admin@financeops.demo", role: "admin" },
      { id: "usr_fin", name: "Fábio Financeiro", email: "financeiro@financeops.demo", role: "financeiro" },
      { id: "usr_apr", name: "Aline Aprovadora", email: "aprovador@financeops.demo", role: "aprovador" },
      { id: "usr_view", name: "Vitor Viewer", email: "viewer@financeops.demo", role: "visualizador" },
      { id: "usr_audit", name: "Carla Auditoria", email: "auditoria@financeops.demo", role: "visualizador" },
    ], customers, suppliers, receivables, payables, bankTransactions, collectionEvents, alerts, automationRuns, auditLogs,
  };
}

export const millisPerDay = DAY;
