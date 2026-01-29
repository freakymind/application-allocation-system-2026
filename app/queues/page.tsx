"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useQueues } from "@/contexts/queue-context"
import { useAnalysts } from "@/contexts/analyst-context"
import { useApplications } from "@/contexts/application-context"
import { QueueForm } from "@/components/queue-form"
import {
  Plus,
  Users,
  Trash2,
  ChevronDown,
  ChevronRight,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  ArrowRight,
  Filter,
  Search,
  Zap,
  Sparkles,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import type { Application } from "@/lib/types"

export default function QueuesPage() {
  const { queues, updateQueue, deleteQueue } = useQueues()
  const { analysts, updateAnalyst } = useAnalysts()
  const { applications, updateApplication, addActivity, autoAssignQueue } = useApplications()
  const [showForm, setShowForm] = useState(false)
  const [expandedQueues, setExpandedQueues] = useState<string[]>([])
  const [selectedApps, setSelectedApps] = useState<Record<string, string[]>>({})
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({})
  const [statusFilters, setStatusFilters] = useState<Record<string, string>>({})

  const toggleQueueExpand = (queueId: string) => {
    setExpandedQueues((prev) => (prev.includes(queueId) ? prev.filter((id) => id !== queueId) : [...prev, queueId]))
  }

  const assignAnalystToQueue = (queueId: string, analystId: string) => {
    const analyst = analysts.find((a) => a.id === analystId)
    if (analyst && !analyst.queueIds.includes(queueId)) {
      updateAnalyst(analystId, { queueIds: [...analyst.queueIds, queueId] })
      const queue = queues.find((q) => q.id === queueId)
      if (queue && !queue.analystIds.includes(analystId)) {
        updateQueue(queueId, { analystIds: [...queue.analystIds, analystId] })
      }
    }
  }

  const removeAnalystFromQueue = (queueId: string, analystId: string) => {
    const analyst = analysts.find((a) => a.id === analystId)
    if (analyst) {
      updateAnalyst(analystId, { queueIds: analyst.queueIds.filter((id) => id !== queueId) })
    }
    const queue = queues.find((q) => q.id === queueId)
    if (queue) {
      updateQueue(queueId, { analystIds: queue.analystIds.filter((id) => id !== analystId) })
    }
  }

  const assignApplicationToAnalyst = (appId: string, analystId: string, queueId: string) => {
    const analyst = analysts.find((a) => a.id === analystId)
    const prevApp = applications.find((a) => a.id === appId)
    const prevAnalyst = prevApp?.assignedAnalyst ? analysts.find((a) => a.id === prevApp.assignedAnalyst)?.name : null

    updateApplication(appId, { assignedAnalyst: analystId || undefined })

    if (analystId) {
      addActivity(appId, {
        type: "analyst_assigned",
        description: `Assigned to ${analyst?.name}${prevAnalyst ? ` (previously: ${prevAnalyst})` : ""}`,
        performedBy: "System",
      })
    }
  }

  const bulkAssignToAnalyst = (queueId: string, analystId: string) => {
    const selected = selectedApps[queueId] || []
    const analyst = analysts.find((a) => a.id === analystId)

    selected.forEach((appId) => {
      updateApplication(appId, { assignedAnalyst: analystId || undefined })
      if (analystId && analyst) {
        addActivity(appId, {
          type: "analyst_assigned",
          description: `Bulk assigned to ${analyst.name}`,
          performedBy: "System",
        })
      }
    })
    setSelectedApps((prev) => ({ ...prev, [queueId]: [] }))
  }

  const handleAutoAssign = (queueId: string) => {
    const queueAnalysts = analysts.filter((a) => a.queueIds.includes(queueId))
    const analystNames: Record<string, string> = {}
    queueAnalysts.forEach((a) => {
      analystNames[a.id] = a.name
    })
    const count = autoAssignQueue(queueId, queueAnalysts.map((a) => a.id), analystNames)
    if (count > 0) {
      alert(`Successfully auto-assigned ${count} applications using workload balancing.`)
    } else {
      alert("No unassigned applications to distribute.")
    }
  }

  const toggleAppSelection = (queueId: string, appId: string) => {
    setSelectedApps((prev) => {
      const current = prev[queueId] || []
      return {
        ...prev,
        [queueId]: current.includes(appId) ? current.filter((id) => id !== appId) : [...current, appId],
      }
    })
  }

  const selectAllInQueue = (queueId: string, apps: Application[]) => {
    const current = selectedApps[queueId] || []
    const allSelected = apps.every((app) => current.includes(app.id))
    setSelectedApps((prev) => ({
      ...prev,
      [queueId]: allSelected ? [] : apps.map((app) => app.id),
    }))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
      case "in_progress":
        return <Clock className="h-3.5 w-3.5 text-amber-500" />
      case "pending":
        return <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
      default:
        return <FileText className="h-3.5 w-3.5 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      case "in_progress":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case "pending":
        return "bg-muted text-muted-foreground border-border"
      case "on_hold":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 80) return "text-red-500"
    if (priority >= 60) return "text-amber-500"
    return "text-muted-foreground"
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 pl-64">
        <div className="border-b border-border bg-card">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Queue Management</h1>
              <p className="text-sm text-muted-foreground">View applications and assign to analysts</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Create Queue
            </Button>
          </div>
        </div>

        <div className="p-6">
          {queues.length === 0 ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-lg bg-muted p-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">No queues configured</h3>
                <p className="mb-6 text-sm text-muted-foreground">Create your first queue to organize applications</p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Queue
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {queues.map((queue) => {
                const queueApplications = applications.filter((app) => app.assignedQueue === queue.id)
                const utilization = queue.maxCapacity ? (queueApplications.length / queue.maxCapacity) * 100 : 0
                const queueAnalysts = analysts.filter((a) => a.queueIds.includes(queue.id))
                const isExpanded = expandedQueues.includes(queue.id)
                const queueSelectedApps = selectedApps[queue.id] || []
                const searchTerm = searchTerms[queue.id] || ""
                const statusFilter = statusFilters[queue.id] || "all"

                // Filter applications
                const filteredApps = queueApplications.filter((app) => {
                  const matchesSearch =
                    !searchTerm ||
                    app.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    app.customerName.toLowerCase().includes(searchTerm.toLowerCase())
                  const matchesStatus = statusFilter === "all" || app.status === statusFilter
                  return matchesSearch && matchesStatus
                })

                // Stats
                const unassignedCount = queueApplications.filter((a) => !a.assignedAnalyst).length
                const pendingCount = queueApplications.filter((a) => a.status === "pending").length
                const inProgressCount = queueApplications.filter((a) => a.status === "in_progress").length

                return (
                  <Card key={queue.id} className="overflow-hidden border-border">
                    {/* Queue Header */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleQueueExpand(queue.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: queue.color }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{queue.name}</h3>
                          <p className="text-xs text-muted-foreground">{queue.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Quick Stats */}
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-medium text-foreground">{queueApplications.length}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-muted-foreground">Unassigned:</span>
                            <span className="font-medium text-amber-500">{unassignedCount}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            <span className="text-muted-foreground">In Progress:</span>
                            <span className="font-medium text-foreground">{inProgressCount}</span>
                          </div>
                        </div>

                        {/* Capacity Bar */}
                        <div className="w-32">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Capacity</span>
                            <span className="font-medium">
                              {queueApplications.length}/{queue.maxCapacity || "∞"}
                            </span>
                          </div>
                          {queue.maxCapacity && (
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full transition-all"
                                style={{
                                  width: `${Math.min(utilization, 100)}%`,
                                  backgroundColor: utilization > 90 ? "#ef4444" : queue.color,
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Analyst Avatars */}
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground mr-1" />
                          <div className="flex -space-x-2">
                            {queueAnalysts.slice(0, 4).map((analyst) => (
                              <div
                                key={analyst.id}
                                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] font-medium text-primary-foreground"
                                title={analyst.name}
                              >
                                {analyst.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                            ))}
                            {queueAnalysts.length > 4 && (
                              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium">
                                +{queueAnalysts.length - 4}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Auto-Assign Button */}
                        {unassignedCount > 0 && queueAnalysts.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAutoAssign(queue.id)
                            }}
                          >
                            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                            Auto-Assign ({unassignedCount})
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteQueue(queue.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-border">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between gap-4 bg-muted/30 px-4 py-3">
                          <div className="flex items-center gap-3">
                            {/* Search */}
                            <div className="relative">
                              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                placeholder="Search applications..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerms((prev) => ({ ...prev, [queue.id]: e.target.value }))}
                                className="h-8 w-64 pl-8 text-sm"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>

                            {/* Status Filter */}
                            <Select
                              value={statusFilter}
                              onValueChange={(v) => setStatusFilters((prev) => ({ ...prev, [queue.id]: v }))}
                            >
                              <SelectTrigger className="h-8 w-36 text-sm" onClick={(e) => e.stopPropagation()}>
                                <Filter className="mr-2 h-3.5 w-3.5" />
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="on_hold">On Hold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Bulk Actions */}
                          {queueSelectedApps.length > 0 && (
                            <div className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-1.5">
                              <span className="text-sm font-medium text-primary">
                                {queueSelectedApps.length} selected
                              </span>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <Select onValueChange={(v) => bulkAssignToAnalyst(queue.id, v)}>
                                <SelectTrigger className="h-7 w-40 text-sm border-primary/30">
                                  <SelectValue placeholder="Assign to..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {queueAnalysts.map((analyst) => (
                                    <SelectItem key={analyst.id} value={analyst.id}>
                                      {analyst.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedApps((prev) => ({ ...prev, [queue.id]: [] }))
                                }}
                              >
                                Clear
                              </Button>
                            </div>
                          )}

                          {/* Add Analyst */}
                          <Select onValueChange={(analystId) => assignAnalystToQueue(queue.id, analystId)}>
                            <SelectTrigger className="h-8 w-44 text-sm" onClick={(e) => e.stopPropagation()}>
                              <Plus className="mr-2 h-3.5 w-3.5" />
                              <SelectValue placeholder="Add analyst..." />
                            </SelectTrigger>
                            <SelectContent>
                              {analysts
                                .filter((a) => !a.queueIds.includes(queue.id))
                                .map((analyst) => (
                                  <SelectItem key={analyst.id} value={analyst.id}>
                                    {analyst.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Applications Table */}
                        <div className="max-h-[500px] overflow-auto">
                          <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-card border-b border-border">
                              <tr className="text-left text-xs text-muted-foreground">
                                <th className="w-10 p-3">
                                  <Checkbox
                                    checked={
                                      filteredApps.length > 0 &&
                                      filteredApps.every((app) => queueSelectedApps.includes(app.id))
                                    }
                                    onCheckedChange={() => selectAllInQueue(queue.id, filteredApps)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </th>
                                <th className="p-3 font-medium">Reference</th>
                                <th className="p-3 font-medium">Customer</th>
                                <th className="p-3 font-medium">Country</th>
                                <th className="p-3 font-medium text-center">KP</th>
                                <th className="p-3 font-medium text-center">Docs</th>
                                <th className="p-3 font-medium text-right">Amount</th>
                                <th className="p-3 font-medium text-center">Priority</th>
                                <th className="p-3 font-medium">Status</th>
                                <th className="p-3 font-medium">Stage</th>
                                <th className="p-3 font-medium w-48">Assigned To</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredApps.length === 0 ? (
                                <tr>
                                  <td colSpan={11} className="p-8 text-center text-muted-foreground">
                                    No applications in this queue
                                  </td>
                                </tr>
                              ) : (
                                filteredApps.map((app) => {
                                  const assignedAnalyst = analysts.find((a) => a.id === app.assignedAnalyst)
                                  return (
                                    <tr
                                      key={app.id}
                                      className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${
                                        queueSelectedApps.includes(app.id) ? "bg-primary/5" : ""
                                      }`}
                                    >
                                      <td className="p-3">
                                        <Checkbox
                                          checked={queueSelectedApps.includes(app.id)}
                                          onCheckedChange={() => toggleAppSelection(queue.id, app.id)}
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </td>
                                      <td className="p-3">
                                        <span className="font-mono text-xs font-medium text-primary">
                                          {app.reference}
                                        </span>
                                      </td>
                                      <td className="p-3">
                                        <div>
                                          <span className="font-medium text-foreground">{app.customerName}</span>
                                          {app.isComplex && (
                                            <Badge
                                              variant="outline"
                                              className="ml-2 text-[10px] border-amber-500/30 text-amber-500"
                                            >
                                              Complex
                                            </Badge>
                                          )}
                                        </div>
                                      </td>
                                      <td className="p-3">
                                        <span className="text-muted-foreground">{app.country}</span>
                                        {app.isUKBased && (
                                          <Badge variant="outline" className="ml-1 text-[10px]">
                                            UK
                                          </Badge>
                                        )}
                                      </td>
                                      <td className="p-3 text-center">{app.numberOfKP}</td>
                                      <td className="p-3 text-center">{app.numberOfDocuments}</td>
                                      <td className="p-3 text-right font-mono text-xs">
                                        £{app.cashAmount.toLocaleString()}
                                      </td>
                                      <td className="p-3 text-center">
                                        <span className={`font-semibold ${getPriorityColor(app.priority)}`}>
                                          {app.priority}
                                        </span>
                                      </td>
                                      <td className="p-3">
                                        <Badge
                                          variant="outline"
                                          className={`text-[10px] ${getStatusColor(app.status)}`}
                                        >
                                          <span className="mr-1">{getStatusIcon(app.status)}</span>
                                          {app.status.replace("_", " ")}
                                        </Badge>
                                      </td>
                                      <td className="p-3">
                                        <span className="text-xs text-muted-foreground capitalize">
                                          {app.stage?.replace("_", " ") || "Initial"}
                                        </span>
                                      </td>
                                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                        <Select
                                          value={app.assignedAnalyst || "unassigned"}
                                          onValueChange={(v) =>
                                            assignApplicationToAnalyst(app.id, v === "unassigned" ? "" : v, queue.id)
                                          }
                                        >
                                          <SelectTrigger
                                            className={`h-7 text-xs ${
                                              !app.assignedAnalyst ? "border-amber-500/50 text-amber-500" : ""
                                            }`}
                                          >
                                            <User className="mr-1.5 h-3 w-3" />
                                            <SelectValue placeholder="Unassigned" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="unassigned">
                                              <span className="text-amber-500">Unassigned</span>
                                            </SelectItem>
                                            {queueAnalysts.map((analyst) => (
                                              <SelectItem key={analyst.id} value={analyst.id}>
                                                {analyst.name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </td>
                                    </tr>
                                  )
                                })
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Queue Analysts Footer */}
                        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              Showing {filteredApps.length} of {queueApplications.length} applications
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground mr-2">Queue Analysts:</span>
                            {queueAnalysts.map((analyst) => {
                              const analystApps = queueApplications.filter(
                                (a) => a.assignedAnalyst === analyst.id,
                              ).length
                              return (
                                <div
                                  key={analyst.id}
                                  className="flex items-center gap-2 rounded-full bg-card border border-border px-2 py-1"
                                >
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-primary-foreground">
                                    {analyst.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </div>
                                  <span className="text-xs font-medium">{analyst.name}</span>
                                  <Badge variant="secondary" className="text-[10px] h-4">
                                    {analystApps}
                                  </Badge>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeAnalystFromQueue(queue.id, analyst.id)
                                    }}
                                    className="text-muted-foreground hover:text-destructive ml-1"
                                  >
                                    ×
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {showForm && <QueueForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
