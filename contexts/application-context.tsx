"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Application, Activity, ApplicationStatus } from "@/lib/types"
import { mockApplications } from "@/lib/mock-data"

interface ApplicationContextType {
  applications: Application[]
  addApplication: (application: Omit<Application, "id" | "createdAt" | "updatedAt">) => void
  updateApplication: (id: string, updates: Partial<Application>) => void
  deleteApplication: (id: string) => void
  getApplicationById: (id: string) => Application | undefined
  addActivity: (applicationId: string, activity: Omit<Activity, "id" | "timestamp">) => void
  reloadSampleData: () => void
  claimApplication: (applicationId: string, analystId: string, analystName: string) => void
  autoAssignQueue: (queueId: string, analystIds: string[], analystNames: Record<string, string>) => number
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined)

const DATA_VERSION = "v4" // Increment this to force reload sample data

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const loadSampleData = () => {
    const appsWithActivities = mockApplications.map((app) => ({
      ...app,
      activities: app.activities || [
        {
          id: `ACT-${Date.now()}-1`,
          type: "created" as const,
          description: "Application created",
          user: "System",
          timestamp: app.createdAt,
        },
      ],
    }))
    return appsWithActivities
  }

  useEffect(() => {
    const stored = localStorage.getItem("applications")
    const storedVersion = localStorage.getItem("dataVersion")
    
    // Force reload if version changed or no data
    if (!stored || storedVersion !== DATA_VERSION) {
      console.log("[v0] Loading fresh sample data - version:", DATA_VERSION)
      const freshData = loadSampleData()
      setApplications(freshData)
      localStorage.setItem("applications", JSON.stringify(freshData))
      localStorage.setItem("dataVersion", DATA_VERSION)
    } else {
      setApplications(JSON.parse(stored))
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded && applications.length > 0) {
      localStorage.setItem("applications", JSON.stringify(applications))
    }
  }, [applications, isLoaded])

  const addApplication = (application: Omit<Application, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString()
    const newApp: Application = {
      ...application,
      id: `APP-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      activities: [
        {
          id: `ACT-${Date.now()}-1`,
          type: "created",
          description: "Application created",
          user: "System",
          timestamp: now,
        },
      ],
    }
    setApplications((prev) => [...prev, newApp])
  }

  const updateApplication = (id: string, updates: Partial<Application>) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app

        const now = new Date().toISOString()
        const newActivities = [...(app.activities || [])]

        // Auto-track queue assignment
        if (updates.assignedQueue && updates.assignedQueue !== app.assignedQueue) {
          newActivities.push({
            id: `ACT-${Date.now()}-${newActivities.length}`,
            type: "assigned_queue",
            description: `Assigned to queue: ${updates.assignedQueue}`,
            user: "Manager",
            timestamp: now,
          })
        }

        // Auto-track analyst assignment
        if (updates.assignedAnalyst && updates.assignedAnalyst !== app.assignedAnalyst) {
          newActivities.push({
            id: `ACT-${Date.now()}-${newActivities.length}`,
            type: "assigned_analyst",
            description: `Assigned to analyst`,
            user: "Manager",
            timestamp: now,
          })
        }

        // Auto-track status changes
        if (updates.status && updates.status !== app.status) {
          newActivities.push({
            id: `ACT-${Date.now()}-${newActivities.length}`,
            type: "status_changed",
            description: `Status changed from ${app.status} to ${updates.status}`,
            user: "Analyst",
            timestamp: now,
          })
        }

        return {
          ...app,
          ...updates,
          activities: newActivities,
          updatedAt: now,
        }
      }),
    )
  }

  const deleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id))
  }

  const getApplicationById = (id: string) => {
    return applications.find((app) => app.id === id)
  }

  const addActivity = (applicationId: string, activity: Omit<Activity, "id" | "timestamp">) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== applicationId) return app
        return {
          ...app,
          activities: [
            ...(app.activities || []),
            {
              ...activity,
              id: `ACT-${Date.now()}-${app.activities?.length || 0}`,
              timestamp: new Date().toISOString(),
            },
          ],
          updatedAt: new Date().toISOString(),
        }
      }),
    )
  }

  const reloadSampleData = () => {
    const freshData = loadSampleData()
    setApplications(freshData)
    localStorage.setItem("applications", JSON.stringify(freshData))
    localStorage.setItem("dataVersion", DATA_VERSION)
  }

  // Analyst claims an application from the queue
  const claimApplication = (applicationId: string, analystId: string, analystName: string) => {
    const now = new Date().toISOString()
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== applicationId) return app
        return {
          ...app,
          assignedAnalyst: analystId,
          status: app.status === "pending" ? "in_progress" as ApplicationStatus : app.status,
          activities: [
            ...(app.activities || []),
            {
              id: `ACT-${Date.now()}-${app.activities?.length || 0}`,
              type: "assigned_analyst" as const,
              description: `Claimed by ${analystName}`,
              user: analystName,
              timestamp: now,
            },
          ],
          updatedAt: now,
        }
      }),
    )
  }

  // Auto-assign unassigned applications in a queue using round-robin
  const autoAssignQueue = (
    queueId: string,
    analystIds: string[],
    analystNames: Record<string, string>
  ): number => {
    if (analystIds.length === 0) return 0

    const now = new Date().toISOString()
    let assignedCount = 0

    // Get unassigned applications in this queue, sorted by priority
    const unassignedApps = applications
      .filter((app) => app.assignedQueue === queueId && !app.assignedAnalyst)
      .sort((a, b) => b.priority - a.priority)

    // Count current workload for each analyst
    const workloadCount: Record<string, number> = {}
    analystIds.forEach((id) => {
      workloadCount[id] = applications.filter(
        (app) => app.assignedAnalyst === id && app.status !== "completed"
      ).length
    })

    setApplications((prev) =>
      prev.map((app) => {
        if (app.assignedQueue !== queueId || app.assignedAnalyst) return app

        // Find analyst with lowest workload
        const sortedAnalysts = [...analystIds].sort(
          (a, b) => (workloadCount[a] || 0) - (workloadCount[b] || 0)
        )
        const selectedAnalyst = sortedAnalysts[0]

        // Update workload count for next iteration
        workloadCount[selectedAnalyst] = (workloadCount[selectedAnalyst] || 0) + 1
        assignedCount++

        return {
          ...app,
          assignedAnalyst: selectedAnalyst,
          status: app.status === "pending" ? "in_progress" as ApplicationStatus : app.status,
          activities: [
            ...(app.activities || []),
            {
              id: `ACT-${Date.now()}-${app.activities?.length || 0}`,
              type: "assigned_analyst" as const,
              description: `Auto-assigned to ${analystNames[selectedAnalyst] || "Analyst"} (workload balancing)`,
              user: "System",
              timestamp: now,
            },
          ],
          updatedAt: now,
        }
      }),
    )

    return assignedCount
  }

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        addApplication,
        updateApplication,
        deleteApplication,
        getApplicationById,
        addActivity,
        reloadSampleData,
        claimApplication,
        autoAssignQueue,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  )
}

export const useApplications = () => {
  const context = useContext(ApplicationContext)
  if (!context) throw new Error("useApplications must be used within ApplicationProvider")
  return context
}
