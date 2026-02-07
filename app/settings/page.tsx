"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings2, Database, Bell, Shield, RefreshCw, FileText } from "lucide-react"
import { useApplications } from "@/contexts/application-context"
import { useQueues } from "@/contexts/queue-context"
import { useRules } from "@/contexts/rule-context"
import { useAnalysts } from "@/contexts/analyst-context"
import { useState } from "react"

export default function SettingsPage() {
  const { applications, reloadSampleData } = useApplications()
  const { queues } = useQueues()
  const { rules } = useRules()
  const { analysts } = useAnalysts()
  const [reloading, setReloading] = useState(false)

  const handleReloadData = () => {
    setReloading(true)
    reloadSampleData()
    setTimeout(() => {
      setReloading(false)
      window.location.reload()
    }, 500)
  }

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      localStorage.clear()
      window.location.reload()
    }
  }
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 pl-64">
        <div className="border-b border-border">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">Configure system preferences</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-3xl space-y-6">
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Settings2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">General Settings</h3>
                  <p className="text-sm text-muted-foreground">Basic configuration options</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-assign applications</Label>
                    <p className="text-sm text-muted-foreground">Automatically run rules on new applications</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email notifications</Label>
                    <p className="text-sm text-muted-foreground">Send email updates on assignments</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-accent/10 p-2">
                  <Bell className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
                  <p className="text-sm text-muted-foreground">Manage notification preferences</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SLA breach alerts</Label>
                    <p className="text-sm text-muted-foreground">Alert when applications miss SLA targets</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Queue capacity warnings</Label>
                    <p className="text-sm text-muted-foreground">Notify when queues reach capacity</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Documentation</h3>
                  <p className="text-sm text-muted-foreground">Export system documentation for your team</p>
                </div>
              </div>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Documentation
                </Button>
                <p className="text-xs text-muted-foreground">
                  Export a comprehensive document with all screens, features, and technical specifications.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Data Management</h3>
                  <p className="text-sm text-muted-foreground">Manage stored data</p>
                </div>
              </div>
              <div className="mb-4 grid grid-cols-4 gap-4 rounded-lg bg-muted p-4">
                <div>
                  <div className="text-2xl font-bold text-foreground">{applications.length}</div>
                  <div className="text-xs text-muted-foreground">Applications</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{queues.length}</div>
                  <div className="text-xs text-muted-foreground">Queues</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{rules.length}</div>
                  <div className="text-xs text-muted-foreground">Rules</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{analysts.length}</div>
                  <div className="text-xs text-muted-foreground">Analysts</div>
                </div>
              </div>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={handleReloadData}
                  disabled={reloading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${reloading ? "animate-spin" : ""}`} />
                  {reloading ? "Reloading..." : "Reload Sample Data (60 Applications)"}
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Database className="mr-2 h-4 w-4" />
                  Export All Data
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive bg-transparent"
                  onClick={handleClearData}
                >
                  Clear All Data
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-orange-500/10 p-2">
                  <Shield className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Security</h3>
                  <p className="text-sm text-muted-foreground">Access and permission settings</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-factor authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Audit logging</Label>
                    <p className="text-sm text-muted-foreground">Log all system activities</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
