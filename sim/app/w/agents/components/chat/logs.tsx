'use client'

/**
 * Logs component for the Agent Builder
 *
 * This component displays logs of communication between the agent and MCP servers
 */
import { Clock, DownloadCloud, Server, Trash2, UploadCloud } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useEffect, useRef } from 'react'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { ScrollArea } from '@/app/components/ui/scroll-area'
import { useAgentStore } from '../../stores/store'
import { LogEntry } from '../../stores/types'

export default function Logs() {
  const { agents, selectedAgentId, mcpServers, logs, clearLogs } = useAgentStore()
  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom when new logs are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [logs])

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

  // Get badge color based on log type
  const getBadgeColor = (log: LogEntry) => {
    switch (log.type) {
      case 'request':
        return 'bg-blue-50 text-blue-700'
      case 'response':
        return 'bg-green-50 text-green-700'
      case 'error':
        return 'bg-red-50 text-red-700'
      case 'info':
        return 'bg-purple-50 text-purple-700'
      default:
        return log.direction === 'inbound' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
    }
  }

  // Get badge text based on log type
  const getBadgeText = (log: LogEntry) => {
    switch (log.type) {
      case 'request':
        return 'USER'
      case 'response':
        return 'AGENT'
      case 'error':
        return 'ERROR'
      case 'info':
        return 'INFO'
      default:
        return log.direction === 'inbound' ? 'USER' : 'AGENT'
    }
  }

  return (
    <Card className="flex flex-col h-full border-0 rounded-none">
      <CardHeader className="border-b px-4 py-2 flex-row flex items-center justify-between sticky top-0 bg-background z-10">
        <div className="flex items-center">
          <Server className="h-4 w-4 text-primary mr-2" />
          <CardTitle className="text-lg">Logs</CardTitle>
        </div>
        <div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={clearLogs}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-2 p-3">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <Server className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">
                  No logs yet. Interact with the agent to see MCP server traffic.
                </p>
              </div>
            ) : (
              <>
                {filteredLogs.map((log) => (
                  <div key={log.id} className="border rounded-md p-2 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className={getBadgeColor(log)}>
                        {log.direction === 'inbound' ? (
                          <UploadCloud className="h-3 w-3 mr-1" />
                        ) : (
                          <DownloadCloud className="h-3 w-3 mr-1" />
                        )}
                        {getBadgeText(log)}
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
                      <span className="whitespace-pre-wrap">{log.content}</span>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
