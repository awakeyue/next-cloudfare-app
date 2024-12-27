'use client'

import { Recipe } from '#/recipes'
import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

export default function Page() {
  const [list, setList] = useState<Recipe[]>([])

  const getData = async () => {
    const res = await fetch('/api/recipes')
    const data = (await res.json()) as any
    if (data.code === 0) {
      setList(data.data)
    }
  }
  useEffect(() => {
    getData()
  }, [])
  return (
    <div className="flex flex-wrap p-4">
      {list.map((item) => (
        <div
          key={item.id}
          className="w-1/2 p-2 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6"
        >
          <Card>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              {/* <CardDescription>输入菜名，自动生成做菜步骤</CardDescription> */}
            </CardHeader>
            <CardContent>
              <div>
                {item.image_url && (
                  <Image
                    src={item.image_url}
                    width={0}
                    height={0}
                    sizes="100vw"
                    alt=""
                    className="h-auto w-full object-contain"
                  ></Image>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <p className="flex w-full justify-end">
                <Button>
                  <Link href={'/cooking/list/' + item.id}>查看</Link>
                </Button>
              </p>
            </CardFooter>
          </Card>
        </div>
      ))}
    </div>
  )
}
