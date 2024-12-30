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
import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

function ListSkeleton() {
  return (
    <div className="flex flex-wrap p-4">
      {[...Array(12)].map((item, index) => (
        <div
          key={index}
          className="flex w-1/2 flex-col gap-2 p-2 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6"
        >
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      ))}
    </div>
  )
}

export default function Page() {
  const [list, setList] = useState<Recipe[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [curRecipe, setCurRecipe] = useState<Recipe | null>(null)
  const { toast } = useToast()

  const deleteRecipe = async () => {
    if (!curRecipe) {
      return
    }
    const res = await fetch('/api/recipes/' + curRecipe.id, {
      method: 'DELETE',
    })
    const data = (await res.json()) as any
    if (data.code === 0) {
      toast({
        description: '删除成功',
        variant: 'default',
      })
      setOpen(false)
      getData()
    } else {
      toast({
        description: '删除失败',
        variant: 'destructive',
      })
    }
  }

  const getData = async () => {
    setLoading(true)
    const res = await fetch('/api/recipes')
    const data = (await res.json()) as any
    if (data.code === 0) {
      setList(data.data)
    }
    setLoading(false)
  }
  useEffect(() => {
    getData()
  }, [])
  return (
    <>
      {loading && <ListSkeleton />}
      {!loading && (
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
                  <p className="flex w-full justify-end gap-2">
                    <Button
                      variant="link"
                      onClick={() => {
                        setCurRecipe(item)
                        setOpen(true)
                      }}
                    >
                      <Trash2 />
                      删除
                    </Button>

                    <Button>
                      <Link href={'/cooking/list/' + item.id}>查看</Link>
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>提示</DialogTitle>
            <DialogDescription>
              你确定要删除【{curRecipe?.title}】吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={deleteRecipe}>确定</Button>
          </DialogFooter>
        </DialogContent>
        <DialogClose />
      </Dialog>
    </>
  )
}
