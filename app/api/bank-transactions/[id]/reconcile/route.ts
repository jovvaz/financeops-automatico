import { fail, ok } from "@/lib/api";
import { confirmReconciliation } from "@/lib/services";
import { z } from "zod";
const schema = z.object({ action: z.enum(["confirm", "ignore"]) });
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { const parsed = schema.safeParse(await request.json()); if (!parsed.success) return fail("Ação inválida", 422, "VALIDATION_ERROR"); const { id } = await context.params; const item = confirmReconciliation(id, parsed.data.action); return item ? ok(item) : fail("Transação não encontrada", 404, "NOT_FOUND"); }
