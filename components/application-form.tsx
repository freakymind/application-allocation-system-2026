"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApplications } from "@/contexts/application-context"
import type { CustomerBehavior } from "@/lib/types"
import { X } from "lucide-react"

interface ApplicationFormProps {
  onClose: () => void
}

export function ApplicationForm({ onClose }: ApplicationFormProps) {
  const { addApplication } = useApplications()
  const [formData, setFormData] = useState({
    reference: "",
    customerName: "",
    country: "",
    numberOfKP: 0,
    numberOfDocuments: 0,
    cashAmount: 0,
    isUKBased: false,
    isComplex: false,
    submissionSpeed: 0,
    queryResponseTime: 0,
    customerBehavior: "responsive" as CustomerBehavior,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addApplication({
      ...formData,
      status: "pending",
      priority: 0,
      assignedQueue: null,
      assignedAnalyst: null,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">New Application</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfKP">Number of KP</Label>
              <Input
                id="numberOfKP"
                type="number"
                value={formData.numberOfKP}
                onChange={(e) => setFormData({ ...formData, numberOfKP: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfDocuments">Number of Documents</Label>
              <Input
                id="numberOfDocuments"
                type="number"
                value={formData.numberOfDocuments}
                onChange={(e) => setFormData({ ...formData, numberOfDocuments: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cashAmount">Cash Amount</Label>
              <Input
                id="cashAmount"
                type="number"
                value={formData.cashAmount}
                onChange={(e) => setFormData({ ...formData, cashAmount: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submissionSpeed">Submission Speed (hours)</Label>
              <Input
                id="submissionSpeed"
                type="number"
                value={formData.submissionSpeed}
                onChange={(e) => setFormData({ ...formData, submissionSpeed: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="queryResponseTime">Query Response Time (hours)</Label>
              <Input
                id="queryResponseTime"
                type="number"
                value={formData.queryResponseTime}
                onChange={(e) => setFormData({ ...formData, queryResponseTime: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerBehavior">Customer Behavior</Label>
              <Select
                value={formData.customerBehavior}
                onValueChange={(value) => setFormData({ ...formData, customerBehavior: value as CustomerBehavior })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="responsive">Responsive</SelectItem>
                  <SelectItem value="slow">Slow</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isUKBased"
                  checked={formData.isUKBased}
                  onChange={(e) => setFormData({ ...formData, isUKBased: e.target.checked })}
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="isUKBased">UK Based</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isComplex"
                  checked={formData.isComplex}
                  onChange={(e) => setFormData({ ...formData, isComplex: e.target.checked })}
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="isComplex">Complex</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Application</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
