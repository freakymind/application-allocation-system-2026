"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useQueues } from "@/contexts/queue-context"
import { X } from "lucide-react"

interface QueueFormProps {
  onClose: () => void
}

const colorOptions = [
  { name: "Purple", value: "#8b5cf6" },
  { name: "Green", value: "#10b981" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Orange", value: "#f59e0b" },
  { name: "Red", value: "#ef4444" },
  { name: "Pink", value: "#ec4899" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Yellow", value: "#eab308" },
]

export function QueueForm({ onClose }: QueueFormProps) {
  const { addQueue } = useQueues()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState(colorOptions[0].value)
  const [maxCapacity, setMaxCapacity] = useState<number | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addQueue({
      name,
      description,
      color,
      maxCapacity,
      analystIds: [],
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Create Queue</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Queue Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., High Priority - UK Complex"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose of this queue..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColor(option.value)}
                  className={`flex h-12 items-center justify-center rounded-lg border-2 transition-all ${
                    color === option.value ? "scale-110 border-foreground" : "border-transparent"
                  }`}
                  style={{ backgroundColor: option.value }}
                >
                  {color === option.value && <span className="text-xs font-medium text-white">{option.name}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxCapacity">Max Capacity (Optional)</Label>
            <Input
              id="maxCapacity"
              type="number"
              min="1"
              value={maxCapacity ?? ""}
              onChange={(e) => setMaxCapacity(e.target.value ? Number(e.target.value) : null)}
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Queue</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
