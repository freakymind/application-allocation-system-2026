"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Card } from "@/components/ui/card"
import { useApplications } from "@/contexts/application-context"
import { useQueues } from "@/contexts/queue-context"
import { useAnalysts } from "@/contexts/analyst-context"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"

export default function AnalyticsPage() {
  const { applications } = useApplications()
  const { queues } = useQueues()
  const { analysts } = useAnalysts()

  // Status distribution
  const statusData = [
    { name: "Pending", value: applications.filter((a) => a.status === "pending").length },
    { name: "Assigned", value: applications.filter((a) => a.status === "assigned").length },
    { name: "In Progress", value: applications.filter((a) => a.status === "in-progress").length },
    { name: "Completed", value: applications.filter((a) => a.status === "completed").length },
    { name: "On Hold", value: applications.filter((a) => a.status === "on-hold").length },
  ]

  // Queue distribution
  const queueData = queues.map((queue) => ({
    name: queue.name,
    applications: applications.filter((app) => app.assignedQueue === queue.id).length,
    color: queue.color,
  }))

  // Analyst workload
  const analystData = analysts.map((analyst) => ({
    name: analyst.name,
    workload: applications.filter((app) => app.assignedAnalyst === analyst.id && app.status !== "completed").length,
  }))

  // Country distribution
  const countryMap = new Map<string, number>()
  applications.forEach((app) => {
    countryMap.set(app.country, (countryMap.get(app.country) || 0) + 1)
  })
  const countryData = Array.from(countryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  // SLA metrics
  const avgSubmissionSpeed = applications.reduce((sum, app) => sum + app.submissionSpeed, 0) / applications.length || 0
  const avgResponseTime = applications.reduce((sum, app) => sum + app.queryResponseTime, 0) / applications.length || 0
  const completionRate = applications.length
    ? (applications.filter((a) => a.status === "completed").length / applications.length) * 100
    : 0
  const onTimeRate = applications.length
    ? (applications.filter((a) => a.queryResponseTime < 24).length / applications.length) * 100
    : 0

  const COLORS = ["#8b5cf6", "#10b981", "#f59e0b", "#3b82f6", "#ef4444"]

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 pl-64">
        <div className="border-b border-border">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
              <p className="text-sm text-muted-foreground">Insights and performance metrics</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* KPI Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold text-foreground">{applications.length}</p>
                </div>
              </div>
            </Card>

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
                <div className="rounded-lg bg-green-500/10 p-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold text-foreground">{completionRate.toFixed(1)}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-500/10 p-3">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">On-Time Rate</p>
                  <p className="text-2xl font-bold text-foreground">{onTimeRate.toFixed(1)}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="mb-6 text-lg font-semibold text-foreground">Applications by Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="mb-6 text-lg font-semibold text-foreground">Applications by Queue</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={queueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" tick={{ fill: "#999" }} />
                  <YAxis tick={{ fill: "#999" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }} />
                  <Bar dataKey="applications" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="mb-6 text-lg font-semibold text-foreground">Analyst Workload</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analystData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" tick={{ fill: "#999" }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "#999" }} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }} />
                  <Bar dataKey="workload" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="mb-6 text-lg font-semibold text-foreground">Top 5 Countries</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={countryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" tick={{ fill: "#999" }} />
                  <YAxis tick={{ fill: "#999" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* SLA Performance Table */}
          <Card className="mt-6 p-6">
            <h3 className="mb-6 text-lg font-semibold text-foreground">SLA Performance Metrics</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border p-4">
                <p className="mb-2 text-sm text-muted-foreground">Avg Submission Speed</p>
                <p className="text-2xl font-bold text-foreground">{avgSubmissionSpeed.toFixed(1)}h</p>
                <p className="mt-1 text-xs text-muted-foreground">Time to submit docs</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="mb-2 text-sm text-muted-foreground">Avg Query Response</p>
                <p className="text-2xl font-bold text-foreground">{avgResponseTime.toFixed(1)}h</p>
                <p className="mt-1 text-xs text-muted-foreground">Customer response time</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="mb-2 text-sm text-muted-foreground">UK Applications</p>
                <p className="text-2xl font-bold text-foreground">{applications.filter((a) => a.isUKBased).length}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {((applications.filter((a) => a.isUKBased).length / applications.length) * 100 || 0).toFixed(1)}% of
                  total
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="mb-2 text-sm text-muted-foreground">Complex Applications</p>
                <p className="text-2xl font-bold text-foreground">{applications.filter((a) => a.isComplex).length}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {((applications.filter((a) => a.isComplex).length / applications.length) * 100 || 0).toFixed(1)}% of
                  total
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
