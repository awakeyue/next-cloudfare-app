import { Recipe } from '#/recipes'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getRequestContext().env.DB
    const { id } = params
    const res = await db
      .prepare('SELECT * FROM recipes WHERE id = ?')
      .bind(id)
      .first()
    return NextResponse.json({
      code: 0,
      data: res,
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ code: -1, error: 'Failed to fetch recipes' })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { title, content, image_url = '' }: Recipe = await req.json()
    const db = getRequestContext().env.DB
    const { id } = params
    const obj = { title, content, image_url }
    const updateValues = Object.keys(obj)
      .map((key) => `${key} = ?`)
      .join(', ')
    const res = await db
      .prepare(`UPDATE recipes SET ${updateValues} WHERE id =?`)
      .bind(...Object.values(obj), id)
      .run()

    return NextResponse.json({
      code: 0,
      data: res.results,
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ code: -1, error: 'Failed to fetch recipes' })
  }
}
