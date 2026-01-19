import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1">
          <span className={trend.isPositive ? "text-accent" : "text-destructive"}>
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-muted-foreground">vs last period</span>
        </div>
      )}
    </Card>
  )
}
