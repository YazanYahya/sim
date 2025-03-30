'use client'

/**
 * Sidebar component for the Agent Builder
 *
 * This component provides navigation and management for agents:
 * - Lists all available agents
 * - Allows creation of new agents
 * - Handles agent selection
 */
import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Dialog, DialogTrigger } from '@/app/components/ui/dialog'
import { ScrollArea } from '@/app/components/ui/scroll-area'
import { useAgentStore } from '../../stores/store'
import CreateAgentDialog from './create-agent-dialog'

export default function Sidebar() {
  const { agents, selectedAgentId, selectAgent, mcpServers } = useAgentStore()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Ensure we have sample data loaded
  useEffect(() => {}, [agents.length])

  // Handle selecting an agent
  const handleSelectAgent = (id: string) => {
    selectAgent(id)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-medium">Agents</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sidebar-create-agent">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <CreateAgentDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
        </Dialog>
      </div>

      {agents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <p className="text-sm text-muted-foreground mb-4 text-center">No agents available</p>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {agents.map((agent) => {
              return (
                <button
                  key={agent.id}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                    ${
                      selectedAgentId === agent.id
                        ? 'bg-secondary text-foreground font-medium'
                        : 'hover:bg-muted'
                    }`}
                  onClick={() => handleSelectAgent(agent.id)}
                >
                  <div className="font-medium">{agent.config.name}</div>
                  <div className="text-xs line-clamp-2 mt-0.5 opacity-80">
                    {agent.config.description}
                  </div>
                  <div className="flex items-center mt-1.5 space-x-1">
                    <Badge variant="outline" className="px-1 py-0 text-[10px] h-4">
                      {agent.config.model}
                    </Badge>
                    {agent.config.mcpServerIds && agent.config.mcpServerIds.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {agent.config.mcpServerIds.map((serverId, index) => {
                          const server = mcpServers.find((s) => s.id === serverId)
                          return (
                            server && (
                              <Badge
                                key={index}
                                variant="outline"
                                className="px-1 py-0 text-[10px] h-4 bg-muted"
                              >
                                {server.name}
                              </Badge>
                            )
                          )
                        })}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
