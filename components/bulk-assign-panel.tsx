"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQueues } from "@/contexts/queue-context"
import { useAnalysts } from "@/contexts/analyst-context"
import { useApplications } from "@/contexts/application-context"
import { ArrowRight, Zap } from "lucide-react"

export function BulkAssignPanel() {
  const { queues } = useQueues()
  const { analysts } = useAnalysts()
  const { applications, updateApplication } = useApplications()
  const [selectedQueue, setSelectedQueue] = useState<string>("defaultQueue")
  const [selectedAnalyst, setSelectedAnalyst] = useState<string>("none")

  const pendingApps = applications.filter((app) => app.status === "pending")

  const handleBulkAssign = () => {
    if (!selectedQueue) return

    pendingApps.forEach((app) => {
      updateApplication(app.id, {
        assignedQueue: selectedQueue,
        assignedAnalyst: selectedAnalyst !== "none" ? selectedAnalyst : null,
        status: selectedAnalyst !== "none" ? "assigned" : "pending",
        updatedAt: new Date().toISOString(),
      })
    })

    setSelectedQueue("defaultQueue")
    setSelectedAnalyst("none")
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Bulk Assignment</h3>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Assign {pendingApps.length} pending applications to a queue and analyst
      </p>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Select Queue</label>
          <Select value={selectedQueue} onValueChange={setSelectedQueue}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a queue..." />
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

        <div>
          <label className="mb-2 block text-sm font-medium">Select Analyst (Optional)</label>
          <Select value={selectedAnalyst} onValueChange={setSelectedAnalyst}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an analyst..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No analyst</SelectItem>
              {analysts.map((analyst) => (
                <SelectItem key={analyst.id} value={analyst.id}>
                  {analyst.name} ({analyst.workload} assigned)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full" onClick={handleBulkAssign} disabled={!selectedQueue || pendingApps.length === 0}>
          <ArrowRight className="mr-2 h-4 w-4" />
          Assign {pendingApps.length} Applications
        </Button>
      </div>
    </div>
  )
}
