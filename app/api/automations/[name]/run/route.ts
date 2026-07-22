import { fail, ok } from "@/lib/api";
import { runAutomation } from "@/lib/services";
const names = ["collection", "alerts", "cashflow", "reconciliation"] as const;
export async function POST(_: Request, context: { params: Promise<{ name: string }> }) { const { name } = await context.params; if (!names.includes(name as typeof names[number])) return fail("Automação desconhecida", 404, "NOT_FOUND"); return ok(runAutomation(name as typeof names[number])); }
