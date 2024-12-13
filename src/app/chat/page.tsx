"use client"

import { useEffect } from "react"

export default function Chat() {
  useEffect(() => {
    fetch("/api/socket")
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
      })
  }, [])

  return <div>聊天室</div>
}
