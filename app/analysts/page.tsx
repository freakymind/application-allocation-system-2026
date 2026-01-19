"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAnalysts } from "@/contexts/analyst-context"
import { useQueues } from "@/contexts/queue-context"
import { useApplications } from "@/contexts/application-context"
import { AnalystForm } from "@/components/analyst-form"
import type { Application } from "@/lib/types"
import {
  Plus,
  Trash2,
  Mail,
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Brain,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Zap,
  Timer,
  BarChart3,
} from "lucide-react"

function calculateComplexityScore(app: Application): number {
  let score = 0

  // KP count impact (more KPs = more complex)
  score += Math.min(app.numberOfKP * 5, 30)

  // Document count impact
  score += Math.min(app.numberOfDocuments * 2, 20)

  // Cash amount impact (higher amounts = more scrutiny)
  if (app.cashAmount > 1000000) score += 25
  else if (app.cashAmount > 500000) score += 15
  else if (app.cashAmount > 100000) score += 10

  // UK complex flag
  if (app.isComplex) score += 20
  if (app.isUKBased) score += 5

  // Customer behavior impact
  if (app.customerBehavior === "poor") score += 15
  else if (app.customerBehavior === "slow") score += 8

  // Query response time (slower = more follow-ups needed)
  if (app.queryResponseTime > 48) score += 10
  else if (app.queryResponseTime > 24) score += 5

  return Math.min(score, 100)
}

function estimateProcessingTime(app: Application): number {
  const complexity = calculateComplexityScore(app)
  const baseTime = 2 // base hours

  if (complexity >= 80) return baseTime + 8
  if (complexity >= 60) return baseTime + 5
  if (complexity >= 40) return baseTime + 3
  if (complexity >= 20) return baseTime + 1
  return baseTime
}

function getWorkloadRating(totalHours: number, capacity = 40): { label: string; color: string; score: number } {
  const utilization = (totalHours / capacity) * 100
  if (utilization >= 100) return { label: "Overloaded", color: "text-red-500 bg-red-500/10", score: utilization }
  if (utilization >= 80) return { label: "High Load", color: "text-orange-500 bg-orange-500/10", score: utilization }
  if (utilization >= 50) return { label: "Optimal", color: "text-green-500 bg-green-500/10", score: utilization }
  if (utilization >= 20) return { label: "Available", color: "text-blue-500 bg-blue-500/10", score: utilization }
  return { label: "Underutilized", color: "text-gray-500 bg-gray-500/10", score: utilization }
}

function getComplexityBadge(score: number) {
  if (score >= 70) return { label: "High", color: "bg-red-500/10 text-red-500 border-red-500/20" }
  if (score >= 40) return { label: "Medium", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" }
  return { label: "Low", color: "bg-green-500/10 text-green-500 border-green-500/20" }
}

function getStageBadge(stage: string) {
  const stages: Record<string, string> = {
    intake: "bg-gray-500/10 text-gray-400",
    document_review: "bg-blue-500/10 text-blue-400",
    kyc_check: "bg-purple-500/10 text-purple-400",
    compliance_review: "bg-orange-500/10 text-orange-400",
    manager_approval: "bg-pink-500/10 text-pink-400",
    final_review: "bg-cyan-500/10 text-cyan-400",
    completed: "bg-green-500/10 text-green-400",
  }
  return stages[stage] || "bg-gray-500/10 text-gray-400"
}

export default function AnalystsPage() {
  const { analysts, deleteAnalyst } = useAnalysts()
  const { queues } = useQueues()
  const { applications, updateApplication } = useApplications()
  const [showForm, setShowForm] = useState(false)
  const [expandedAnalyst, setExpandedAnalyst] = useState<string | null>(null)

  const getAnalystApplications = (analystId: string) => {
    return applications.filter((app) => app.assignedAnalyst === analystId && app.status !== "completed")
  }

  const getCompletedCount = (analystId: string) => {
    return applications.filter((app) => app.assignedAnalyst === analystId && app.status === "completed").length
  }

  const getAnalystQueues = (analystId: string) => {
    const analyst = analysts.find((a) => a.id === analystId)
    return queues.filter((q) => analyst?.queueIds.includes(q.id))
  }

  const getAnalystWorkloadMetrics = (analystId: string) => {
    const apps = getAnalystApplications(analystId)
    const totalHours = apps.reduce((sum, app) => sum + estimateProcessingTime(app), 0)
    const avgComplexity =
      apps.length > 0 ? apps.reduce((sum, app) => sum + calculateComplexityScore(app), 0) / apps.length : 0
    return { totalHours, avgComplexity, appCount: apps.length }
  }

  const handleReassign = (appId: string, newAnalystId: string) => {
    const analyst = analysts.find((a) => a.id === newAnalystId)
    updateApplication(appId, {
      assignedAnalyst: newAnalystId === "unassign" ? undefined : newAnalystId,
    })
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 pl-64">
        <div className="border-b border-border bg-card/50">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Team Workload Manager</h1>
              <p className="text-sm text-muted-foreground">AI-powered workload analysis and case assignment</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>
        </div>

        <div className="border-b border-border bg-muted/30 px-8 py-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">AI Workload Analysis</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">
                  Optimal:{" "}
                  {
                    analysts.filter((a) => {
                      const { totalHours } = getAnalystWorkloadMetrics(a.id)
                      const rating = getWorkloadRating(totalHours)
                      return rating.label === "Optimal"
                    }).length
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="text-muted-foreground">
                  High Load:{" "}
                  {
                    analysts.filter((a) => {
                      const { totalHours } = getAnalystWorkloadMetrics(a.id)
                      const rating = getWorkloadRating(totalHours)
                      return rating.label === "High Load"
                    }).length
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-muted-foreground">
                  Overloaded:{" "}
                  {
                    analysts.filter((a) => {
                      const { totalHours } = getAnalystWorkloadMetrics(a.id)
                      const rating = getWorkloadRating(totalHours)
                      return rating.label === "Overloaded"
                    }).length
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {analysts.length === 0 ? (
            <Card className="border-dashed p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">No team members</h3>
                <p className="mb-6 text-sm text-muted-foreground">Add your first team member to get started</p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Member
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {analysts.map((analyst) => {
                const apps = getAnalystApplications(analyst.id)
                const completedCount = getCompletedCount(analyst.id)
                const assignedQueues = getAnalystQueues(analyst.id)
                const { totalHours, avgComplexity, appCount } = getAnalystWorkloadMetrics(analyst.id)
                const workloadRating = getWorkloadRating(totalHours)
                const isExpanded = expandedAnalyst === analyst.id

                return (
                  <Card key={analyst.id} className="overflow-hidden border-border/50">
                    <div
                      className="cursor-pointer p-6 transition-colors hover:bg-muted/30"
                      onClick={() => setExpandedAnalyst(isExpanded ? null : analyst.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20">
                              <span className="text-xl font-bold text-primary">
                                {analyst.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            {/* Workload indicator dot */}
                            <div
                              className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${
                                workloadRating.label === "Overloaded"
                                  ? "bg-red-500"
                                  : workloadRating.label === "High Load"
                                    ? "bg-orange-500"
                                    : workloadRating.label === "Optimal"
                                      ? "bg-green-500"
                                      : "bg-blue-500"
                              }`}
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-foreground">{analyst.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {analyst.role}
                              </Badge>
                            </div>
                            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {analyst.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Layers className="h-3 w-3" />
                                {assignedQueues.length} queue{assignedQueues.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          {/* Workload Rating */}
                          <div className="text-center">
                            <div
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${workloadRating.color}`}
                            >
                              <Brain className="h-4 w-4" />
                              {workloadRating.label}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">AI Rating</p>
                          </div>

                          {/* Active Cases */}
                          <div className="text-center">
                            <div className="text-2xl font-bold text-foreground">{appCount}</div>
                            <p className="text-xs text-muted-foreground">Active Cases</p>
                          </div>

                          {/* Estimated Hours */}
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-foreground">
                              <Timer className="h-5 w-5 text-muted-foreground" />
                              {totalHours.toFixed(1)}h
                            </div>
                            <p className="text-xs text-muted-foreground">Est. Work</p>
                          </div>

                          {/* Avg Complexity */}
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-foreground">
                              <Zap className="h-5 w-5 text-muted-foreground" />
                              {avgComplexity.toFixed(0)}
                            </div>
                            <p className="text-xs text-muted-foreground">Avg Complexity</p>
                          </div>

                          {/* Completed */}
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-500">
                              <CheckCircle2 className="h-5 w-5" />
                              {completedCount}
                            </div>
                            <p className="text-xs text-muted-foreground">Completed</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteAnalyst(analyst.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Workload progress bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Capacity Utilization</span>
                          <span>{Math.min(workloadRating.score, 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full transition-all ${
                              workloadRating.score >= 100
                                ? "bg-red-500"
                                : workloadRating.score >= 80
                                  ? "bg-orange-500"
                                  : workloadRating.score >= 50
                                    ? "bg-green-500"
                                    : "bg-blue-500"
                            }`}
                            style={{ width: `${Math.min(workloadRating.score, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-border bg-muted/20">
                        <div className="p-6">
                          <div className="mb-4 flex items-center justify-between">
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                              <BarChart3 className="h-4 w-4 text-primary" />
                              Assigned Cases ({apps.length})
                            </h4>
                            <div className="flex items-center gap-2">
                              {assignedQueues.map((q) => (
                                <Badge
                                  key={q.id}
                                  variant="outline"
                                  className="text-xs"
                                  style={{ borderColor: q.color, color: q.color }}
                                >
                                  {q.name}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {apps.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-border p-8 text-center">
                              <p className="text-sm text-muted-foreground">No active cases assigned</p>
                            </div>
                          ) : (
                            <div className="overflow-hidden rounded-lg border border-border">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Reference</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stage</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                      Complexity
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Est. Time</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Priority</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Reassign</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                  {apps.map((app) => {
                                    const complexity = calculateComplexityScore(app)
                                    const complexityBadge = getComplexityBadge(complexity)
                                    const estTime = estimateProcessingTime(app)
                                    const stageName = app.currentStage
                                      ? app.currentStage.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
                                      : "Intake"

                                    return (
                                      <tr key={app.id} className="transition-colors hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                          <span className="font-mono text-xs font-medium text-foreground">
                                            {app.reference}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3">
                                          <div>
                                            <p className="font-medium text-foreground">{app.customerName}</p>
                                            <p className="text-xs text-muted-foreground">{app.country}</p>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3">
                                          <Badge variant="outline" className={getStageBadge(app.currentStage)}>
                                            {stageName}
                                          </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                          <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={complexityBadge.color}>
                                              {complexityBadge.label}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">{complexity}/100</span>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3">
                                          <div className="flex items-center gap-1 text-foreground">
                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                            {estTime}h
                                          </div>
                                        </td>
                                        <td className="px-4 py-3">
                                          <div
                                            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
                                              app.priority >= 80
                                                ? "bg-red-500/10 text-red-500"
                                                : app.priority >= 50
                                                  ? "bg-orange-500/10 text-orange-500"
                                                  : "bg-green-500/10 text-green-500"
                                            }`}
                                          >
                                            {app.priority >= 80 ? <AlertTriangle className="h-3 w-3" /> : null}
                                            {app.priority}
                                          </div>
                                        </td>
                                        <td className="px-4 py-3">
                                          <Select
                                            value={app.assignedAnalyst || ""}
                                            onValueChange={(value) => handleReassign(app.id, value)}
                                          >
                                            <SelectTrigger className="h-8 w-[140px] text-xs">
                                              <SelectValue placeholder="Reassign..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="unassign">
                                                <span className="text-muted-foreground">Unassign</span>
                                              </SelectItem>
                                              {analysts
                                                .filter((a) => a.id !== analyst.id)
                                                .map((a) => (
                                                  <SelectItem key={a.id} value={a.id}>
                                                    <div className="flex items-center gap-2">
                                                      <span>{a.name}</span>
                                                      <span className="text-muted-foreground">
                                                        ({getAnalystApplications(a.id).length})
                                                      </span>
                                                    </div>
                                                  </SelectItem>
                                                ))}
                                            </SelectContent>
                                          </Select>
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* Quick stats footer */}
                          <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 p-4">
                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className="text-muted-foreground">High Priority:</span>
                                <span className="font-medium text-foreground">
                                  {apps.filter((a) => a.priority >= 80).length}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                <span className="text-muted-foreground">Complex Cases:</span>
                                <span className="font-medium text-foreground">
                                  {apps.filter((a) => calculateComplexityScore(a) >= 70).length}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Est. completion: {(totalHours / 8).toFixed(1)} days
                              </span>
                            </div>
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

      {showForm && <AnalystForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
