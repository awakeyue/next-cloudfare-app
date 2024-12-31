'use client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRef, useState } from 'react'
import { marked } from 'marked'
import './markdown.css'
import { BookAudio, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ApiResponse {
  code: number
  data?: {
    updated?: boolean
    exists?: boolean
    id?: number
  }
  error?: string
}

export default function Page() {
  const [value, setValue] = useState('')
  const [content, setContent] = useState('')
  const [imgUrl, setImgUrl] = useState('')
  const { toast } = useToast()
  const [showReplaceAlert, setShowReplaceAlert] = useState(false)
  const [pendingRecipe, setPendingRecipe] = useState<{
    title: string
    content: string
    image_url: string
  } | null>(null)

  const handleGenerate = () => {
    setContent('')
    fetchCookingTutorial(value)
    fetchImage()
  }
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGenerate()
    }
  }
  const handleSave = async (force: boolean = false) => {
    const recipeData = {
      title: value,
      content,
      image_url: imgUrl,
    }

    try {
      const res = await fetch(`/api/recipes${force ? '?force=true' : ''}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData),
      })

      const data = (await res.json()) as ApiResponse

      if (data.code === 0) {
        toast({
          description: data.data?.updated ? '菜谱更新成功' : '菜谱创建成功',
          variant: 'default',
        })
      } else if (data.code === -1 && data.data?.exists) {
        // 菜名重复的情况
        setPendingRecipe(recipeData)
        setShowReplaceAlert(true)
      } else {
        toast({
          description: data.error || '保存失败',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        description: '保存失败',
        variant: 'destructive',
      })
    }
  }
  const handleReplaceConfirm = async () => {
    if (pendingRecipe) {
      await handleSave(true)
      setShowReplaceAlert(false)
      setPendingRecipe(null)
    }
  }
  const fetchImage = async () => {
    const res = await fetch(process.env.NEXT_PUBLIC_AI_API_URL_IMG, {
      method: 'POST',
      body: JSON.stringify({
        model: 'Cogview-3-Flash',
        prompt: value,
        size: '1344x768',
      }),
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })
    const data = (await res.json()) as any
    const url = data.data?.[0]?.url
    if (url) {
      setContent((content) => {
        return `![${value}](${url})\n\n` + content
      })
      setImgUrl(url)
    }
  }
  const fetchCookingTutorial = async (value: string) => {
    const response = await fetch(process.env.NEXT_PUBLIC_AI_API_URL, {
      method: 'POST',
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          {
            role: 'user',
            content:
              '现在开始，你是一个大厨，只要我输入任何一个菜名，你都会给我回复这道菜的制作步骤',
          },
          {
            role: 'system',
            content: `好的，现在开始，你说一个菜名，我会给你回复这道菜详细的制作步骤和注意事项`,
          },
          {
            role: 'user',
            content: `${value}`,
          },
        ],
        stream: true,
      }),
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader?.read()
      if (done) {
        console.log('Done', value)
        break
      }
      const chunkValue = decoder.decode(value)
      const splitLines = chunkValue.split('\n').filter((item) => item !== '')
      for (const line of splitLines) {
        const dataString = line.split('data:')[1]
        if (dataString.trim() === '[DONE]') {
          break
        }
        try {
          const data = JSON.parse(dataString)
          setContent((content) => {
            const newContent = content + data.choices[0].delta.content
            return newContent
          })
        } catch (error) {
          console.log('json 解析失败', error)
        }
      }
    }
  }
  return (
    <div className="flex justify-center">
      <div className="mt-[20vh] flex w-[90vw] flex-col md:w-[50vw]">
        <h2 className="typing mb-5 text-2xl font-bold">
          AI菜谱，自动为您生成做菜步骤，让烹饪变得更简单
        </h2>
        <div className="flex gap-2">
          <Input
            placeholder="请输入菜名"
            onChange={(e) => setValue(e.target.value)}
            onKeyUp={handleKeyUp}
          ></Input>
          <Button variant={'ghost'}>
            <Link href={'/cooking/list'}>
              <BookAudio />
            </Link>
          </Button>
          <Button onClick={handleGenerate}>生成菜谱</Button>
        </div>
        {content && (
          <div className="my-4">
            <div className="mb-1 flex justify-end">
              <Button
                size={'sm'}
                variant={'ghost'}
                onClick={() => handleSave(false)}
              >
                <Save />
              </Button>
            </div>
            <div
              className="markdown-body rounded-md border border-solid border-gray-200 p-4"
              dangerouslySetInnerHTML={{
                __html: marked(content),
              }}
            ></div>
          </div>
        )}
      </div>

      <AlertDialog open={showReplaceAlert} onOpenChange={setShowReplaceAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>菜谱名称已存在</AlertDialogTitle>
            <AlertDialogDescription>
              已存在同名菜谱【{pendingRecipe?.title}】，是否要替换原有内容？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowReplaceAlert(false)
                setPendingRecipe(null)
              }}
            >
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleReplaceConfirm}>
              确认替换
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
