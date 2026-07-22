import { FinanceOpsApp } from "@/components/financeops-app";
import { getDashboard, getCashflow } from "@/lib/services";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function Home() {
  const db = getStore();
  return <FinanceOpsApp initial={{ dashboard: getDashboard(), cashflow: getCashflow(30), customers: db.customers, suppliers: db.suppliers, receivables: db.receivables, payables: db.payables, bankTransactions: db.bankTransactions, collectionEvents: db.collectionEvents, alerts: db.alerts, auditLogs: db.auditLogs, automationRuns: db.automationRuns }} />;
}
