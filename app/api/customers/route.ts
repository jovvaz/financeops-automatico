import { ok } from "@/lib/api";
import { getStore } from "@/lib/store";
export async function GET() { return ok(getStore().customers, { total: getStore().customers.length }); }
