'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { useApplications } from '@/contexts/application-context'
import { useQueues } from '@/contexts/queue-context'
import { useAnalysts } from '@/contexts/analyst-context'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you with application details, queue status, analyst workload, and answer questions about your allocation system. What would you like to know?'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { applications } = useApplications()
  const { queues } = useQueues()
  const { analysts } = useAnalysts()

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      // Create context data for AI
      const contextData = {
        applications: applications.map(app => ({
          reference: app.reference,
          customerName: app.customerName,
          country: app.country,
          status: app.status,
          priority: app.priority,
          assignedQueue: app.assignedQueue,
          assignedAnalyst: app.assignedAnalyst,
          currentStage: app.currentStage,
          numberOfKP: app.numberOfKP,
          cashAmount: app.cashAmount,
          isComplex: app.isComplex
        })),
        queues: queues.map(q => ({
          id: q.id,
          name: q.name,
          applicationCount: applications.filter(a => a.assignedQueue === q.id).length,
          maxCapacity: q.maxCapacity
        })),
        analysts: analysts.map(a => ({
          id: a.id,
          name: a.name,
          role: a.role,
          workload: applications.filter(app => app.assignedAnalyst === a.id).length
        }))
      }

      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: contextData
        })
      })

      const data = await response.json()
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (error) {
      console.error('[v0] AI Assistant error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Panel */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[600px] flex flex-col shadow-2xl border-2">
          {/* Header */}
          <div className="border-b p-4 bg-primary text-primary-foreground rounded-t-lg">
            <h3 className="font-semibold text-lg">AI Assistant</h3>
            <p className="text-sm opacity-90">Ask me anything about applications</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-2 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about applications, queues, analysts..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
