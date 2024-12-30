'use client' // 声明为客户端组件
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'
import '../../markdown.css' // 引入 Markdown 样式
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { marked } from 'marked'
import { useToast } from '@/hooks/use-toast'

interface Recipe {
  id: string
  title: string
  content: string
}

export default function EditPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const editor = useRef<MdEditor>(null)
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
      editor.current?.setText(recipe.content)
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

  const handleChange = ({ html, text }: { html: string; text: string }) => {
    setContent(text)
    const regex = /<img [^>]*src="([^"]+)"/i
    const match = html.match(regex)
    setImageUrl(match ? match[1] : '')
  }

  useEffect(() => {
    if (id) {
      getData(id)
    }
  }, [id])

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
            {content && (
              <MdEditor
                ref={editor}
                renderHTML={(text) => marked(text)}
                onChange={handleChange}
                style={{ height: '100%' }}
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Button variant="outline">取消</Button>
            <Button onClick={handleSave}>保存</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
