import { ok } from "@/lib/api";
import { getStore } from "@/lib/store";
export async function GET() { const db = getStore(); return ok({ audit: db.auditLogs, automations: db.automationRuns, collections: db.collectionEvents }); }
