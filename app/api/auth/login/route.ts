import { cookies } from "next/headers";
import { z } from "zod";
import { fail, ok } from "@/lib/api";
import { getStore } from "@/lib/store";
const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
export async function POST(request: Request) { const parsed = schema.safeParse(await request.json()); if (!parsed.success) return fail("Credenciais inválidas", 422, "VALIDATION_ERROR"); const user = getStore().users.find((item) => item.email === parsed.data.email); if (!user || parsed.data.password !== "Demo@123") return fail("E-mail ou senha incorretos", 401, "UNAUTHORIZED"); const jar = await cookies(); jar.set("financeops_demo_session", JSON.stringify({ userId: user.id, companyId: getStore().company.id, role: user.role }), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 8, path: "/" }); return ok(user); }
