"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Analyst } from "@/lib/types"
import { mockAnalysts } from "@/lib/mock-data"

interface AnalystContextType {
  analysts: Analyst[]
  addAnalyst: (analyst: Omit<Analyst, "id" | "createdAt" | "workload">) => void
  updateAnalyst: (id: string, updates: Partial<Analyst>) => void
  deleteAnalyst: (id: string) => void
}

const AnalystContext = createContext<AnalystContextType | undefined>(undefined)

const ANALYST_DATA_VERSION = "v3"

export function AnalystProvider({ children }: { children: React.ReactNode }) {
  const [analysts, setAnalysts] = useState<Analyst[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("analysts")
    const storedVersion = localStorage.getItem("analystDataVersion")
    
    if (!stored || storedVersion !== ANALYST_DATA_VERSION) {
      setAnalysts(mockAnalysts)
      localStorage.setItem("analysts", JSON.stringify(mockAnalysts))
      localStorage.setItem("analystDataVersion", ANALYST_DATA_VERSION)
    } else {
      setAnalysts(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    if (analysts.length > 0) {
      localStorage.setItem("analysts", JSON.stringify(analysts))
    }
  }, [analysts])

  const addAnalyst = (analyst: Omit<Analyst, "id" | "createdAt" | "workload">) => {
    const newAnalyst: Analyst = {
      ...analyst,
      id: `A-${Date.now()}`,
      workload: 0,
      createdAt: new Date().toISOString(),
    }
    setAnalysts((prev) => [...prev, newAnalyst])
  }

  const updateAnalyst = (id: string, updates: Partial<Analyst>) => {
    setAnalysts((prev) => prev.map((analyst) => (analyst.id === id ? { ...analyst, ...updates } : analyst)))
  }

  const deleteAnalyst = (id: string) => {
    setAnalysts((prev) => prev.filter((analyst) => analyst.id !== id))
  }

  return (
    <AnalystContext.Provider value={{ analysts, addAnalyst, updateAnalyst, deleteAnalyst }}>
      {children}
    </AnalystContext.Provider>
  )
}

export const useAnalysts = () => {
  const context = useContext(AnalystContext)
  if (!context) throw new Error("useAnalysts must be used within AnalystProvider")
  return context
}
