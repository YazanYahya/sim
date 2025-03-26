'use client'

/**
 * Logs component for the Agent Builder
 *
 * This component displays logs of communication between the agent and MCP servers
 */
import { useEffect, useState } from 'react'
import { Clock, DownloadCloud, Server, Trash2, UploadCloud } from 'lucide-react'
import { nanoid } from 'nanoid'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { ScrollArea } from '@/app/components/ui/scroll-area'
import { useAgentStore } from '../../stores/store'

// Define the log entry type
interface LogEntry {
  id: string
  timestamp: string
  agentId: string
  mcpServerId: string
  direction: 'inbound' | 'outbound'
  message: string
}

// Define the event detail type for type safety
interface McpRequestEvent {
  agentId: string
  mcpServerId: string
  timestamp: string
  userMessage: string
  aiResponse: string
}

export default function Logs() {
  const { agents, selectedAgentId, mcpServers } = useAgentStore()
  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId)

  const [logs, setLogs] = useState<LogEntry[]>([])

  // Add sample logs if none exist yet and an agent is selected
  useEffect(() => {
    if (selectedAgent && logs.length === 0) {
      addSampleLogs(selectedAgent.id)
    }
  }, [selectedAgent, logs.length, mcpServers])

  // Add inbound (user) message log
  const addUserMessageLog = (
    agentId: string,
    mcpServerId: string,
    timestamp: string,
    message: string
  ) => {
    const inboundLog: LogEntry = {
      id: nanoid(),
      timestamp,
      agentId,
      mcpServerId,
      direction: 'inbound',
      message,
    }

    setLogs((prevLogs) => [...prevLogs, inboundLog])
  }

  // Add outbound (agent) response log
  const addAgentResponseLog = (agentId: string, mcpServerId: string, message: string) => {
    const outboundLog: LogEntry = {
      id: nanoid(),
      timestamp: new Date().toISOString(),
      agentId,
      mcpServerId,
      direction: 'outbound',
      message,
    }

    setLogs((prevLogs) => [...prevLogs, outboundLog])
  }

  // Add sample logs for a newly selected agent
  const addSampleLogs = (agentId: string) => {
    const timestamp = new Date().toISOString()
    const earlier = new Date(Date.now() - 60000).toISOString() // 1 minute ago

    // Get the agent info
    const agent = agents.find((a) => a.id === agentId)
    if (!agent) return

    // Get a random MCP server for the agent
    const mcpServerId = agent.config.mcpServerIds?.[0]

    if (!mcpServerId) return

    // Sample logs
    const sampleLogs: LogEntry[] = [
      {
        id: nanoid(),
        timestamp: earlier,
        agentId,
        mcpServerId,
        direction: 'inbound',
        message: 'Hello, can you help me with a question about your product?',
      },
      {
        id: nanoid(),
        timestamp: timestamp,
        agentId,
        mcpServerId,
        direction: 'outbound',
        message: `Hi there! I'm ${agent.config.name} running on ${agent.config.model}. I'd be happy to help with your product questions. What would you like to know?`,
      },
    ]

    setLogs(sampleLogs)
  }

  // Clear logs
  const handleClearLogs = () => {
    setLogs([])
  }

  // Get MCP server name by ID
  const getMcpServerName = (id: string) => {
    const server = mcpServers.find((server) => server.id === id)
    return server ? server.name : id
  }

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  // Filter logs for the selected agent
  const filteredLogs = selectedAgent ? logs.filter((log) => log.agentId === selectedAgent.id) : []

  return (
    <Card className="flex flex-col h-full border-0 rounded-none">
      <CardHeader className="border-b px-4 py-2 flex-row flex items-center justify-between">
        <div className="flex items-center">
          <Server className="h-4 w-4 text-primary mr-2" />
          <CardTitle className="text-lg">Logs</CardTitle>
        </div>
        <div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleClearLogs}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-3">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <Server className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">
                  No logs yet. Interact with the agent to see MCP server traffic.
                </p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-md p-2 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <Badge
                      variant="outline"
                      className={
                        log.direction === 'inbound'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-green-50 text-green-700'
                      }
                    >
                      {log.direction === 'inbound' ? (
                        <UploadCloud className="h-3 w-3 mr-1" />
                      ) : (
                        <DownloadCloud className="h-3 w-3 mr-1" />
                      )}
                      {log.direction === 'inbound' ? 'USER' : 'AGENT'}
                    </Badge>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(log.timestamp)}
                    </div>
                  </div>
                  <div className="flex items-center mb-1">
                    <Server className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span className="font-medium">{getMcpServerName(log.mcpServerId)}</span>
                  </div>
                  <div className="mt-1 border-t pt-1 text-muted-foreground">
                    <span className="line-clamp-2">{log.message}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
