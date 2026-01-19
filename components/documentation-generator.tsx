"use client"

import { Button } from "@/components/ui/button"
import { FileText, Download } from "lucide-react"
import { useState } from "react"

export function DocumentationGenerator() {
  const [generating, setGenerating] = useState(false)

  const generateDocumentation = () => {
    setGenerating(true)

    // Define all pages to document
    const pages = [
      { path: "/", name: "Dashboard Overview", description: "Main dashboard showing key metrics, recent applications, queue status, and system statistics." },
      { path: "/applications", name: "Application Management", description: "Comprehensive list of all applications with search, filtering, bulk assignment, and detailed activity tracking." },
      { path: "/queues", name: "Queue Management", description: "Manage queues and view all applications within each queue with ability to assign to specific analysts." },
      { path: "/analysts", name: "Team Workload Manager", description: "View analyst workload with AI-powered capacity analysis, complexity scoring, and case assignment." },
      { path: "/rules", name: "Rules Configuration", description: "Create and manage allocation rules with visual rule builder for automatic application assignment." },
      { path: "/analytics", name: "Analytics Dashboard", description: "Visual analytics showing application distribution, queue performance, analyst workload, and SLA metrics." },
    ]

    // Generate HTML documentation
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Allocation System - Documentation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
    }
    .header {
      background: linear-gradient(135deg, #5A287F 0%, #7B4397 100%);
      color: white;
      padding: 60px 40px;
      text-align: center;
    }
    .header h1 {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    .header p {
      font-size: 20px;
      opacity: 0.9;
    }
    .meta {
      background: #f8f8f8;
      padding: 20px 40px;
      border-bottom: 1px solid #e0e0e0;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .meta-item {
      text-align: center;
    }
    .meta-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .meta-value {
      font-size: 18px;
      font-weight: 600;
      color: #5A287F;
      margin-top: 4px;
    }
    .content {
      padding: 40px;
    }
    .section {
      margin-bottom: 60px;
      page-break-inside: avoid;
    }
    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #5A287F;
    }
    .section-number {
      background: #5A287F;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 18px;
    }
    .section-title {
      font-size: 28px;
      font-weight: 700;
      color: #333;
    }
    .section-description {
      font-size: 16px;
      color: #666;
      margin-bottom: 30px;
      line-height: 1.8;
    }
    .screenshot {
      background: #f8f8f8;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 20px;
      margin-top: 20px;
      text-align: center;
    }
    .screenshot-placeholder {
      background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 100px 40px;
      color: #666;
      font-size: 14px;
    }
    .screenshot-caption {
      margin-top: 12px;
      font-size: 13px;
      color: #888;
      font-style: italic;
    }
    .features {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 24px;
      margin-top: 20px;
    }
    .features-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
    }
    .features-list {
      list-style: none;
    }
    .features-list li {
      padding: 8px 0;
      padding-left: 24px;
      position: relative;
      color: #555;
    }
    .features-list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #5A287F;
      font-weight: 700;
    }
    .footer {
      background: #333;
      color: white;
      padding: 40px;
      text-align: center;
    }
    .footer p {
      opacity: 0.8;
    }
    @media print {
      body { background: white; }
      .container { box-shadow: none; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Allocation System</h1>
      <p>Smart Onboarding Application Management Platform</p>
    </div>
    
    <div class="meta">
      <div class="meta-grid">
        <div class="meta-item">
          <div class="meta-label">Generated</div>
          <div class="meta-value">${new Date().toLocaleDateString()}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Version</div>
          <div class="meta-value">1.0</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Platform</div>
          <div class="meta-value">NatWest Bank</div>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="section">
        <h2 style="font-size: 32px; margin-bottom: 20px; color: #333;">System Overview</h2>
        <p style="font-size: 16px; line-height: 1.8; color: #666; margin-bottom: 20px;">
          The Application Allocation System is an enterprise-grade platform designed for managing 3000-5000 
          commercial applications per month. Built with intelligent rule-based automation, AI-powered workload 
          analysis, and comprehensive activity tracking.
        </p>
        <div class="features">
          <div class="features-title">Core Capabilities</div>
          <ul class="features-list">
            <li>Automated application allocation using configurable rule engine</li>
            <li>Queue-based workflow management with capacity monitoring</li>
            <li>AI-powered workload analysis and complexity scoring</li>
            <li>Comprehensive activity tracking and audit trail</li>
            <li>Real-time analytics and SLA monitoring</li>
            <li>Bulk assignment and processing for high-volume operations</li>
            <li>AI assistant for intelligent system queries</li>
          </ul>
        </div>
      </div>

      ${pages.map((page, index) => `
        <div class="section">
          <div class="section-header">
            <div class="section-number">${index + 1}</div>
            <div class="section-title">${page.name}</div>
          </div>
          <p class="section-description">${page.description}</p>
          
          <div class="screenshot">
            <div class="screenshot-placeholder">
              Screenshot: ${page.name}<br/>
              <small style="display: block; margin-top: 12px; opacity: 0.7;">
                Navigate to <strong>${window.location.origin}${page.path}</strong> to view this page
              </small>
            </div>
            <p class="screenshot-caption">Access this view at ${page.path}</p>
          </div>

          ${getPageFeatures(page.path)}
        </div>
      `).join('')}

      <div class="section">
        <h2 style="font-size: 28px; margin-bottom: 20px; color: #333;">Technical Specifications</h2>
        <div class="features">
          <div class="features-title">Architecture & Technologies</div>
          <ul class="features-list">
            <li><strong>Framework:</strong> Next.js 16 with App Router and React 19</li>
            <li><strong>UI Components:</strong> shadcn/ui with Tailwind CSS v4</li>
            <li><strong>State Management:</strong> React Context with localStorage persistence</li>
            <li><strong>Data Processing:</strong> Capable of handling 3000-5000 applications/month</li>
            <li><strong>Design System:</strong> NatWest purple branding with modern minimal aesthetic</li>
            <li><strong>AI Integration:</strong> GPT-4 powered chat assistant for system insights</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Application Allocation System Documentation</p>
      <p style="margin-top: 8px; font-size: 14px;">Generated on ${new Date().toLocaleString()}</p>
    </div>
  </div>

  <script>
    // Auto print dialog
    window.onload = function() {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  </script>
</body>
</html>
    `

    function getPageFeatures(path: string): string {
      const features: Record<string, string[]> = {
        '/': [
          'Real-time statistics: total applications, pending, in progress, completed',
          'Recent applications list with priority and status indicators',
          'Queue capacity utilization with visual progress bars',
          'Quick action buttons for common tasks'
        ],
        '/applications': [
          'Searchable table with all application details',
          'Advanced filtering by status, queue, and analyst',
          'Bulk selection and assignment capabilities',
          'Individual analyst assignment within queues',
          'Pagination for handling 1000+ applications',
          'Activity timeline showing full application history',
          'Add custom notes and track changes'
        ],
        '/queues': [
          'Visual queue cards with color coding',
          'Expandable view showing all applications in each queue',
          'Search and filter within queue',
          'Bulk assignment to analysts',
          'Analyst workload distribution per queue',
          'Capacity monitoring and alerts'
        ],
        '/analysts': [
          'AI-powered workload analysis (Optimal/High Load/Overloaded)',
          'Estimated work hours based on application complexity',
          'Average complexity scores per analyst',
          'Expandable view of assigned cases',
          'Processing stage and priority tracking',
          'Reassignment capabilities for workload balancing'
        ],
        '/rules': [
          'Visual rule builder with drag-and-drop conditions',
          'Multiple condition support (AND logic)',
          'Field-based operators: equals, not equals, greater than, less than, contains',
          'Priority-based rule execution',
          'Activate/deactivate individual rules',
          'Bulk rule execution for pending applications',
          'Rule testing and simulation'
        ],
        '/analytics': [
          'Application status distribution (pie chart)',
          'Queue distribution and capacity analysis',
          'Analyst workload comparison (bar chart)',
          'Country-based application breakdown',
          'SLA performance metrics and compliance rates',
          'Completion rate tracking'
        ]
      }

      const pageFeatures = features[path] || []
      if (pageFeatures.length === 0) return ''

      return `
        <div class="features">
          <div class="features-title">Key Features</div>
          <ul class="features-list">
            ${pageFeatures.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
      `
    }

    // Create blob and download
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Application-Allocation-System-Documentation-${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setTimeout(() => {
      setGenerating(false)
    }, 1000)
  }

  return (
    <Button
      onClick={generateDocumentation}
      disabled={generating}
      className="w-full justify-start"
    >
      {generating ? (
        <>
          <Download className="mr-2 h-4 w-4 animate-bounce" />
          Generating Documentation...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Generate System Documentation (PDF)
        </>
      )}
    </Button>
  )
}
