import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { McpClient } from '@/app/mcp/client'
import { Agent, ChatMessage, MCPServer } from '@/app/w/agents/stores/types'

interface ChatRequest {
  currentMessage: ChatMessage
  messageHistory: ChatMessage[]
  agent: Agent
  mcpServer: MCPServer
}

export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(7)
  console.log(`[${requestId}] Starting new chat request`)

  try {
    const { currentMessage, messageHistory, agent, mcpServer }: ChatRequest = await request.json()
    console.log(`[${requestId}] Request payload:`, {
      messageContent: currentMessage?.content,
      messageRole: currentMessage?.role,
      historyLength: messageHistory?.length,
      agentName: agent?.config?.name,
      serverName: mcpServer?.name,
    })

    // Prepare messages for the provider
    const messages = [...messageHistory, currentMessage]

    const client = new McpClient(mcpServer)
    await client.connect()

    // Log available tools
    const tools = await client.listTools()
    console.log(`[${requestId}] Available tools:`, tools)

    // Transform tools to OpenAI format
    const formattedTools = tools.map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.id,
        description: tool.description,
        parameters: tool.parameters,
      },
    }))

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: agent.config.apiKey,
      dangerouslyAllowBrowser: true,
    })

    // Convert messages to OpenAI format
    const formattedMessages: ChatCompletionMessageParam[] = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }))

    // Build the OpenAI request payload
    const payload = {
      model: 'gpt-3.5-turbo',
      messages: formattedMessages,
      tools: formattedTools,
      tool_choice: 'auto' as const,
    }

    try {
      // Make the initial API request
      let currentResponse = await openai.chat.completions.create(payload)
      let content = currentResponse.choices[0]?.message?.content || ''
      let currentMessages = [...formattedMessages]
      let iterationCount = 0
      const MAX_ITERATIONS = 10

      let toolCalls = []

      while (iterationCount < MAX_ITERATIONS) {
        // Check for tool calls
        const toolCallsInResponse = currentResponse.choices[0]?.message?.tool_calls
        if (!toolCallsInResponse || toolCallsInResponse.length === 0) {
          break
        }

        console.log(
          `[${requestId}] Processing ${toolCallsInResponse.length} tool calls (iteration ${iterationCount + 1}/${MAX_ITERATIONS})`
        )

        // Process each tool call
        for (const toolCall of toolCallsInResponse) {
          try {
            const toolCallStartTime = Date.now()

            const toolName = toolCall.function.name
            const toolArgs = JSON.parse(toolCall.function.arguments)

            console.log(`[${requestId}] Executing tool: ${toolName}`, toolArgs)
            const result = await client.executeTool(toolName, toolArgs)
            console.log(`[${requestId}] Tool execution result:`, result)

            const toolCallEndTime = Date.now()
            const toolCallDuration = toolCallEndTime - toolCallStartTime

            if (!result.success) continue

            toolCalls.push({
              name: toolName,
              arguments: toolArgs,
              startTime: new Date(toolCallStartTime).toISOString(),
              endTime: new Date(toolCallEndTime).toISOString(),
              duration: toolCallDuration,
              result: result.output,
            })

            // Add the tool call and result to messages
            const assistantMessage: ChatCompletionMessageParam = {
              role: 'assistant',
              content: null,
              tool_calls: [
                {
                  id: toolCall.id,
                  type: 'function',
                  function: {
                    name: toolName,
                    arguments: toolCall.function.arguments,
                  },
                },
              ],
            }
            currentMessages.push(assistantMessage)

            const toolMessage: ChatCompletionMessageParam = {
              role: 'tool',
              content: JSON.stringify(result.output),
              tool_call_id: toolCall.id,
            }
            currentMessages.push(toolMessage)
          } catch (error) {
            console.error(`[${requestId}] Error processing tool call:`, {
              error,
              toolName: toolCall?.function?.name,
            })
          }
        }

        // Make the next request with updated messages
        const nextPayload = {
          ...payload,
          messages: currentMessages,
        }

        currentResponse = await openai.chat.completions.create(nextPayload)

        if (currentResponse.choices[0]?.message?.content) {
          content = currentResponse.choices[0].message.content
        }

        iterationCount++
      }

      // Clean up MCP client
      client.disconnect()

      return NextResponse.json({
        response: content,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      })
    } catch (error) {
      // Clean up MCP client
      client.disconnect()
      throw error
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error(`[${requestId}] API Error:`, {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json({ error: errorMessage, requestId }, { status: 500 })
  }
}
