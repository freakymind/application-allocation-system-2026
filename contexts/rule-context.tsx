"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Rule } from "@/lib/types"
import { mockRules } from "@/lib/mock-data"

interface RuleContextType {
  rules: Rule[]
  addRule: (rule: Omit<Rule, "id" | "createdAt" | "updatedAt">) => void
  updateRule: (id: string, updates: Partial<Rule>) => void
  deleteRule: (id: string) => void
}

const RuleContext = createContext<RuleContextType | undefined>(undefined)

export function RuleProvider({ children }: { children: React.ReactNode }) {
  const [rules, setRules] = useState<Rule[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("rules")
    if (stored) {
      setRules(JSON.parse(stored))
    } else {
      setRules(mockRules)
    }
  }, [])

  useEffect(() => {
    if (rules.length > 0) {
      localStorage.setItem("rules", JSON.stringify(rules))
    }
  }, [rules])

  const addRule = (rule: Omit<Rule, "id" | "createdAt" | "updatedAt">) => {
    const newRule: Rule = {
      ...rule,
      id: `R-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setRules((prev) => [...prev, newRule])
  }

  const updateRule = (id: string, updates: Partial<Rule>) => {
    setRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, ...updates, updatedAt: new Date().toISOString() } : rule)),
    )
  }

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((rule) => rule.id !== id))
  }

  return <RuleContext.Provider value={{ rules, addRule, updateRule, deleteRule }}>{children}</RuleContext.Provider>
}

export const useRules = () => {
  const context = useContext(RuleContext)
  if (!context) throw new Error("useRules must be used within RuleProvider")
  return context
}
