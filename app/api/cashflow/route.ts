import { ok } from "@/lib/api";
import { getCashflow } from "@/lib/services";
export async function GET(request: Request) { const days = Number(new URL(request.url).searchParams.get("days") ?? 30); return ok(getCashflow(Math.min(Math.max(days, 7), 90))); }
