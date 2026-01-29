"use client"

import { useMemo, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useApplications } from "@/contexts/application-context"
import { useQueues } from "@/contexts/queue-context"
import {
  FileText,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Pause,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts"

type TimeFrame = "7d" | "30d" | "90d" | "all"

export default function ExecutiveDashboard() {
  const { applications } = useApplications()
  const { queues } = useQueues()
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("30d")

  const filteredApplications = useMemo(() => {
    const now = new Date()
    const daysMap: Record<TimeFrame, number> = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "all": 9999,
    }
    const cutoffDate = new Date(now.getTime() - daysMap[timeFrame] * 24 * 60 * 60 * 1000)
    
    return applications.filter((app) => new Date(app.createdAt) >= cutoffDate)
  }, [applications, timeFrame])

  // KPI Calculations
  const totalApplications = filteredApplications.length
  const newApplications = filteredApplications.filter((app) => {
    const created = new Date(app.createdAt)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return created >= weekAgo
  }).length

  const pendingApplications = filteredApplications.filter((app) => app.status === "pending").length
  const inProgressApplications = filteredApplications.filter((app) => app.status === "in-progress").length
  const completedApplications = filteredApplications.filter((app) => app.status === "completed").length
  const onHoldApplications = filteredApplications.filter((app) => app.status === "on-hold").length
  const assignedApplications = filteredApplications.filter((app) => app.status === "assigned").length

  // Average processing time (using queryResponseTime as proxy)
  const avgProcessingTime = filteredApplications.length > 0
    ? filteredApplications.reduce((sum, app) => sum + app.queryResponseTime, 0) / filteredApplications.length
    : 0

  // Status distribution for pie chart
  const statusData = [
    { name: "Pending", value: pendingApplications, color: "#f59e0b" },
    { name: "Assigned", value: assignedApplications, color: "#3b82f6" },
    { name: "In Progress", value: inProgressApplications, color: "#8b5cf6" },
    { name: "Completed", value: completedApplications, color: "#22c55e" },
    { name: "On Hold", value: onHoldApplications, color: "#ef4444" },
  ].filter((item) => item.value > 0)

  // Segment distribution
  const ukApplications = filteredApplications.filter((app) => app.isUKBased).length
  const intlApplications = filteredApplications.filter((app) => !app.isUKBased).length
  const complexApplications = filteredApplications.filter((app) => app.isComplex).length
  const simpleApplications = filteredApplications.filter((app) => !app.isComplex).length

  const segmentData = [
    { name: "UK Based", value: ukApplications },
    { name: "International", value: intlApplications },
  ]

  const complexityData = [
    { name: "Complex", value: complexApplications },
    { name: "Simple", value: simpleApplications },
  ]

  // Queue bottleneck analysis
  const queueBottlenecks = queues.map((queue) => {
    const queueApps = filteredApplications.filter((app) => app.assignedQueue === queue.id)
    const pendingInQueue = queueApps.filter((app) => app.status === "pending" || app.status === "assigned").length
    return {
      name: queue.name.replace(" Queue", ""),
      pending: pendingInQueue,
      total: queueApps.length,
      color: queue.color,
    }
  }).sort((a, b) => b.pending - a.pending)

  // Applications over time (last 7 days breakdown)
  const applicationsOverTime = useMemo(() => {
    const days = timeFrame === "7d" ? 7 : timeFrame === "30d" ? 30 : timeFrame === "90d" ? 90 : 30
    const data = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))
      
      const count = applications.filter((app) => {
        const created = new Date(app.createdAt)
        return created >= dayStart && created <= dayEnd
      }).length

      data.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", { 
          day: "2-digit", 
          month: "short" 
        }),
        applications: count,
      })
    }
    // Show fewer data points for longer timeframes
    if (days > 14) {
      return data.filter((_, i) => i % Math.ceil(days / 14) === 0)
    }
    return data
  }, [applications, timeFrame])

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 pl-64">
        <div className="border-b border-border bg-card">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Executive Dashboard</h1>
              <p className="text-sm text-muted-foreground">Onboarding process performance overview</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={timeFrame} onValueChange={(v) => setTimeFrame(v as TimeFrame)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
              <Button>Export Report</Button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">{totalApplications}</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">+{newApplications}</span>
                <span className="text-muted-foreground">this week</span>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">{pendingApplications}</p>
                </div>
                <div className="rounded-lg bg-amber-500/10 p-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">{((pendingApplications / totalApplications) * 100 || 0).toFixed(0)}% of total</span>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">{inProgressApplications}</p>
                </div>
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">Being processed</span>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Processing Time</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">{avgProcessingTime.toFixed(1)}h</p>
                </div>
                <div className="rounded-lg bg-purple-500/10 p-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm">
                <ArrowDownRight className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">-2.3h</span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">On Hold</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">{onHoldApplications}</p>
                </div>
                <div className="rounded-lg bg-destructive/10 p-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">Needs attention</span>
              </div>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Applications Over Time */}
            <Card className="col-span-2 p-6">
              <h3 className="mb-4 text-base font-semibold text-foreground">Applications Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={applicationsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="applications" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Status Distribution */}
            <Card className="p-6">
              <h3 className="mb-4 text-base font-semibold text-foreground">Status Distribution</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Segment Analysis */}
            <Card className="p-6">
              <h3 className="mb-4 text-base font-semibold text-foreground">Applications by Segment</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="mb-3 text-sm font-medium text-muted-foreground">Region</p>
                  <div className="space-y-3">
                    {segmentData.map((item) => (
                      <div key={item.name}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{item.name}</span>
                          <span className="font-medium text-foreground">{item.value}</span>
                        </div>
                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${(item.value / totalApplications) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-sm font-medium text-muted-foreground">Complexity</p>
                  <div className="space-y-3">
                    {complexityData.map((item, index) => (
                      <div key={item.name}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{item.name}</span>
                          <span className="font-medium text-foreground">{item.value}</span>
                        </div>
                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${(item.value / totalApplications) * 100}%`,
                              backgroundColor: index === 0 ? "hsl(var(--chart-3))" : "hsl(var(--chart-2))"
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Queue Bottlenecks */}
            <Card className="p-6">
              <h3 className="mb-4 text-base font-semibold text-foreground">Queue Bottlenecks</h3>
              <p className="mb-4 text-sm text-muted-foreground">Where applications are waiting</p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={queueBottlenecks} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis 
                      type="number" 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      width={80}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="pending" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Status Summary Cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
            <Card className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-amber-500/10 p-2">
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-lg font-semibold text-foreground">{pendingApplications}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-blue-500/10 p-2">
                <FileText className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Assigned</p>
                <p className="text-lg font-semibold text-foreground">{assignedApplications}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-purple-500/10 p-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">In Progress</p>
                <p className="text-lg font-semibold text-foreground">{inProgressApplications}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-green-500/10 p-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-lg font-semibold text-foreground">{completedApplications}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-destructive/10 p-2">
                <Pause className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">On Hold</p>
                <p className="text-lg font-semibold text-foreground">{onHoldApplications}</p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
