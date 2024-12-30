'use client'
import { marked } from 'marked'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import '../../markdown.css'
import { Recipe } from '#/recipes'

export default function Page() {
  const [content, setContent] = useState('')
  const params = useParams()
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
    <div className="flex flex-col items-center">
      <article
        className="markdown-body rounded-md border border-solid border-gray-200 p-4"
        dangerouslySetInnerHTML={{
          __html: marked(content),
        }}
      ></article>
    </div>
  )
}
