'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ButtonDemo() {
  return <Button>Button</Button>;
}

import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex  flex-wrap p-4">
      <Card>
        <CardHeader>
          <CardTitle>AI菜谱</CardTitle>
          <CardDescription>输入菜名，自动生成做菜步骤</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Image
              src={'/images/cooking.webp'}
              width={250}
              height={250}
              alt="cooking"
            ></Image>
          </div>
        </CardContent>
        <CardFooter>
          <p className="flex w-full justify-end">
            <Button>
              <Link href={'/cooking'}>立即体验</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
