"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useApplications } from "@/contexts/application-context"
import { useQueues } from "@/contexts/queue-context"
import { useAnalysts } from "@/contexts/analyst-context"
import { ApplicationForm } from "@/components/application-form"
import { ApplicationDetailPanel } from "@/components/application-detail-panel"
import { Search, Plus, TrendingUp, XSquare, User, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Application } from "@/lib/types"

export default function ApplicationsPage() {
  const { applications, updateApplication } = useApplications()
  const { queues } = useQueues()
  const { analysts } = useAnalysts()
  const [showForm, setShowForm] = useState(false)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [queueFilter, setQueueFilter] = useState("all")
  const [analystFilter, setAnalystFilter] = useState("all")
  const [selectedApps, setSelectedApps] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.country.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    const matchesQueue =
      queueFilter === "all" || (queueFilter === "unassigned" && !app.assignedQueue) || app.assignedQueue === queueFilter
    const matchesAnalyst =
      analystFilter === "all" ||
      (analystFilter === "unassigned" && !app.assignedAnalyst) ||
      app.assignedAnalyst === analystFilter
    return matchesSearch && matchesStatus && matchesQueue && matchesAnalyst
  })

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage)

  const getQueueColor = (queueId: string | null) => {
    const queue = queues.find((q) => q.id === queueId)
    return queue?.color || "#6b7280"
  }

  const getQueueName = (queueId: string | null) => {
    const queue = queues.find((q) => q.id === queueId)
    return queue?.name || "Unassigned"
  }

  const getAnalystsByQueue = (queueId: string) => {
    return analysts.filter((analyst) => analyst.queueIds.includes(queueId))
  }

  const handleSelectAll = () => {
    if (selectedApps.length === paginatedApplications.length) {
      setSelectedApps([])
    } else {
      setSelectedApps(paginatedApplications.map((app) => app.id))
    }
  }

  const handleSelectApp = (appId: string) => {
    setSelectedApps((prev) => (prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]))
  }

  const handleBulkAssignQueue = (queueId: string) => {
    selectedApps.forEach((appId) => {
      updateApplication(appId, {
        assignedQueue: queueId,
        status: "assigned",
      })
    })
    setSelectedApps([])
  }

  const handleBulkAssignAnalyst = (analystId: string) => {
    selectedApps.forEach((appId) => {
      updateApplication(appId, {
        assignedAnalyst: analystId,
        status: "in-progress",
      })
    })
    setSelectedApps([])
  }

  const handleAssignToAnalyst = (appId: string, analystId: string) => {
    updateApplication(appId, {
      assignedAnalyst: analystId,
      status: "in-progress",
    })
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 pl-64">
        <div className="border-b border-border bg-card/50">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Applications</h1>
              <p className="text-sm text-muted-foreground">
                {filteredApplications.length} applications • {selectedApps.length} selected
              </p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Application
            </Button>
          </div>
        </div>

        <div className="border-b border-border bg-card/30 px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by reference, customer, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={queueFilter} onValueChange={setQueueFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Queues</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
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
            <Select value={analystFilter} onValueChange={setAnalystFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Analysts</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {analysts.map((analyst) => (
                  <SelectItem key={analyst.id} value={analyst.id}>
                    {analyst.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-8">
          {selectedApps.length > 0 && (
            <div className="mb-4 flex items-center gap-4 rounded-lg border border-primary bg-primary/10 px-4 py-3">
              <span className="text-sm font-semibold text-primary">{selectedApps.length} selected</span>
              <div className="flex gap-2 flex-1">
                <Select onValueChange={handleBulkAssignQueue}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Assign to queue..." />
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
                <Select onValueChange={handleBulkAssignAnalyst}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Assign to analyst..." />
                  </SelectTrigger>
                  <SelectContent>
                    {analysts.map((analyst) => (
                      <SelectItem key={analyst.id} value={analyst.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {analyst.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => setSelectedApps([])}>
                  <XSquare className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-[40px_1fr_1.5fr_0.8fr_0.6fr_0.6fr_1.2fr_1.2fr_0.8fr_60px] gap-4 border-b border-border bg-muted/50 px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <div className="flex items-center">
                <Checkbox
                  checked={selectedApps.length === paginatedApplications.length && paginatedApplications.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </div>
              <div>Reference</div>
              <div>Customer</div>
              <div>Country</div>
              <div>KP</div>
              <div>Priority</div>
              <div>Queue</div>
              <div>Assigned To</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            <div className="divide-y divide-border">
              {paginatedApplications.map((app) => (
                <div
                  key={app.id}
                  className="grid grid-cols-[40px_1fr_1.5fr_0.8fr_0.6fr_0.6fr_1.2fr_1.2fr_0.8fr_60px] gap-4 px-4 py-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center">
                    <Checkbox checked={selectedApps.includes(app.id)} onCheckedChange={() => handleSelectApp(app.id)} />
                  </div>
                  <div className="flex items-center">
                    <span className="font-mono text-xs font-semibold text-primary">{app.reference}</span>
                  </div>
                  <div className="flex items-center">
                    <div>
                      <p className="text-sm font-medium text-foreground truncate">{app.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {app.numberOfDocuments} docs • £{(app.cashAmount / 1000).toFixed(0)}k
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{app.country.substring(0, 2).toUpperCase()}</span>
                      {app.isUKBased && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          UK
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium">{app.numberOfKP}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-primary" />
                      <span className="text-sm font-semibold text-primary">{app.priority}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {app.assignedQueue ? (
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: getQueueColor(app.assignedQueue) }}
                        />
                        <span className="text-xs truncate">{getQueueName(app.assignedQueue)}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not assigned</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    {app.assignedQueue ? (
                      <Select
                        value={app.assignedAnalyst || "none"}
                        onValueChange={(value) => handleAssignToAnalyst(app.id, value === "none" ? "" : value)}
                      >
                        <SelectTrigger className="h-7 text-xs w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <span className="text-muted-foreground text-xs">Unassigned</span>
                          </SelectItem>
                          {getAnalystsByQueue(app.assignedQueue).map((analyst) => (
                            <SelectItem key={analyst.id} value={analyst.id}>
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                <span className="text-xs">{analyst.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-xs text-muted-foreground">Queue first</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Badge
                      variant={
                        app.status === "pending" ? "secondary" : app.status === "completed" ? "default" : "outline"
                      }
                      className="text-xs"
                    >
                      {app.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-center">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedApp(app)} className="h-7 w-7 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredApplications.length)}</span>{" "}
                of <span className="font-medium">{filteredApplications.length}</span> applications
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center gap-1 px-4 text-sm">
                  Page <span className="font-medium">{currentPage}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  Last
                </Button>
              </div>
            </div>
          )}

          {filteredApplications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No applications found</p>
            </div>
          )}
        </div>
      </main>

      {showForm && <ApplicationForm onClose={() => setShowForm(false)} />}
      <ApplicationDetailPanel application={selectedApp} onClose={() => setSelectedApp(null)} />
    </div>
  )
}
