'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import MDEditor from '@uiw/react-md-editor'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { marked } from 'marked'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface Recipe {
  id: string
  title: string
  content: string
}

export default function EditPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const { toast } = useToast()
  const params = useParams()
  const id = params.id as string

  // 获取数据
  const getData = async (id: string) => {
    const res = await fetch('/api/recipes/' + id)
    const data = (await res.json()) as any
    if (data.code === 0) {
      const recipe = data.data as Recipe
      setTitle(recipe.title)
      setContent(recipe.content)
    }
  }

  // 保存数据
  const handleSave = async () => {
    const res = await fetch('/api/recipes/' + id, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content, image_url: imageUrl }),
    })
    const data = (await res.json()) as any
    if (data.code === 0) {
      toast({
        description: '保存成功',
        variant: 'default',
      })
    }
  }

  const handleChange = (text: string) => {
    setContent(text)
    const regex = /!\[.*?\]\((.*?)\)/
    const match = text.match(regex)
    setImageUrl(match ? match[1] : '')
  }

  useEffect(() => {
    getData(id)
  }, [])

  return (
    <div className="flex h-[100vh] flex-col items-center bg-gray-50 p-6">
      <div className="flex h-full w-full flex-col md:w-[80vw] lg:w-[70vw]">
        <h1 className="mb-4 text-xl font-bold text-gray-800">Edit Recipe</h1>

        <div className="flex min-h-0 flex-1 flex-col gap-4 rounded-lg bg-white p-6 shadow-md">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Recipe Title"
            className="w-full"
          />

          <div className="min-h-0 flex-1 gap-6 overflow-y-auto rounded-lg">
            {
              <MDEditor
                value={content}
                onChange={(text) => handleChange(text ? text : '')}
                height={'100%'}
              />
            }
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Button variant="outline">
              <Link replace href="/cooking/list">
                取消
              </Link>
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
