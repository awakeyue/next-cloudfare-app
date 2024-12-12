import { NextResponse, type NextRequest } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  const { env } = getRequestContext()
  const db = env.DB
  const res = await db.prepare("SELECT * FROM users").run()
  return NextResponse.json(res)
}
