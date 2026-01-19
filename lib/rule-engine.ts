import type { Application, Rule, RuleCondition } from "./types"

export function evaluateCondition(app: Application, condition: RuleCondition): boolean {
  const fieldValue = app[condition.field as keyof Application]

  switch (condition.operator) {
    case "equals":
      return fieldValue === condition.value
    case "not_equals":
      return fieldValue !== condition.value
    case "greater_than":
      return typeof fieldValue === "number" && fieldValue > (condition.value as number)
    case "less_than":
      return typeof fieldValue === "number" && fieldValue < (condition.value as number)
    case "contains":
      return typeof fieldValue === "string" && fieldValue.toLowerCase().includes(String(condition.value).toLowerCase())
    case "between":
      if (Array.isArray(condition.value) && typeof fieldValue === "number") {
        return fieldValue >= condition.value[0] && fieldValue <= condition.value[1]
      }
      return false
    default:
      return false
  }
}

export function evaluateRule(app: Application, rule: Rule): boolean {
  if (!rule.isActive) return false
  return rule.conditions.every((condition) => evaluateCondition(app, condition))
}

export function applyRules(app: Application, rules: Rule[]): { queueId: string; priority: number } | null {
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority)

  for (const rule of sortedRules) {
    if (evaluateRule(app, rule)) {
      return {
        queueId: rule.actions.bucketId,
        priority: rule.actions.priorityScore,
      }
    }
  }

  return null
}
