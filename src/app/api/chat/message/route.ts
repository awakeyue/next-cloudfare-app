import { NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"

export function GET() {
  const db = getRequestContext().env.DB
  const res = db.prepare("SELECT * FROM messages").run()
  return NextResponse.json({ route: "message" })
}
