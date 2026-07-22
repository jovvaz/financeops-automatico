import { fail, ok } from "@/lib/api";
import { updatePayable } from "@/lib/services";
import { z } from "zod";
const schema = z.object({ status: z.enum(["PENDING", "APPROVED", "PAID", "OVERDUE", "CANCELLED"]) });
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) { const parsed = schema.safeParse(await request.json()); if (!parsed.success) return fail("Status inválido", 422, "VALIDATION_ERROR"); const { id } = await context.params; const item = updatePayable(id, parsed.data.status); return item ? ok(item) : fail("Conta a pagar não encontrada", 404, "NOT_FOUND"); }
