"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useRules } from "@/contexts/rule-context"
import { useQueues } from "@/contexts/queue-context"
import { useApplications } from "@/contexts/application-context"
import { RuleBuilder } from "@/components/rule-builder"
import { Plus, Trash2, Power, PowerOff, ChevronRight } from "lucide-react"
import { applyRules } from "@/lib/rule-engine"

export default function RulesPage() {
  const { rules, updateRule, deleteRule } = useRules()
  const { queues } = useQueues()
  const { applications, updateApplication } = useApplications()
  const [showBuilder, setShowBuilder] = useState(false)

  const getQueueName = (queueId: string) => {
    return queues.find((q) => q.id === queueId)?.name || "Unknown Queue"
  }

  const getQueueColor = (queueId: string) => {
    return queues.find((q) => q.id === queueId)?.color || "#6b7280"
  }

  const toggleRuleStatus = (ruleId: string, currentStatus: boolean) => {
    updateRule(ruleId, { isActive: !currentStatus })
  }

  const runAllRules = () => {
    applications.forEach((app) => {
      if (app.status === "pending") {
        const result = applyRules(app, rules)
        if (result) {
          updateApplication(app.id, {
            assignedQueue: result.queueId,
            priority: result.priority,
            status: "assigned",
          })
        }
      }
    })
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 pl-64">
        <div className="border-b border-border">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Rules Engine</h1>
              <p className="text-sm text-muted-foreground">Configure automatic application allocation rules</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={runAllRules}>
                Run All Rules
              </Button>
              <Button onClick={() => setShowBuilder(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Rule
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-6 flex items-center gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <ChevronRight className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Rules are evaluated in priority order</p>
              <p className="text-xs text-muted-foreground">Lower priority numbers are evaluated first</p>
            </div>
          </div>

          {rules.length === 0 ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-lg bg-muted p-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">No rules configured</h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  Create your first rule to start automating application allocation
                </p>
                <Button onClick={() => setShowBuilder(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Rule
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {rules
                .sort((a, b) => a.priority - b.priority)
                .map((rule) => (
                  <Card key={rule.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-3 flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-foreground">{rule.name}</h3>
                          <Badge variant={rule.isActive ? "default" : "secondary"}>
                            {rule.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">Priority: {rule.priority}</Badge>
                        </div>

                        <div className="mb-4 space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Conditions:</p>
                          <div className="flex flex-wrap gap-2">
                            {rule.conditions.map((condition, index) => (
                              <Badge key={index} variant="outline" className="font-mono text-xs">
                                {condition.field} {condition.operator} {String(condition.value)}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Assigns to:</span>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: getQueueColor(rule.actions.bucketId) }}
                              />
                              <span className="text-sm font-medium text-foreground">
                                {getQueueName(rule.actions.bucketId)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Priority Score:</span>
                            <span className="text-sm font-medium text-foreground">{rule.actions.priorityScore}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleRuleStatus(rule.id, rule.isActive)}
                          title={rule.isActive ? "Deactivate" : "Activate"}
                        >
                          {rule.isActive ? (
                            <Power className="h-4 w-4 text-accent" />
                          ) : (
                            <PowerOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </main>

      {showBuilder && <RuleBuilder onClose={() => setShowBuilder(false)} />}
    </div>
  )
}
