"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { StatCard } from "@/components/stat-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useApplications } from "@/contexts/application-context"
import { useQueues } from "@/contexts/queue-context"
import { useAnalysts } from "@/contexts/analyst-context"
import { FileText, Layers, Users, Clock, TrendingUp, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
export default function DashboardPage() {
  const { applications } = useApplications()
  const { queues } = useQueues()
  const { analysts } = useAnalysts()

  const pendingApplications = applications.filter((app) => app.status === "pending")
  const assignedApplications = applications.filter((app) => app.status === "assigned")
  const inProgressApplications = applications.filter((app) => app.status === "in-progress")

  const avgResponseTime = applications.reduce((sum, app) => sum + app.queryResponseTime, 0) / applications.length || 0

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 pl-64">
        <div className="border-b border-border">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, here's your overview</p>
            </div>
            <Button>Generate Report</Button>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Applications"
              value={applications.length}
              description="All time submissions"
              icon={FileText}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Pending Review"
              value={pendingApplications.length}
              description="Awaiting assignment"
              icon={Clock}
              trend={{ value: 8, isPositive: false }}
            />
            <StatCard title="Active Queues" value={queues.length} description="Configured buckets" icon={Layers} />
            <StatCard title="Team Members" value={analysts.length} description="Active analysts" icon={Users} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Recent Applications</h2>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{app.reference}</span>
                        <Badge variant={app.status === "pending" ? "secondary" : "default"} className="text-xs">
                          {app.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{app.customerName}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                        <TrendingUp className="h-3 w-3 text-primary" />
                        {app.priority}
                      </div>
                      <p className="text-xs text-muted-foreground">{app.country}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Queue Status</h2>
                <Button variant="ghost" size="sm">
                  Manage
                </Button>
              </div>
              <div className="space-y-4">
                {queues.map((queue) => {
                  const queueApps = applications.filter((app) => app.assignedQueue === queue.id)
                  const utilization = queue.maxCapacity ? (queueApps.length / queue.maxCapacity) * 100 : 0

                  return (
                    <div key={queue.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: queue.color }} />
                          <span className="text-sm font-medium text-foreground">{queue.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {queueApps.length} / {queue.maxCapacity || "∞"}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${Math.min(utilization, 100)}%`,
                            backgroundColor: queue.color,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent/10 p-3">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  <p className="text-2xl font-bold text-foreground">{avgResponseTime.toFixed(1)}h</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-foreground">{inProgressApplications.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-destructive/10 p-3">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Needs Attention</p>
                  <p className="text-2xl font-bold text-foreground">
                    {applications.filter((app) => app.status === "on-hold").length}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
