"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AppSidebar } from "@/components/app-sidebar"
import { useApplications } from "@/contexts/application-context"
import { useQueues } from "@/contexts/queue-context"
import { useAnalysts } from "@/contexts/analyst-context"
import { useRules } from "@/contexts/rule-context"
import {
  FileText,
  Download,
  Camera,
  CheckCircle,
  Loader2,
  LayoutDashboard,
  FileStack,
  Layers,
  Users,
  Settings,
  BarChart3,
} from "lucide-react"

interface ScreenCapture {
  name: string
  path: string
  description: string
  features: string[]
  icon: React.ReactNode
  captured: boolean
  dataUrl?: string
}

export default function DocumentationPage() {
  const { applications } = useApplications()
  const { queues } = useQueues()
  const { analysts } = useAnalysts()
  const { rules } = useRules()
  const [screens, setScreens] = useState<ScreenCapture[]>([
    {
      name: "Dashboard Overview",
      path: "/",
      description: "Main dashboard showing key metrics, recent applications, queue status, and system statistics for quick operational insights.",
      features: [
        "Real-time statistics: total applications, pending, in progress, completed",
        "Recent applications list with priority and status indicators",
        "Queue capacity utilization with visual progress bars",
        "Quick action buttons for common tasks",
      ],
      icon: <LayoutDashboard className="h-5 w-5" />,
      captured: false,
    },
    {
      name: "Application Management",
      path: "/applications",
      description: "Comprehensive list of all applications with search, filtering, bulk assignment, and detailed activity tracking for high-volume processing.",
      features: [
        "Searchable table with all application details",
        "Advanced filtering by status, queue, and analyst",
        "Bulk selection and assignment capabilities",
        "Pagination for handling 1000+ applications",
        "Activity timeline showing full application history",
      ],
      icon: <FileStack className="h-5 w-5" />,
      captured: false,
    },
    {
      name: "Queue Management",
      path: "/queues",
      description: "Manage queues and view all applications within each queue with the ability to assign cases to specific analysts.",
      features: [
        "Visual queue cards with color coding",
        "Expandable view showing all applications in each queue",
        "Search and filter within queue",
        "Bulk assignment to analysts",
        "Capacity monitoring and alerts",
      ],
      icon: <Layers className="h-5 w-5" />,
      captured: false,
    },
    {
      name: "Team Workload Manager",
      path: "/analysts",
      description: "View analyst workload with AI-powered capacity analysis, complexity scoring, and intelligent case assignment.",
      features: [
        "AI-powered workload analysis (Optimal/High Load/Overloaded)",
        "Estimated work hours based on application complexity",
        "Average complexity scores per analyst",
        "Reassignment capabilities for workload balancing",
      ],
      icon: <Users className="h-5 w-5" />,
      captured: false,
    },
    {
      name: "Rules Configuration",
      path: "/rules",
      description: "Create and manage allocation rules with a visual rule builder for automatic application assignment based on criteria.",
      features: [
        "Visual rule builder with multiple conditions",
        "Field-based operators: equals, greater than, less than, contains",
        "Priority-based rule execution",
        "Bulk rule execution for pending applications",
      ],
      icon: <Settings className="h-5 w-5" />,
      captured: false,
    },
    {
      name: "Analytics Dashboard",
      path: "/analytics",
      description: "Visual analytics showing application distribution, queue performance, analyst workload, and SLA metrics.",
      features: [
        "Application status distribution charts",
        "Queue distribution and capacity analysis",
        "Analyst workload comparison",
        "SLA performance metrics and compliance rates",
      ],
      icon: <BarChart3 className="h-5 w-5" />,
      captured: false,
    },
  ])

  const [generating, setGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState("")
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const captureScreenshots = async () => {
    setGenerating(true)
    setCurrentStep("Loading html2canvas library...")

    // Dynamically load html2canvas
    const script = document.createElement("script")
    script.src = "https://html2canvas.hertzen.com/dist/html2canvas.min.js"
    script.async = true

    await new Promise<void>((resolve, reject) => {
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Failed to load html2canvas"))
      document.head.appendChild(script)
    })

    const updatedScreens = [...screens]

    for (let i = 0; i < screens.length; i++) {
      const screen = screens[i]
      setCurrentStep(`Capturing ${screen.name} (${i + 1}/${screens.length})...`)

      // Create iframe to load page
      const iframe = document.createElement("iframe")
      iframe.style.width = "1400px"
      iframe.style.height = "900px"
      iframe.style.position = "absolute"
      iframe.style.left = "-9999px"
      iframe.style.top = "0"
      iframe.src = screen.path
      document.body.appendChild(iframe)

      await new Promise((resolve) => setTimeout(resolve, 2000))

      try {
        // @ts-ignore - html2canvas is loaded dynamically
        const canvas = await window.html2canvas(iframe.contentDocument?.body || iframe.contentWindow?.document.body, {
          width: 1400,
          height: 900,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#f5f5f5",
        })
        updatedScreens[i] = {
          ...updatedScreens[i],
          captured: true,
          dataUrl: canvas.toDataURL("image/png"),
        }
      } catch (error) {
        console.log("[v0] Screenshot capture failed for", screen.name, "- using placeholder")
        updatedScreens[i] = {
          ...updatedScreens[i],
          captured: true,
        }
      }

      document.body.removeChild(iframe)
      setScreens([...updatedScreens])
    }

    setCurrentStep("Generating PDF document...")
    await generatePDF(updatedScreens)
    setGenerating(false)
    setCurrentStep("")
  }

  const generatePDF = async (capturedScreens: ScreenCapture[]) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Allocation System - Documentation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4 landscape; margin: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: white;
    }
    .page {
      width: 100%;
      min-height: 100vh;
      padding: 40px;
      page-break-after: always;
      background: white;
    }
    .page:last-child { page-break-after: avoid; }
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, #5A287F 0%, #7B4397 50%, #9B59B6 100%);
      color: white;
    }
    .cover h1 {
      font-size: 56px;
      font-weight: 800;
      margin-bottom: 20px;
      letter-spacing: -1px;
    }
    .cover p {
      font-size: 24px;
      opacity: 0.9;
      margin-bottom: 60px;
    }
    .cover-meta {
      display: flex;
      gap: 60px;
      margin-top: 40px;
    }
    .cover-meta-item {
      text-align: center;
    }
    .cover-meta-value {
      font-size: 36px;
      font-weight: 700;
    }
    .cover-meta-label {
      font-size: 14px;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .screen-page {
      display: flex;
      flex-direction: column;
    }
    .screen-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 3px solid #5A287F;
    }
    .screen-number {
      background: #5A287F;
      color: white;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 20px;
      flex-shrink: 0;
    }
    .screen-title {
      font-size: 32px;
      font-weight: 700;
      color: #1a1a1a;
    }
    .screen-path {
      font-size: 14px;
      color: #5A287F;
      font-family: monospace;
      background: #f5f0fa;
      padding: 4px 12px;
      border-radius: 4px;
      margin-left: auto;
    }
    .screen-description {
      font-size: 16px;
      color: #555;
      margin-bottom: 24px;
      line-height: 1.8;
    }
    .screenshot-container {
      flex: 1;
      background: #f8f8f8;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
    }
    .screenshot-container img {
      max-width: 100%;
      max-height: 450px;
      object-fit: contain;
    }
    .screenshot-placeholder {
      padding: 100px;
      text-align: center;
      color: #888;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 16px;
      background: #f9f9f9;
      border-radius: 8px;
      font-size: 14px;
      color: #444;
    }
    .feature-check {
      color: #5A287F;
      font-weight: 700;
      flex-shrink: 0;
    }
    .toc-page h2 {
      font-size: 36px;
      color: #5A287F;
      margin-bottom: 40px;
    }
    .toc-list {
      list-style: none;
    }
    .toc-item {
      display: flex;
      align-items: center;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
      font-size: 20px;
    }
    .toc-number {
      width: 40px;
      height: 40px;
      background: #5A287F;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      margin-right: 20px;
    }
    .toc-title { flex: 1; color: #333; }
    .toc-page-num { color: #5A287F; font-weight: 600; }
    .tech-page h2 {
      font-size: 36px;
      color: #5A287F;
      margin-bottom: 40px;
    }
    .tech-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }
    .tech-card {
      background: #f9f9f9;
      border-radius: 12px;
      padding: 24px;
    }
    .tech-card h3 {
      font-size: 18px;
      color: #5A287F;
      margin-bottom: 12px;
    }
    .tech-card p {
      font-size: 14px;
      color: #666;
      line-height: 1.7;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #888;
    }
    @media print {
      .page { padding: 30px; }
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="page cover">
    <h1>Application Allocation System</h1>
    <p>Smart Onboarding Application Management Platform</p>
    <div class="cover-meta">
      <div class="cover-meta-item">
        <div class="cover-meta-value">${applications.length}</div>
        <div class="cover-meta-label">Applications</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-value">${queues.length}</div>
        <div class="cover-meta-label">Queues</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-value">${analysts.length}</div>
        <div class="cover-meta-label">Analysts</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-value">${rules.length}</div>
        <div class="cover-meta-label">Rules</div>
      </div>
    </div>
    <div style="margin-top: 80px; opacity: 0.8;">
      <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Generated</div>
      <div style="font-size: 20px;">${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</div>
    </div>
  </div>

  <!-- Table of Contents -->
  <div class="page toc-page">
    <h2>Table of Contents</h2>
    <ul class="toc-list">
      ${capturedScreens.map((screen, i) => `
        <li class="toc-item">
          <div class="toc-number">${i + 1}</div>
          <span class="toc-title">${screen.name}</span>
          <span class="toc-page-num">Page ${i + 3}</span>
        </li>
      `).join("")}
      <li class="toc-item">
        <div class="toc-number">T</div>
        <span class="toc-title">Technical Specifications</span>
        <span class="toc-page-num">Page ${capturedScreens.length + 3}</span>
      </li>
    </ul>
  </div>

  <!-- Screen Pages -->
  ${capturedScreens.map((screen, i) => `
    <div class="page screen-page">
      <div class="screen-header">
        <div class="screen-number">${i + 1}</div>
        <div class="screen-title">${screen.name}</div>
        <div class="screen-path">${screen.path}</div>
      </div>
      <p class="screen-description">${screen.description}</p>
      <div class="screenshot-container">
        ${screen.dataUrl 
          ? `<img src="${screen.dataUrl}" alt="${screen.name} Screenshot" />`
          : `<div class="screenshot-placeholder">
              <div style="font-size: 48px; margin-bottom: 16px;">📸</div>
              <div style="font-size: 18px; margin-bottom: 8px;">Screenshot Preview</div>
              <div>Navigate to <strong>${window.location.origin}${screen.path}</strong></div>
            </div>`
        }
      </div>
      <div class="features-grid">
        ${screen.features.map(f => `
          <div class="feature-item">
            <span class="feature-check">✓</span>
            <span>${f}</span>
          </div>
        `).join("")}
      </div>
      <div class="footer">Application Allocation System Documentation • Page ${i + 3}</div>
    </div>
  `).join("")}

  <!-- Technical Specifications -->
  <div class="page tech-page">
    <h2>Technical Specifications</h2>
    <div class="tech-grid">
      <div class="tech-card">
        <h3>Framework & Runtime</h3>
        <p>Built on Next.js 16 with App Router and React 19, providing server-side rendering, optimized performance, and modern React features including concurrent rendering.</p>
      </div>
      <div class="tech-card">
        <h3>UI Components</h3>
        <p>Utilizes shadcn/ui component library with Tailwind CSS v4 for consistent, accessible, and customizable user interface elements following NatWest brand guidelines.</p>
      </div>
      <div class="tech-card">
        <h3>State Management</h3>
        <p>React Context API with localStorage persistence for offline capability. Designed for easy migration to database backend (Supabase/Neon) when needed.</p>
      </div>
      <div class="tech-card">
        <h3>Data Processing</h3>
        <p>Optimized for high-volume operations, capable of handling 3000-5000 applications per month with pagination, bulk operations, and efficient filtering.</p>
      </div>
      <div class="tech-card">
        <h3>Rule Engine</h3>
        <p>Configurable rule-based allocation system supporting multiple conditions, operators, and priority-based execution for automatic application assignment.</p>
      </div>
      <div class="tech-card">
        <h3>AI Integration</h3>
        <p>GPT-4 powered chat assistant for intelligent queries about applications, workload analysis, and system insights with natural language understanding.</p>
      </div>
    </div>
    <div class="footer" style="margin-top: 40px;">Application Allocation System Documentation • Technical Specifications</div>
  </div>
</body>
</html>
    `

    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Application-Allocation-System-Documentation-${new Date().toISOString().split("T")[0]}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1">
        <div className="border-b border-border bg-card px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Documentation Generator</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Generate comprehensive documentation with screenshots for your team
              </p>
            </div>
            <Button onClick={captureScreenshots} disabled={generating} size="lg" className="gap-2">
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {currentStep}
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Generate PDF Documentation
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Pages to Document</h2>
            <p className="text-sm text-muted-foreground">
              The following screens will be captured and included in your documentation PDF.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {screens.map((screen, index) => (
              <Card key={screen.path} className="p-5 relative">
                {screen.captured && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {screen.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{screen.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{screen.path}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{screen.description}</p>
                <div className="space-y-1">
                  {screen.features.slice(0, 3).map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="text-primary mt-0.5">•</span>
                      <span className="line-clamp-1">{feature}</span>
                    </div>
                  ))}
                  {screen.features.length > 3 && (
                    <p className="text-xs text-primary">+{screen.features.length - 3} more features</p>
                  )}
                </div>
                {screen.dataUrl && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-border">
                    <img src={screen.dataUrl || "/placeholder.svg"} alt={screen.name} className="w-full h-24 object-cover object-top" />
                  </div>
                )}
              </Card>
            ))}
          </div>

          <Card className="mt-8 p-6 bg-muted/50">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">How to Create a PDF</h3>
                <ol className="text-sm text-muted-foreground space-y-2">
                  <li>1. Click "Generate PDF Documentation" to download the HTML file</li>
                  <li>2. Open the downloaded HTML file in your browser (Chrome recommended)</li>
                  <li>3. Press <kbd className="px-2 py-0.5 bg-background rounded border text-xs">Ctrl/Cmd + P</kbd> to open print dialog</li>
                  <li>4. Select "Save as PDF" as the destination</li>
                  <li>5. Choose "Landscape" orientation for best results</li>
                  <li>6. Click "Save" to create your PDF</li>
                </ol>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
