import { ok } from "@/lib/api";
import { listPayables } from "@/lib/services";
export async function GET(request: Request) { const params = new URL(request.url).searchParams; const data = listPayables(params); return ok(data, { total: data.length }); }
