import { NextResponse } from "next/server";

export function ok<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json({ success: true, data, meta });
}

export function fail(message: string, status = 400, code = "BAD_REQUEST") {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}
