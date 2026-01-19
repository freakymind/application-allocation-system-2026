"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRules } from "@/contexts/rule-context"
import { useQueues } from "@/contexts/queue-context"
import type { RuleCondition, RuleOperator } from "@/lib/types"
import { X, Plus, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"

interface RuleBuilderProps {
  onClose: () => void
}

const fieldOptions = [
  { value: "isUKBased", label: "Is UK Based", type: "boolean" },
  { value: "isComplex", label: "Is Complex", type: "boolean" },
  { value: "numberOfKP", label: "Number of KP", type: "number" },
  { value: "numberOfDocuments", label: "Number of Documents", type: "number" },
  { value: "cashAmount", label: "Cash Amount", type: "number" },
  { value: "submissionSpeed", label: "Submission Speed (hrs)", type: "number" },
  { value: "queryResponseTime", label: "Query Response Time (hrs)", type: "number" },
  { value: "country", label: "Country", type: "string" },
  { value: "customerBehavior", label: "Customer Behavior", type: "string" },
]

const operatorOptions: { value: RuleOperator; label: string; types: string[] }[] = [
  { value: "equals", label: "Equals", types: ["string", "number", "boolean"] },
  { value: "not_equals", label: "Not Equals", types: ["string", "number", "boolean"] },
  { value: "greater_than", label: "Greater Than", types: ["number"] },
  { value: "less_than", label: "Less Than", types: ["number"] },
  { value: "contains", label: "Contains", types: ["string"] },
]

export function RuleBuilder({ onClose }: RuleBuilderProps) {
  const { addRule } = useRules()
  const { queues } = useQueues()

  const [ruleName, setRuleName] = useState("")
  const [priority, setPriority] = useState(1)
  const [conditions, setConditions] = useState<RuleCondition[]>([
    { field: "numberOfKP", operator: "greater_than", value: 0 },
  ])
  const [targetQueue, setTargetQueue] = useState("")
  const [priorityScore, setPriorityScore] = useState(50)

  const addCondition = () => {
    setConditions([...conditions, { field: "numberOfKP", operator: "equals", value: 0 }])
  }

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  const updateCondition = (index: number, updates: Partial<RuleCondition>) => {
    setConditions(conditions.map((cond, i) => (i === index ? { ...cond, ...updates } : cond)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetQueue) return

    addRule({
      name: ruleName,
      priority,
      isActive: true,
      conditions,
      actions: {
        bucketId: targetQueue,
        priorityScore,
      },
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-border bg-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Create Rule</h2>
            <p className="text-sm text-muted-foreground">Define conditions and actions for automatic allocation</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ruleName">Rule Name</Label>
                <Input
                  id="ruleName"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g., High Value UK Applications"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority (Lower = Higher Priority)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Conditions (All must match)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addCondition}>
                  <Plus className="mr-2 h-3 w-3" />
                  Add Condition
                </Button>
              </div>

              {conditions.map((condition, index) => {
                const selectedField = fieldOptions.find((f) => f.value === condition.field)
                const availableOperators = operatorOptions.filter((op) =>
                  op.types.includes(selectedField?.type || "string"),
                )

                return (
                  <Card key={index} className="p-4">
                    <div className="flex items-end gap-3">
                      <div className="flex-1 space-y-2">
                        <Label className="text-xs">Field</Label>
                        <Select
                          value={condition.field}
                          onValueChange={(value) => updateCondition(index, { field: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldOptions.map((field) => (
                              <SelectItem key={field.value} value={field.value}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-1 space-y-2">
                        <Label className="text-xs">Operator</Label>
                        <Select
                          value={condition.operator}
                          onValueChange={(value) => updateCondition(index, { operator: value as RuleOperator })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableOperators.map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-1 space-y-2">
                        <Label className="text-xs">Value</Label>
                        {selectedField?.type === "boolean" ? (
                          <Select
                            value={String(condition.value)}
                            onValueChange={(value) => updateCondition(index, { value: value === "true" })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">True</SelectItem>
                              <SelectItem value="false">False</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={selectedField?.type === "number" ? "number" : "text"}
                            value={condition.value as string | number}
                            onChange={(e) =>
                              updateCondition(index, {
                                value: selectedField?.type === "number" ? Number(e.target.value) : e.target.value,
                              })
                            }
                          />
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCondition(index)}
                        disabled={conditions.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>

            <div className="space-y-3">
              <Label>Actions</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetQueue" className="text-xs text-muted-foreground">
                    Assign to Queue
                  </Label>
                  <Select value={targetQueue} onValueChange={setTargetQueue} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select queue..." />
                    </SelectTrigger>
                    <SelectContent>
                      {queues.map((queue) => (
                        <SelectItem key={queue.id} value={queue.id}>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: queue.color }} />
                            {queue.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priorityScore" className="text-xs text-muted-foreground">
                    Priority Score (0-100)
                  </Label>
                  <Input
                    id="priorityScore"
                    type="number"
                    min="0"
                    max="100"
                    value={priorityScore}
                    onChange={(e) => setPriorityScore(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Rule</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
