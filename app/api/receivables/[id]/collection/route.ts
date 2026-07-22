import { fail, ok } from "@/lib/api";
import { simulateCollection } from "@/lib/services";
export async function POST(_: Request, context: { params: Promise<{ id: string }> }) { const { id } = await context.params; const event = simulateCollection(id); return event ? ok(event) : fail("Recebível não encontrado", 404, "NOT_FOUND"); }
