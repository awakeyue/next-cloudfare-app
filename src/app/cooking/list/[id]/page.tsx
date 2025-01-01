'use client'
import { marked } from 'marked'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import '../../markdown.css'
import { Recipe } from '#/recipes'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function Page() {
  const [content, setContent] = useState('')
  const params = useParams()
  const router = useRouter()
  const id = params.id

  const getData = async (id: string) => {
    const res = await fetch('/api/recipes/' + id)
    const data = (await res.json()) as any
    const recipe = data.data as Recipe
    if (data.code === 0) {
      setContent(`# ${recipe.title}\n\n` + recipe.content)
    }
  }

  useEffect(() => {
    getData(id as string)
  }, [])

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
      </div>

      <div className="flex justify-center">
        <article
          className="markdown-body w-full max-w-3xl rounded-md border border-solid border-gray-200 p-6"
          dangerouslySetInnerHTML={{
            __html: marked(content),
          }}
        ></article>
      </div>
    </div>
  )
}
