'use client'

import {useEffect, useRef, useState} from 'react'
import {Bot, Info, Send, Loader2} from 'lucide-react'
import {nanoid} from 'nanoid'
import {Button} from '@/app/components/ui/button'
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/app/components/ui/card'
import {Input} from '@/app/components/ui/input'
import {ScrollArea} from '@/app/components/ui/scroll-area'
import {useAgentStore} from '../../stores/store'

// Message type for chat history
interface ChatMessage {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
}

export default function Chat() {
    const {agents, selectedAgentId, mcpServers} = useAgentStore()
    const selectedAgent = agents.find((agent) => agent.id === selectedAgentId)

    const [message, setMessage] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Initialize chat with a system message
    useEffect(() => {
    }, [selectedAgent, chatMessages.length])

    // Auto scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
    }, [chatMessages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim() || !selectedAgent) return

        // Add user message to chat
        const userMessage: ChatMessage = {
            id: nanoid(),
            role: 'user',
            content: message,
        }

        setChatMessages((prev) => [...prev, userMessage])
        setMessage('')
        setIsProcessing(true)

        try {
            // This will be replaced with actual API call in the future
            await processChatMessage(userMessage, selectedAgent)
        } catch (error) {
            handleChatError(error)
        } finally {
            setIsProcessing(false)
        }
    }

    // Process message with API (simulated for now)
    const processChatMessage = async (userMessage: ChatMessage, agent: typeof selectedAgent) => {
        if (selectedAgent?.config.mcpServerIds == null) return

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Generate a response
        const assistantMessage: ChatMessage = {
            id: nanoid(),
            role: 'assistant',
            content: generateResponse(
                userMessage.content,
                selectedAgent.config.name,
                selectedAgent.config.model,
                selectedAgent.config.mcpServerIds
            ),
        }

        setChatMessages((prev) => [...prev, assistantMessage])
    }

    // Handle errors during chat
    const handleChatError = (error: any) => {
        console.error('Chat error:', error)

        const errorMessage: ChatMessage = {
            id: nanoid(),
            role: 'system',
            content: 'Error: Could not connect to MCP server. Please try again.',
        }

        setChatMessages((prev) => [...prev, errorMessage])
    }

    // Dispatch MCP event for logs
    const dispatchMcpEvent = (
        agentId: string,
        mcpServerId: string,
        userMessage: string,
        aiResponse: string
    ) => {
        window.dispatchEvent(
            new CustomEvent('mcp-request', {
                detail: {
                    agentId,
                    mcpServerId,
                    timestamp: new Date().toISOString(),
                    userMessage,
                    aiResponse,
                },
            })
        )
    }

    // Simple response generator for demo
    const generateResponse = (
        userMessage: string,
        agentName: string,
        model: string,
        servers: string[]
    ) => {

        return `I'm ${agentName}, running on ${model}. I understand you're asking about "${userMessage.substring(0, 30)}...". Let me help with that.`
    }

    return (
        <Card className="flex flex-col h-full border-0 rounded-none">
            <CardHeader className="border-b px-4 py-2 flex-row flex items-center justify-between">
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

            <CardContent className="flex-1 p-0 relative">
                <ScrollArea className="h-full">
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
                                            <Info className="h-3.5 w-3.5 mr-2"/>
                                            <span className="font-semibold">System</span>
                                        </div>
                                    )}
                                    {msg.content}
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
                        <div ref={messagesEndRef}/>
                    </div>
                </ScrollArea>
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

