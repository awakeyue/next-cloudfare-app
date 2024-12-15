'use client'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { ReactTyped } from 'react-typed'

export default function Page() {
  const [text, setText] = useState<string[]>([])
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const input = e.target as HTMLInputElement
      const value = input.value
      fetchCookingTutorial(value)
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
            content: `好的，现在开始，你说一个菜名，我会给你回复这道菜的制作步骤`,
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
      const valueString = chunkValue.slice(5)
      try {
        const data = JSON.parse(valueString)
        const message = data.choices[0].delta.content
        setText((prev) => [...prev, message])
      } catch (error) {
        console.log('json 解析失败', error)
      }
    }
  }
  return (
    <div className="flex justify-center">
      <div className="mt-[20vh] flex w-[90vw] flex-col md:w-[50vw]">
        <h2 className="typing mb-5 text-2xl font-bold">
          <ReactTyped
            strings={['AI菜谱，自动为您生成做菜步骤，让烹饪变得更简单']}
            typeSpeed={60}
            backSpeed={20}
            backDelay={2000}
            loop
          ></ReactTyped>
        </h2>
        <div>
          <Input placeholder="请输入菜名" onKeyUp={handleKeyUp}></Input>
        </div>
        <div>
          <ReactTyped strings={text} typeSpeed={60}></ReactTyped>
        </div>
      </div>
    </div>
  )
}
