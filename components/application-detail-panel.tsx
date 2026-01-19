"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import type { Application } from "@/lib/types"
import { useApplications } from "@/contexts/application-context"
import { useQueues } from "@/contexts/queue-context"
import { useAnalysts } from "@/contexts/analyst-context"
import {
  FileText,
  DollarSign,
  MapPin,
  Users,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  Circle,
  AlertCircle,
  Play,
  Pause,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ApplicationDetailPanelProps {
  application: Application | null
  onClose: () => void
}

export function ApplicationDetailPanel({ application, onClose }: ApplicationDetailPanelProps) {
  const { addActivity } = useApplications()
  const { queues } = useQueues()
  const { analysts } = useAnalysts()
  const [note, setNote] = useState("")

  if (!application) return null

  const queue = queues.find((q) => q.id === application.assignedQueue)
  const analyst = analysts.find((a) => a.id === application.assignedAnalyst)

  const handleAddNote = () => {
    if (!note.trim()) return
    addActivity(application.id, {
      type: "note_added",
      description: note,
      user: "Current User",
    })
    setNote("")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Play className="h-4 w-4 text-blue-500" />
      case "on-hold":
        return <Pause className="h-4 w-4 text-yellow-500" />
      case "assigned":
        return <AlertCircle className="h-4 w-4 text-purple-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "created":
        return <Circle className="h-4 w-4 text-primary" />
      case "assigned_queue":
        return <Users className="h-4 w-4 text-purple-500" />
      case "assigned_analyst":
        return <Users className="h-4 w-4 text-blue-500" />
      case "status_changed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "priority_updated":
        return <TrendingUp className="h-4 w-4 text-orange-500" />
      case "note_added":
        return <MessageSquare className="h-4 w-4 text-cyan-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Dialog open={!!application} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-semibold">{application.reference}</DialogTitle>
              <p className="text-lg text-muted-foreground mt-1">{application.customerName}</p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(application.status)}
              <Badge variant="outline" className="capitalize">
                {application.status}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 mt-6">
          {/* Application Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase">Application Details</h3>

            <div className="space-y-3 rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Country</p>
                  <p className="text-sm font-medium">{application.country}</p>
                </div>
                {application.isUKBased && (
                  <Badge variant="secondary" className="ml-auto">
                    UK Based
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Key Personnel</p>
                  <p className="text-sm font-medium">{application.numberOfKP} KP</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Documents</p>
                  <p className="text-sm font-medium">{application.numberOfDocuments} files</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Cash Amount</p>
                  <p className="text-sm font-medium">£{application.cashAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Priority Score</p>
                  <p className="text-sm font-medium">{application.priority}/100</p>
                </div>
              </div>

              {application.isComplex && (
                <Badge variant="destructive" className="w-full justify-center">
                  Complex Application
                </Badge>
              )}
            </div>

            {/* SLA Metrics */}
            <div className="space-y-3 rounded-lg border border-border bg-card p-4">
              <h4 className="text-sm font-semibold">SLA Metrics</h4>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Submission Speed</span>
                  <span className="text-sm font-medium">{application.submissionSpeed}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Query Response Time</span>
                  <span className="text-sm font-medium">{application.queryResponseTime}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Customer Behavior</span>
                  <Badge variant={application.customerBehavior === "responsive" ? "default" : "secondary"}>
                    {application.customerBehavior}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Assignment Info */}
            <div className="space-y-3 rounded-lg border border-border bg-card p-4">
              <h4 className="text-sm font-semibold">Assignment</h4>

              {queue && (
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: queue.color }} />
                  <span className="text-sm">{queue.name}</span>
                </div>
              )}

              {analyst && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{analyst.name}</span>
                </div>
              )}

              {!queue && !analyst && <p className="text-sm text-muted-foreground">Not assigned yet</p>}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase">Activity Timeline</h3>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {application.activities?.map((activity, index) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-card border border-border p-1.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    {index < (application.activities?.length || 0) - 1 && (
                      <div className="w-px h-full bg-border mt-1" />
                    )}
                  </div>

                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{activity.user}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Note */}
            <div className="space-y-2 pt-4 border-t border-border">
              <h4 className="text-sm font-semibold">Add Note</h4>
              <Textarea
                placeholder="Add a note to the timeline..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-20"
              />
              <Button onClick={handleAddNote} size="sm" className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
