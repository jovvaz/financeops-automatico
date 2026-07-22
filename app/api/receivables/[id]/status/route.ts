import { fail, ok } from "@/lib/api";
import { updateReceivable } from "@/lib/services";
import { z } from "zod";
const schema = z.object({ status: z.enum(["PENDING", "APPROVED", "PAID", "OVERDUE", "CANCELLED"]) });
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) { const parsed = schema.safeParse(await request.json()); if (!parsed.success) return fail("Status inválido", 422, "VALIDATION_ERROR"); const { id } = await context.params; const item = updateReceivable(id, parsed.data.status); return item ? ok(item) : fail("Recebível não encontrado", 404, "NOT_FOUND"); }
