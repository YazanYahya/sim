'use client'

import { Server } from 'lucide-react'
import { CodeIcon, DatabaseIcon } from '@/components/icons'
import { useAgentStore } from '../../stores/store'

interface ServerListProps {
  agentId: string
}

export default function ServerList({ agentId }: ServerListProps) {
  const { mcpServers, agents } = useAgentStore()

  const agent = agents.find((agent) => agent.id === agentId)

  if (!agent) return null

  // Filter to show only connected servers
  const connectedServers = mcpServers.filter((server) =>
    agent.config.mcpServerIds?.includes(server.id)
  )

  if (connectedServers.length === 0) return null

  return (
    <div className="w-full px-4">
      <div className="text-sm font-medium text-muted-foreground mb-2">Server List</div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {connectedServers.map((server) => (
          <div
            key={server.id}
            className="flex-shrink-0 border rounded-md p-3 hover:border-blue-200 transition-colors"
            style={{ width: '220px', minHeight: '95px' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Server className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="font-medium text-sm truncate">{server.name}</div>
            </div>
            <div className="text-xs text-muted-foreground mb-2 flex items-center">
              <span className="inline-flex items-center">
                {server.connectionType === 'sse' ? (
                  <span className="flex items-center">
                    <DatabaseIcon className="h-3.5 w-3.5 mr-1" /> sse
                  </span>
                ) : (
                  <span className="flex items-center">
                    <CodeIcon className="h-3.5 w-3.5 mr-1" /> standard_io
                  </span>
                )}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {server.connectionType === 'sse' ? (
                <div className="truncate">
                  <span className="font-medium">URL:</span> {server.url}
                </div>
              ) : (
                <>
                  <div className="truncate mb-1">
                    <span className="font-medium">Command:</span> {server.command}
                  </div>
                  <div className="truncate">
                    <span className="font-medium">Arguments:</span> {server.arguments}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
