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
  { params: { id } }: { params: { id: string } }
) {
  try {
    const data = (await req.json()) as Recipe
    const db = getRequestContext().env.DB

    const validFields = ['title', 'content', 'image_url'] as const
    // title不能重名
    const titleExists = await db
      .prepare('SELECT * FROM recipes WHERE title = ? AND id != ?')
      .bind(data.title, id)
      .first()
    if (titleExists) {
      return NextResponse.json({
        code: -1,
        error: '菜谱名称已存在',
      })
    }
    const updates = validFields
      .filter((k) => data[k] !== undefined)
      .map((key) => ({ key, value: data[key] }))
    if (!updates.length) {
      return NextResponse.json({
        code: -1,
        error: 'No valid fields provided',
      })
    }
    const query = `
      UPDATE recipes 
      SET ${updates.map(({ key }) => `${key} = ?`).join(', ')}
      WHERE id = ?
    `
    const res = await db
      .prepare(query)
      .bind(...updates.map(({ value }) => value), id)
      .run()
    console.log(res)
    return NextResponse.json({
      code: 0,
      message: '更新成功',
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ code: -1, error: 'Failed to fetch recipes' })
  }
}

export async function DELETE(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  try {
    const db = getRequestContext().env.DB
    const res = await db
      .prepare('DELETE FROM recipes WHERE id = ?')
      .bind(id)
      .run()
    return NextResponse.json({
      code: 0,
      message: '删除成功',
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ code: -1, error: 'Failed to fetch recipes' })
  }
}
