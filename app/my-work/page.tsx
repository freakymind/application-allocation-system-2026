"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useQueues } from "@/contexts/queue-context"
import { useAnalysts } from "@/contexts/analyst-context"
import { useApplications } from "@/contexts/application-context"
import {
  HandMetal,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  ChevronRight,
  Play,
  Pause,
  CheckCheck,
  ArrowUpRight,
  Layers,
  TrendingUp,
  Target,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Application } from "@/lib/types"

export default function MyWorkPage() {
  const { queues } = useQueues()
  const { analysts } = useAnalysts()
  const { applications, claimApplication, updateApplication } = useApplications()
  const [selectedAnalyst, setSelectedAnalyst] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"available" | "my-cases" | "completed">("available")

  // Get current analyst's data
  const currentAnalyst = analysts.find((a) => a.id === selectedAnalyst)
  const analystQueues = currentAnalyst ? queues.filter((q) => currentAnalyst.queueIds.includes(q.id)) : []

  // Applications available to claim (in analyst's queues, unassigned)
  const availableApplications = applications.filter(
    (app) =>
      app.assignedQueue &&
      analystQueues.some((q) => q.id === app.assignedQueue) &&
      !app.assignedAnalyst &&
      app.status !== "completed"
  ).sort((a, b) => b.priority - a.priority)

  // Analyst's assigned cases
  const myCases = applications.filter(
    (app) => app.assignedAnalyst === selectedAnalyst && app.status !== "completed"
  ).sort((a, b) => b.priority - a.priority)

  // Analyst's completed cases
  const completedCases = applications.filter(
    (app) => app.assignedAnalyst === selectedAnalyst && app.status === "completed"
  ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const handleClaim = (app: Application) => {
    if (!currentAnalyst) return
    claimApplication(app.id, selectedAnalyst, currentAnalyst.name)
  }

  const handleStatusChange = (appId: string, newStatus: string) => {
    updateApplication(appId, { status: newStatus as Application["status"] })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />
      case "on_hold":
        return <Pause className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200"
      case "in_progress":
        return "bg-amber-500/10 text-amber-600 border-amber-200"
      case "pending":
        return "bg-gray-100 text-gray-600 border-gray-200"
      case "on_hold":
        return "bg-red-500/10 text-red-600 border-red-200"
      default:
        return "bg-gray-100 text-gray-600 border-gray-200"
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 80) return "text-red-500 bg-red-50"
    if (priority >= 60) return "text-amber-500 bg-amber-50"
    return "text-gray-500 bg-gray-50"
  }

  const getQueueColor = (queueId: string | null) => {
    const queue = queues.find((q) => q.id === queueId)
    return queue?.color || "#6b7280"
  }

  const getQueueName = (queueId: string | null) => {
    const queue = queues.find((q) => q.id === queueId)
    return queue?.name || "Unassigned"
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 pl-64">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">My Work</h1>
              <p className="text-sm text-muted-foreground">Pick cases from queues and manage your workload</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Working as:</span>
              <Select value={selectedAnalyst} onValueChange={setSelectedAnalyst}>
                <SelectTrigger className="w-56">
                  <User className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select your profile" />
                </SelectTrigger>
                <SelectContent>
                  {analysts.filter((a) => a.role === "analyst").map((analyst) => (
                    <SelectItem key={analyst.id} value={analyst.id}>
                      {analyst.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {!selectedAnalyst ? (
          <div className="p-8">
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Select Your Profile</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Choose your analyst profile from the dropdown above to view available cases and manage your workload.
                </p>
              </div>
            </Card>
          </div>
        ) : (
          <div className="p-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{availableApplications.length}</div>
                    <div className="text-xs text-muted-foreground">Available to Claim</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{myCases.length}</div>
                    <div className="text-xs text-muted-foreground">Active Cases</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-500/10 p-2">
                    <CheckCheck className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{completedCases.length}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <Layers className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{analystQueues.length}</div>
                    <div className="text-xs text-muted-foreground">Assigned Queues</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={activeTab === "available" ? "default" : "outline"}
                onClick={() => setActiveTab("available")}
                className={activeTab === "available" ? "" : "bg-transparent"}
              >
                <HandMetal className="mr-2 h-4 w-4" />
                Available to Claim ({availableApplications.length})
              </Button>
              <Button
                variant={activeTab === "my-cases" ? "default" : "outline"}
                onClick={() => setActiveTab("my-cases")}
                className={activeTab === "my-cases" ? "" : "bg-transparent"}
              >
                <FileText className="mr-2 h-4 w-4" />
                My Cases ({myCases.length})
              </Button>
              <Button
                variant={activeTab === "completed" ? "default" : "outline"}
                onClick={() => setActiveTab("completed")}
                className={activeTab === "completed" ? "" : "bg-transparent"}
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Completed ({completedCases.length})
              </Button>
            </div>

            {/* Available Cases */}
            {activeTab === "available" && (
              <div className="space-y-3">
                {availableApplications.length === 0 ? (
                  <Card className="p-8">
                    <div className="flex flex-col items-center justify-center text-center">
                      <CheckCircle className="h-12 w-12 text-emerald-500 mb-4" />
                      <h3 className="text-lg font-semibold text-foreground">All Caught Up!</h3>
                      <p className="text-sm text-muted-foreground">No applications available to claim right now.</p>
                    </div>
                  </Card>
                ) : (
                  availableApplications.map((app) => (
                    <Card key={app.id} className="p-4 hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: getQueueColor(app.assignedQueue) }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-foreground">{app.reference}</span>
                              <Badge variant="outline" className={getPriorityColor(app.priority)}>
                                P{app.priority}
                              </Badge>
                              {app.isComplex && (
                                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                                  Complex
                                </Badge>
                              )}
                              {app.isUKBased && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                                  UK
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-foreground font-medium">{app.customerName}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {app.country} • {app.customerBehavior === "responsive" ? "Responsive" : app.customerBehavior === "slow" ? "Slow Response" : "Poor Response"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="grid grid-cols-5 gap-4 text-center">
                            <div className="text-sm">
                              <div className="text-xs text-muted-foreground">Queue</div>
                              <div className="font-medium text-foreground">{getQueueName(app.assignedQueue)}</div>
                            </div>
                            <div className="text-sm">
                              <div className="text-xs text-muted-foreground">KPs</div>
                              <div className="font-medium text-foreground">{app.numberOfKP}</div>
                            </div>
                            <div className="text-sm">
                              <div className="text-xs text-muted-foreground">Docs</div>
                              <div className="font-medium text-foreground">{app.numberOfDocuments}</div>
                            </div>
                            <div className="text-sm">
                              <div className="text-xs text-muted-foreground">Amount</div>
                              <div className="font-medium text-foreground">£{(app.cashAmount / 1000).toFixed(0)}K</div>
                            </div>
                            <div className="text-sm">
                              <div className="text-xs text-muted-foreground">Age</div>
                              <div className="font-medium text-foreground">{Math.floor((Date.now() - new Date(app.createdAt).getTime()) / 86400000)}d</div>
                            </div>
                          </div>
                          <Button onClick={() => handleClaim(app)} className="bg-primary hover:bg-primary/90 ml-4">
                            <HandMetal className="mr-2 h-4 w-4" />
                            Claim
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* My Cases */}
            {activeTab === "my-cases" && (
              <div className="space-y-3">
                {myCases.length === 0 ? (
                  <Card className="p-8">
                    <div className="flex flex-col items-center justify-center text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground">No Active Cases</h3>
                      <p className="text-sm text-muted-foreground">Claim cases from the available queue to get started.</p>
                    </div>
                  </Card>
                ) : (
                  myCases.map((app) => (
                    <Card key={app.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="h-10 w-1.5 rounded-full"
                            style={{ backgroundColor: getQueueColor(app.assignedQueue) }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">{app.reference}</span>
                              <Badge variant="outline" className={`${getStatusColor(app.status)}`}>
                                {getStatusIcon(app.status)}
                                <span className="ml-1">{app.status.replace("_", " ")}</span>
                              </Badge>
                              <Badge variant="outline" className={getPriorityColor(app.priority)}>
                                P{app.priority}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {app.customerName} • {app.country} • {app.numberOfKP} KPs • {app.numberOfDocuments} Docs
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Select
                            value={app.status}
                            onValueChange={(v) => handleStatusChange(app.id, v)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="h-3.5 w-3.5" />
                                  Pending
                                </div>
                              </SelectItem>
                              <SelectItem value="in_progress">
                                <div className="flex items-center gap-2">
                                  <Play className="h-3.5 w-3.5" />
                                  In Progress
                                </div>
                              </SelectItem>
                              <SelectItem value="on_hold">
                                <div className="flex items-center gap-2">
                                  <Pause className="h-3.5 w-3.5" />
                                  On Hold
                                </div>
                              </SelectItem>
                              <SelectItem value="completed">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  Completed
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm" className="bg-transparent">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Completed Cases */}
            {activeTab === "completed" && (
              <div className="space-y-3">
                {completedCases.length === 0 ? (
                  <Card className="p-8">
                    <div className="flex flex-col items-center justify-center text-center">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground">No Completed Cases Yet</h3>
                      <p className="text-sm text-muted-foreground">Complete your assigned cases to see them here.</p>
                    </div>
                  </Card>
                ) : (
                  completedCases.map((app) => (
                    <Card key={app.id} className="p-4 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="rounded-full bg-emerald-500/10 p-2">
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">{app.reference}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {app.customerName} • Completed {new Date(app.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {app.numberOfKP} KPs • {app.numberOfDocuments} Docs
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
