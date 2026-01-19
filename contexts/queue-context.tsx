"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Queue } from "@/lib/types"
import { mockQueues } from "@/lib/mock-data"

interface QueueContextType {
  queues: Queue[]
  addQueue: (queue: Omit<Queue, "id" | "createdAt" | "applicationCount">) => void
  updateQueue: (id: string, updates: Partial<Queue>) => void
  deleteQueue: (id: string) => void
}

const QueueContext = createContext<QueueContextType | undefined>(undefined)

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [queues, setQueues] = useState<Queue[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("queues")
    if (stored) {
      setQueues(JSON.parse(stored))
    } else {
      setQueues(mockQueues)
    }
  }, [])

  useEffect(() => {
    if (queues.length > 0) {
      localStorage.setItem("queues", JSON.stringify(queues))
    }
  }, [queues])

  const addQueue = (queue: Omit<Queue, "id" | "createdAt" | "applicationCount">) => {
    const newQueue: Queue = {
      ...queue,
      id: `Q-${Date.now()}`,
      applicationCount: 0,
      createdAt: new Date().toISOString(),
    }
    setQueues((prev) => [...prev, newQueue])
  }

  const updateQueue = (id: string, updates: Partial<Queue>) => {
    setQueues((prev) => prev.map((queue) => (queue.id === id ? { ...queue, ...updates } : queue)))
  }

  const deleteQueue = (id: string) => {
    setQueues((prev) => prev.filter((queue) => queue.id !== id))
  }

  return (
    <QueueContext.Provider value={{ queues, addQueue, updateQueue, deleteQueue }}>{children}</QueueContext.Provider>
  )
}

export const useQueues = () => {
  const context = useContext(QueueContext)
  if (!context) throw new Error("useQueues must be used within QueueProvider")
  return context
}
