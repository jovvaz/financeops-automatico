import { ok } from "@/lib/api";
import { getStore } from "@/lib/store";
export async function GET(request: Request) { const status = new URL(request.url).searchParams.get("status"); const data = getStore().alerts.filter((item) => !status || item.status === status); return ok(data, { total: data.length }); }
