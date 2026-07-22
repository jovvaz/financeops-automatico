import { ok } from "@/lib/api";
import { listReceivables } from "@/lib/services";
export async function GET(request: Request) { const params = new URL(request.url).searchParams; const data = listReceivables(params); return ok(data, { total: data.length }); }
