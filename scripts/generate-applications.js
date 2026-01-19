// AI Agent to generate realistic application data for testing high-volume processing
// Simulates 50-60 applications with diverse characteristics for NatWest onboarding system

const fs = require("fs")

const countries = [
  "United Kingdom",
  "United States",
  "Germany",
  "France",
  "Netherlands",
  "Spain",
  "Italy",
  "Belgium",
  "Switzerland",
  "Ireland",
  "Singapore",
  "Hong Kong",
  "Australia",
  "Canada",
  "Japan",
]

const ukRegions = ["London", "Manchester", "Edinburgh", "Birmingham", "Leeds", "Bristol"]

const companyTypes = [
  "Ltd",
  "PLC",
  "Holdings",
  "Group",
  "Corporation",
  "Industries",
  "Technologies",
  "Solutions",
  "Ventures",
  "Capital",
  "Partners",
]

const companyNames = [
  "Acme",
  "Global",
  "Premier",
  "Advanced",
  "United",
  "International",
  "Royal",
  "Sterling",
  "Capital",
  "Titan",
  "Phoenix",
  "Summit",
  "Horizon",
  "Vertex",
  "Nexus",
  "Atlas",
  "Quantum",
  "Zenith",
]

const behaviors = ["responsive", "slow", "poor"]

// Generate realistic company name
function generateCompanyName() {
  const name = companyNames[Math.floor(Math.random() * companyNames.length)]
  const type = companyTypes[Math.floor(Math.random() * companyTypes.length)]
  const hasMiddle = Math.random() > 0.5

  if (hasMiddle) {
    const middle = companyNames[Math.floor(Math.random() * companyNames.length)]
    return `${name} ${middle} ${type}`
  }
  return `${name} ${type}`
}

// Generate realistic application data
function generateApplication(index) {
  const isUKBased = Math.random() > 0.4 // 60% UK applications
  const country = isUKBased ? "United Kingdom" : countries[Math.floor(Math.random() * countries.length)]

  const numberOfKP = Math.floor(Math.random() * 15) + 1 // 1-15 KP
  const numberOfDocuments = Math.floor(Math.random() * 30) + 5 // 5-35 documents
  const cashAmount = Math.floor(Math.random() * 5000000) + 50000 // £50k - £5M

  const isComplex = numberOfKP > 8 || cashAmount > 1000000 || numberOfDocuments > 20

  // SLA metrics - more realistic with normal distribution
  const submissionSpeed = Math.max(1, Math.floor(Math.random() * 48) + 1) // 1-48 hours
  const queryResponseTime = Math.max(2, Math.floor(Math.random() * 72) + 2) // 2-72 hours

  // Customer behavior correlates with response time
  let customerBehavior
  if (queryResponseTime < 12) customerBehavior = "responsive"
  else if (queryResponseTime < 36) customerBehavior = "slow"
  else customerBehavior = "poor"

  // Calculate initial priority based on factors
  let priority = 50
  if (isUKBased) priority += 10
  if (isComplex) priority += 15
  if (cashAmount > 1000000) priority += 10
  if (submissionSpeed < 12) priority += 10
  if (customerBehavior === "responsive") priority += 10
  if (customerBehavior === "poor") priority -= 15

  priority = Math.min(100, Math.max(0, priority + Math.floor(Math.random() * 20) - 10))

  const statuses = ["pending", "pending", "pending", "assigned", "in-progress"]
  const status = statuses[Math.floor(Math.random() * statuses.length)]

  const daysAgo = Math.floor(Math.random() * 30)
  const createdAt = new Date()
  createdAt.setDate(createdAt.getDate() - daysAgo)

  return {
    id: `APP-${String(index + 1).padStart(3, "0")}`,
    reference: `${isUKBased ? "UK" : country.substring(0, 2).toUpperCase()}-2024-${String(index + 1).padStart(3, "0")}`,
    customerName: generateCompanyName(),
    country,
    numberOfKP,
    numberOfDocuments,
    cashAmount,
    isUKBased,
    isComplex,
    submissionSpeed,
    queryResponseTime,
    customerBehavior,
    status,
    priority,
    assignedQueue: null,
    assignedAnalyst: null,
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
  }
}

// Generate 60 applications
const applications = []
for (let i = 0; i < 60; i++) {
  applications.push(generateApplication(i))
}

console.log(`Generated ${applications.length} applications`)
console.log(`UK-based: ${applications.filter((a) => a.isUKBased).length}`)
console.log(`Complex: ${applications.filter((a) => a.isComplex).length}`)
console.log(`High value (>£1M): ${applications.filter((a) => a.cashAmount > 1000000).length}`)
console.log(`High priority (>80): ${applications.filter((a) => a.priority > 80).length}`)

// Save to localStorage format
console.log("\nApplications data generated successfully!")
console.log("Copy the following to your browser console to load:")
console.log(
  `\nlocalStorage.setItem('allocation-applications', JSON.stringify(${JSON.stringify(applications, null, 2)}));`,
)
console.log("\nThen refresh the page.")
