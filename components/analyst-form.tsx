"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAnalysts } from "@/contexts/analyst-context"
import type { UserRole } from "@/lib/types"
import { X } from "lucide-react"

interface AnalystFormProps {
  onClose: () => void
}

export function AnalystForm({ onClose }: AnalystFormProps) {
  const { addAnalyst } = useAnalysts()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<UserRole>("analyst")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addAnalyst({
      name,
      email,
      role,
      queueIds: [],
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Add Team Member</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@company.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="analyst">Analyst</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Member</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
