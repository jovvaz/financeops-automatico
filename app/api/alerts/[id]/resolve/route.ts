import { fail, ok } from "@/lib/api";
import { resolveAlert } from "@/lib/services";
export async function POST(_: Request, context: { params: Promise<{ id: string }> }) { const { id } = await context.params; const item = resolveAlert(id); return item ? ok(item) : fail("Alerta não encontrado", 404, "NOT_FOUND"); }
