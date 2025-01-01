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

import { useRouter } from 'next/navigation'
import { Recipe } from '#/recipes'

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
  const router = useRouter()
  const [suggestions, setSuggestions] = useState<
    Array<{ id: number; title: string }>
  >([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = () => {
    if (value === '') {
      toast({
        description: '请输入菜名',
        variant: 'destructive',
      })
      return
    }
    setContent('')
    setSuggestions([])
    setIsLoading(true)

    Promise.all([fetchCookingTutorial(value), fetchImage()]).finally(() => {
      setIsLoading(false)
    })
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
    try {
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
    } catch (error) {
      toast({
        description: '生成菜谱失败，请重试',
        variant: 'destructive',
      })
      throw error
    }
  }
  const fetchSuggestions: (search: string) => Promise<void> = async (
    search
  ) => {
    if (!search) {
      setSuggestions([])
      return
    }

    try {
      const res = await fetch(
        `/api/recipes?search=${encodeURIComponent(search)}&page=${1}&size=${3}`
      )
      const data = (await res.json()) as any
      if (data.code === 0) {
        setSuggestions(data.data.list)
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="mx-auto max-w-4xl pt-20">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-bold text-gray-900">AI智能菜谱</h1>
          <p className="text-gray-600">
            输入菜名，获取详细的烹饪步骤和美食图片
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="min-w-0 flex-1">
              <Input
                placeholder="请输入想做的菜名..."
                className="w-full text-lg"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  fetchSuggestions(e.target.value)
                }}
                onKeyUp={handleKeyUp}
              />
              {suggestions.length > 0 && (
                <div className="mt-2 space-y-1">
                  {suggestions.slice(0, 3).map((suggestion) => (
                    <div
                      key={suggestion.id}
                      onClick={() => {
                        router.push(`/cooking/list/${suggestion.id}`)
                      }}
                      className="cursor-pointer rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {suggestion.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button
                onClick={handleGenerate}
                className="min-w-[120px] flex-1 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 sm:flex-none"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    生成中...
                  </>
                ) : (
                  '生成菜谱'
                )}
              </Button>
              <Link href="/cooking/list">
                <Button variant="outline" className="px-3">
                  <BookAudio className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {content && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{value}</h2>
                <Button
                  onClick={() => handleSave(false)}
                  variant="ghost"
                  className="hover:bg-gray-100"
                >
                  <Save className="mr-2 h-5 w-5" />
                  保存菜谱
                </Button>
              </div>
              <div
                className="markdown-body prose max-w-none rounded-lg border border-gray-200 bg-white p-6"
                dangerouslySetInnerHTML={{
                  __html: marked(content),
                }}
              />
            </div>
          )}
        </div>
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
