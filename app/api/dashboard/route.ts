import { ok } from "@/lib/api";
import { getDashboard } from "@/lib/services";
export async function GET() { return ok(getDashboard()); }
