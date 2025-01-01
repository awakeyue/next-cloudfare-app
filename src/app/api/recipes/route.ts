import { NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { Recipe } from '#/recipes'
import { z } from 'zod'

export const runtime = 'edge'

// GET /api/recipes - 获取所有菜谱列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    console.log(search)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('size') || '10')

    const offset = (page - 1) * pageSize

    const db = getRequestContext().env.DB
    let query = 'SELECT * FROM recipes'
    let countQuery = 'SELECT COUNT(*) as total FROM recipes'
    let params: any[] = []
    let countParams: any[] = []

    if (search) {
      query = 'SELECT * FROM recipes WHERE title LIKE ? LIMIT ? OFFSET ?'
      countQuery = 'SELECT COUNT(*) as total FROM recipes WHERE title LIKE ?'
      params = [`%${search}%`, pageSize, offset]
      countParams = [`%${search}%`]
    } else {
      query += ' LIMIT ? OFFSET ?'
      params = [pageSize, offset]
    }

    const [data, total] = await Promise.all([
      db
        .prepare(query)
        .bind(...params)
        .all(),
      db
        .prepare(countQuery)
        .bind(...countParams)
        .first(),
    ])

    return NextResponse.json({
      code: 0,
      data: {
        list: data.results,
        pagination: {
          current: page,
          pageSize,
          total: total?.total || 0,
        },
      },
      message: '获取菜谱列表成功',
    })
  } catch (error) {
    return NextResponse.json({ code: -1, error: '获取菜谱列表失败' })
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
    const { searchParams } = new URL(request.url)
    const forceReplace = searchParams.get('force') === 'true'

    const { title, content, image_url = '' }: Recipe = await request.json()
    if (!title || !content) {
      return NextResponse.json({
        code: -1,
        error: 'Title and content are required',
      })
    }

    const db = getRequestContext().env.DB
    // 检查标题是否存在
    const titleExists = await db
      .prepare('SELECT * FROM recipes WHERE title = ?')
      .bind(title)
      .first()

    if (titleExists) {
      // 如果标题存在且没有强制替换标志，返回错误
      if (!forceReplace) {
        return NextResponse.json({
          code: -1,
          error: '菜谱名称已存在',
          data: {
            exists: true,
            recipeId: titleExists.id,
          },
        })
      }

      // 如果设置了强制替换，则更新现有记录
      const updateRes = await db
        .prepare(
          'UPDATE recipes SET content = ?, image_url = ? WHERE title = ?'
        )
        .bind(content, image_url, title)
        .run()

      return NextResponse.json({
        code: 0,
        data: {
          id: titleExists.id,
          updated: true,
        },
        message: 'Recipe updated successfully',
      })
    }

    // 如果标题不存在，创建新记录
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
        created: true,
      },
      message: 'Recipe created successfully',
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ code: -1, error: 'Failed to create recipe' })
  }
}
