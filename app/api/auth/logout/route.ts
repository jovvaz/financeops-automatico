import { cookies } from "next/headers";
import { ok } from "@/lib/api";
export async function POST() { const jar = await cookies(); jar.delete("financeops_demo_session"); return ok({ loggedOut: true }); }
