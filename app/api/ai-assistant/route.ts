import { generateText } from 'ai'

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json()

    const systemPrompt = `You are an AI assistant for a NatWest application allocation system. You help users understand and manage commercial onboarding applications.

Current System Context:
- Total Applications: ${context.applications.length}
- Total Queues: ${context.queues.length}
- Total Analysts: ${context.analysts.length}

Available Data:
${JSON.stringify(context, null, 2)}

Your capabilities:
1. Answer questions about specific applications (search by reference, customer name, country)
2. Provide queue status and capacity information
3. Show analyst workload and assignments
4. Identify bottlenecks or issues (overloaded queues, unassigned applications)
5. Suggest recommendations for workload balancing
6. Explain application stages and progress

Be concise, helpful, and data-driven. When referencing applications, use their reference numbers. If asked about something not in the data, politely explain what information is available.`

    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      maxTokens: 500,
      temperature: 0.7
    })

    return Response.json({ message: text })
  } catch (error) {
    console.error('[v0] AI Assistant API error:', error)
    return Response.json(
      { message: 'Sorry, I encountered an error processing your request.' },
      { status: 500 }
    )
  }
}
