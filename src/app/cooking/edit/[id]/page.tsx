'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import MDEditor from '@uiw/react-md-editor'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
            编辑食谱
          </h1>
          <div className="flex items-center space-x-3">
            <Link replace href="/cooking/list" className="inline-flex">
              <Button
                variant="outline"
                className="w-full hover:bg-gray-100"
                type="button"
              >
                取消
              </Button>
            </Link>
            <Button onClick={handleSave} className="">
              保存
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-6 rounded-xl bg-white p-6 shadow-lg">
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              标题
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入食谱标题"
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              内容
            </label>
            <div className="min-h-[500px] rounded-lg border">
              <MDEditor
                value={content}
                onChange={(text) => handleChange(text ? text : '')}
                height="100%"
                className="!border-0"
              />
            </div>
          </div>

          {imageUrl && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                预览图
              </label>
              <img
                src={imageUrl}
                alt="Recipe preview"
                className="h-48 w-full rounded-lg object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
