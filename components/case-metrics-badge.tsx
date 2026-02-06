import { Badge } from "@/components/ui/badge"
import type { Application } from "@/lib/types"
import { Clock, RefreshCw, RotateCcw } from "lucide-react"
import { formatDistanceToNow, differenceInDays } from "date-fns"

interface CaseMetricsBadgeProps {
  application: Application
}

export function CaseMetricsBadge({ application }: CaseMetricsBadgeProps) {
  // Calculate aging (days since creation)
  const agingDays = differenceInDays(new Date(), new Date(application.createdAt))
  
  // Calculate assignment counts from history
  const assignCount = application.assignmentHistory?.filter(
    h => h.action === "assigned_to_analyst"
  ).length || 0
  
  const reassignCount = application.assignmentHistory?.filter(
    h => h.action === "reassigned_to_analyst"
  ).length || 0
  
  const returnCount = application.returnedToQueueCount || 0

  // Color coding for aging
  const getAgingColor = (days: number) => {
    if (days >= 7) return "bg-red-500/10 text-red-600 border-red-500/30"
    if (days >= 3) return "bg-amber-500/10 text-amber-600 border-amber-500/30"
    return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
  }

  return (
    <div className="flex items-center gap-2">
      {/* Aging Badge */}
      <Badge variant="outline" className={`text-[10px] ${getAgingColor(agingDays)}`}>
        <Clock className="mr-1 h-3 w-3" />
        {agingDays}d
      </Badge>

      {/* Assignment Metrics Badge */}
      <Badge variant="outline" className="text-[10px] font-mono">
        A:{assignCount} R:{reassignCount} Q:{returnCount}
      </Badge>

      {/* Return indicator for high return count */}
      {returnCount > 1 && (
        <RotateCcw className="h-3.5 w-3.5 text-amber-500" title={`Returned ${returnCount} times`} />
      )}
    </div>
  )
}
