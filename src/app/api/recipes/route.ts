import { NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { Recipe } from '#/recipes'
import { z } from 'zod'

export const runtime = 'edge'

// GET /api/recipes - 获取所有菜谱列表
export async function GET() {
  try {
    const db = getRequestContext().env.DB
    const res = await db.prepare('SELECT * FROM recipes').all()
    return NextResponse.json({
      code: 0,
      data: res.results,
      message: 'Recipes fetched successfully',
    })
  } catch (error) {
    return NextResponse.json({ code: -1, error: 'Failed to fetch recipes' })
  }
}

// POST /api/recipes - 创建新菜谱
const RecipeSchema = z.object({
  title: z.string(),
  content: z.string(),
  image_url: z.string().optional(),
})
export async function POST(request: Request) {
  try {
    const { title, content, image_url = '' }: Recipe = await request.json()
    if (!title || !content) {
      return NextResponse.json({
        code: -1,
        error: 'Title and content are required',
      })
    }

    const db = getRequestContext().env.DB
    // title不能重名
    const titleExists = await db
      .prepare('SELECT * FROM recipes WHERE title = ?')
      .bind(title)
      .first()
    if (titleExists) {
      return NextResponse.json({
        code: -1,
        error: '菜谱名称已存在',
      })
    }
    const res = await db
      .prepare(
        'INSERT INTO recipes (title, content, image_url) VALUES (?, ?, ?)'
      )
      .bind(title, content, image_url)
      .run()
    return NextResponse.json({
      code: 0,
      data: {
        id: res.meta.last_row_id,
      },
      message: 'Recipe created successfully',
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ code: -1, error: 'Failed to create recipe' })
  }
}
