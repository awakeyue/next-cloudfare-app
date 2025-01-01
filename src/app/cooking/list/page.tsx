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
import { Trash2, Home, Search } from 'lucide-react'
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
import { Input } from '@/components/ui/input'

function ListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {[...Array(12)].map((item, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="aspect-square w-full" />
        </div>
      ))}
    </div>
  )
}

interface PaginationData {
  current: number
  pageSize: number
  total: number
}

interface ApiResponse {
  code: number
  data: {
    list: Recipe[]
    pagination: PaginationData
  }
  message: string
}

export default function Page() {
  const [list, setList] = useState<Recipe[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [curRecipe, setCurRecipe] = useState<Recipe | null>(null)
  const [pagination, setPagination] = useState<PaginationData>({
    current: 1,
    pageSize: 20,
    total: 0,
  })
  const [keyword, setKeyword] = useState('')
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

  const getData = async (page: number = 1, searchKeyword: string = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: pagination.pageSize.toString(),
        search: searchKeyword,
      })

      const res = await fetch(`/api/recipes?${params.toString()}`)
      const data = (await res.json()) as ApiResponse
      if (data.code === 0) {
        setList(data.data.list)
        setPagination(data.data.pagination)
      }
    } catch (error) {
      toast({
        description: '获取菜谱列表失败',
        variant: 'destructive',
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    getData()
  }, [])

  const handlePageChange = (page: number) => {
    getData(page)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white/80 py-2 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4">
          <Link replace href="/cooking">
            <Button variant="ghost">
              <Home className="mr-1 h-4 w-4" />
              返回首页
            </Button>
          </Link>

          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              className="pl-10"
              placeholder="搜索菜谱..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
              }}
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  getData(1, keyword)
                }
              }}
            />
          </div>
        </div>
      </div>

      {loading && <ListSkeleton />}
      {!loading && (
        <>
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {list.map((item) => (
              <Card key={item.id} className="flex flex-col">
                <CardHeader className="flex-none">
                  <CardTitle
                    className="line-clamp-1 text-lg"
                    title={item.title}
                  >
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="overflow-hidden rounded-md bg-gray-100">
                    {item.image_url && (
                      <Image
                        src={item.image_url}
                        width={0}
                        height={0}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        alt={item.title}
                        placeholder="empty"
                        className="aspect-square h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex-none">
                  <div className="flex w-full items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => {
                        setCurRecipe(item)
                        setOpen(true)
                      }}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      删除
                    </Button>
                    <Link href={'/cooking/edit/' + item.id}>
                      <Button variant="outline" size="sm">
                        编辑
                      </Button>
                    </Link>
                    <Link href={'/cooking/list/' + item.id}>
                      <Button size="sm">查看</Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="flex justify-center py-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={pagination.current === 1}
                onClick={() => handlePageChange(pagination.current - 1)}
              >
                上一页
              </Button>
              <div className="flex items-center px-4">
                第 {pagination.current} 页 / 共{' '}
                {Math.ceil(pagination.total / pagination.pageSize)} 页
              </div>
              <Button
                variant="outline"
                disabled={
                  pagination.current >=
                  Math.ceil(pagination.total / pagination.pageSize)
                }
                onClick={() => handlePageChange(pagination.current + 1)}
              >
                下一页
              </Button>
            </div>
          </div>
        </>
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
    </div>
  )
}
