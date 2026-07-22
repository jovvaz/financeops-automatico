export type EntryStatus = "PENDING" | "APPROVED" | "PAID" | "OVERDUE" | "CANCELLED";
export type AlertStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ReconciliationStatus = "PENDING" | "SUGGESTED" | "MATCHED" | "IGNORED" | "DIVERGENT" | "DUPLICATE" | "UNIDENTIFIED";

export interface Customer { id: string; companyId: string; name: string; document: string; email: string; phone: string; company: string; riskScore: number; totalOpen: number; totalPaid: number; invoiceCount: number; history: string; }
export interface Supplier { id: string; companyId: string; name: string; document: string; category: string; totalPaid: number; totalPending: number; recurrence: string; history: string; }
export interface Receivable { id: string; companyId: string; customerId: string; customer: string; description: string; amount: number; dueDate: string; status: EntryStatus; paymentMethod: string; paymentLink: string; paidAt: string | null; origin: string; owner: string; category: string; }
export interface Payable { id: string; companyId: string; supplierId: string; supplier: string; description: string; amount: number; dueDate: string; status: EntryStatus; category: string; costCenter: string; recurrence: string; owner: string; approvedAt: string | null; paidAt: string | null; }
export interface BankTransaction { id: string; companyId: string; postedAt: string; description: string; amount: number; direction: "CREDIT" | "DEBIT"; externalId: string; status: ReconciliationStatus; suggestionId: string | null; suggestionLabel: string | null; confidence: number | null; }
export interface CollectionEvent { id: string; companyId: string; customer: string; receivableId: string; invoice: string; channel: string; message: string; status: string; sentAt: string; automation: string; }
export interface FinancialAlert { id: string; companyId: string; type: string; severity: Severity; status: AlertStatus; description: string; entityType: string; entityId: string | null; createdAt: string; }
export interface AutomationRun { id: string; companyId: string; name: string; status: string; startedAt: string; finishedAt: string; processed: number; summary: string; }
export interface AuditLog { id: string; companyId: string; action: string; entityType: string; entityId: string | null; actor: string; createdAt: string; metadata: string; }
export interface CashflowPoint { date: string; label: string; expectedIn: number; expectedOut: number; projectedBalance: number; }

export interface DemoDatabase {
  company: { id: string; name: string; document: string; currentBalance: number; lowCashThreshold: number };
  users: { id: string; name: string; email: string; role: string }[];
  customers: Customer[];
  suppliers: Supplier[];
  receivables: Receivable[];
  payables: Payable[];
  bankTransactions: BankTransaction[];
  collectionEvents: CollectionEvent[];
  alerts: FinancialAlert[];
  automationRuns: AutomationRun[];
  auditLogs: AuditLog[];
}
