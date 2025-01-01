'use client'

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

export default function Home() {
  return (
    <main className="container mx-auto min-h-screen p-4">
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">AI菜谱</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              输入菜名，自动生成做菜步骤
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Image
                src={'/images/cooking.webp'}
                width={250}
                height={250}
                alt="cooking"
                className="h-[200px] w-[200px] rounded-lg object-cover sm:h-[250px] sm:w-[250px]"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Link href={'/cooking'} className="w-full">
              <Button className="w-full">立即体验</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
