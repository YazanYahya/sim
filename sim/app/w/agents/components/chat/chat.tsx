'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Bot, Info, Loader2, Send } from 'lucide-react'
import { nanoid } from 'nanoid'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { useAgentStore } from '../../stores/store'
import { Agent, ChatMessage, LogEntry } from '../../stores/types'

export default function Chat() {
  const { agents, selectedAgentId, mcpServers, addLog } = useAgentStore()
  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId)

  const [message, setMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [sessionId] = useState(nanoid())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize chat with a system message
  useEffect(() => {
    if (selectedAgent && chatMessages.length === 0) {
      const systemMessage: ChatMessage = {
        id: nanoid(),
        sessionId: sessionId,
        role: 'system',
        content: selectedAgent.config.systemPrompt || 'How can I help you today?',
        timestamp: new Date().toISOString(),
      }
      setChatMessages([systemMessage])
    }
  }, [selectedAgent, chatMessages.length, sessionId])

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !selectedAgent) return

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: nanoid(),
      sessionId: sessionId,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setMessage('')
    setIsProcessing(true)

    try {
      await processChatMessage(userMessage, selectedAgent)
    } catch (error) {
      console.error('Error processing message with provider:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const processChatMessage = async (userMessage: ChatMessage, agent: Agent) => {
    if (!agent?.config.mcpServerIds?.length) {
      return
    }

    try {
      const mcpServerId = agent.config.mcpServerIds[0]
      const mcpServer = mcpServers.find((server) => server.id === mcpServerId)

      if (!mcpServer) {
        throw new Error('MCP server not found')
      }

      // Add user message to logs
      const userLog: LogEntry = {
        timestamp: new Date().toISOString(),
        agentId: agent.id,
        mcpServerId,
        direction: 'inbound',
        content: userMessage.content,
        type: 'request',
      }
      addLog(userLog)

      // Call the MCP chat API endpoint
      const response = await fetch('/api/mcp/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentMessage: userMessage,
          messageHistory: chatMessages,
          agent,
          mcpServer,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from API')
      }

      // Add the assistant response to chat
      const assistantMessage: ChatMessage = {
        id: nanoid(),
        sessionId: sessionId,
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      }

      setChatMessages((prev) => [...prev, assistantMessage])

      // If there are tool calls, add them to logs
      if (data.toolCalls?.length > 0) {
        data.toolCalls.forEach((toolCall: any) => {
          const toolCallLog: LogEntry = {
            timestamp: toolCall.startTime,
            agentId: agent.id,
            mcpServerId,
            direction: 'outbound',
            content: `Tool Call: ${toolCall.name}`,
          }
          addLog(toolCallLog)
        })
      }

      // Add assistant response to logs
      const assistantLog: LogEntry = {
        timestamp: new Date().toISOString(),
        agentId: agent.id,
        mcpServerId,
        direction: 'outbound',
        content: data.response,
        type: 'response',
      }
      addLog(assistantLog)
    } catch (error) {
      console.error('Error processing message with provider:', error)

      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: nanoid(),
        sessionId: sessionId,
        role: 'system',
        content: 'Failed to process message. Please try again.',
        timestamp: new Date().toISOString(),
      }
      setChatMessages((prev) => [...prev, errorMessage])

      // Add error to logs
      const errorLog: LogEntry = {
        timestamp: new Date().toISOString(),
        agentId: agent.id,
        mcpServerId: agent.config.mcpServerIds[0],
        direction: 'outbound',
        content:
          error instanceof Error ? error.message : 'Failed to process message. Please try again.',
        type: 'error',
      }
      addLog(errorLog)
    }
  }

  return (
    <Card className="flex flex-col h-full border-0 rounded-none">
      <CardHeader className="border-b px-4 py-2 flex-row flex items-center justify-between sticky top-0 bg-background z-10">
        <div className="flex items-center">
          <Bot className="h-4 w-4 text-primary mr-2" />
          <CardTitle className="text-lg">Chat with Agent</CardTitle>
        </div>
        <div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0">
            <Bot className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 relative overflow-auto">
        <div className="p-4 space-y-4">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-lg p-3 max-w-[80%] text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : msg.role === 'system'
                      ? 'bg-muted text-muted-foreground text-xs'
                      : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {msg.role === 'system' && (
                  <div className="flex items-center mb-1">
                    <Info className="h-3.5 w-3.5 mr-2" />
                    <span className="font-semibold">System</span>
                  </div>
                )}
                {msg.role === 'user' ? (
                  <div>{msg.content}</div>
                ) : (
                  <div className="prose !text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                      </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="rounded-lg p-3 bg-secondary text-secondary-foreground text-sm flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      <CardFooter className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 w-full">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isProcessing || !selectedAgent}
            className="flex-1 text-sm"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isProcessing || !message.trim() || !selectedAgent}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
