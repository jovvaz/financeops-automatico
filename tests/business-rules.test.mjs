import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Prisma schema contains every required tenant-scoped model", async () => {
  const schema = await readFile(new URL("../prisma/schema.prisma", import.meta.url), "utf8");
  const models = ["Company", "User", "Role", "Customer", "Supplier", "FinancialAccount", "Receivable", "Payable", "Payment", "BankTransaction", "ReconciliationMatch", "CollectionRule", "CollectionEvent", "CashflowSnapshot", "FinancialAlert", "AutomationRun", "AuditLog", "Integration"];
  for (const model of models) assert.match(schema, new RegExp(`model ${model} \\{`));
  assert.match(schema, /companyId\s+String/);
});

test("seed contract contains requested record volumes and demo users", async () => {
  const seed = await readFile(new URL("../lib/demo-data.ts", import.meta.url), "utf8");
  assert.match(seed, /length: 100/); assert.match(seed, /length: 80/); assert.match(seed, /length: 150/);
  for (const email of ["admin@financeops.demo", "financeiro@financeops.demo", "aprovador@financeops.demo", "viewer@financeops.demo"]) assert.match(seed, new RegExp(email));
});
