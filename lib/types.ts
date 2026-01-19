export type ApplicationStatus = "pending" | "assigned" | "in-progress" | "completed" | "on-hold"
export type CustomerBehavior = "responsive" | "slow" | "poor" | "excellent"
export type UserRole = "admin" | "manager" | "analyst" | "viewer"

export interface Application {
  id: string
  reference: string
  customerName: string
  country: string
  numberOfKP: number
  numberOfDocuments: number
  cashAmount: number
  isUKBased: boolean
  isComplex: boolean
  submissionSpeed: number // hours
  queryResponseTime: number // hours
  customerBehavior: CustomerBehavior
  status: ApplicationStatus
  priority: number // 0-100
  assignedQueue: string | null
  assignedAnalyst: string | null
  createdAt: string
  updatedAt: string
  activities: Activity[] // Added activity timeline to track application progress
}

export interface Activity {
  id: string
  type: "created" | "assigned_queue" | "assigned_analyst" | "status_changed" | "priority_updated" | "note_added"
  description: string
  user: string
  timestamp: string
  metadata?: Record<string, any>
}

export type RuleOperator = "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "between"

export interface RuleCondition {
  field: string
  operator: RuleOperator
  value: string | number | boolean | [number, number]
}

export interface Rule {
  id: string
  name: string
  priority: number
  isActive: boolean
  conditions: RuleCondition[]
  actions: {
    bucketId: string
    priorityScore: number
  }
  createdAt: string
  updatedAt: string
}

export interface Queue {
  id: string
  name: string
  description: string
  color: string
  maxCapacity: number | null
  analystIds: string[]
  applicationCount: number
  createdAt: string
}

export interface Analyst {
  id: string
  name: string
  email: string
  role: UserRole
  queueIds: string[]
  workload: number
  createdAt: string
}

export interface Assignment {
  id: string
  applicationId: string
  analystId: string
  queueId: string
  assignedAt: string
  assignedBy: string
}
