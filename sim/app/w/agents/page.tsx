'use client'

import { useEffect, useState } from 'react'
import { useAgentStore } from './stores/store'
import Sidebar from './components/sidebar/sidebar'
import Toolbar from './components/toolbar/toolbar'
import Chat from './components/chat/chat'
import Logs from './components/chat/logs'
import ServerList from '@/app/w/agents/components/server-list/server-list'

export default function AgentsPage() {
  const { selectedAgentId, initSampleData, agents } = useAgentStore()
  const [isLoading, setIsLoading] = useState(true)

  // Initialize sample data on mount
  useEffect(() => {
    if (agents.length === 0) {
      initSampleData()
    }
    setIsLoading(false)
  }, [initSampleData, agents.length])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar - full height */}
      <div className="w-64 border-r h-full overflow-hidden">
        <Sidebar />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Toolbar - always visible for better UX */}
        <div className="border-b">
          <Toolbar />
        </div>
        
        {/* Content area */}
        {selectedAgentId ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Server List */}
            <div className="py-3 border-b">
              <ServerList agentId={selectedAgentId} />
            </div>
            
            {/* Chat and Logs */}
            <div className="flex flex-1 overflow-hidden">
              {/* Chat section - left side */}
              <div className="flex-1 border-r overflow-hidden">
                <Chat />
              </div>
              
              {/* Logs section - right side */}
              <div className="w-1/3 overflow-hidden">
                <Logs />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Select an agent to begin or create a new one
              </p>
              <button
                onClick={() => {
                  // Find the sidebar component and trigger the create dialog
                  const createBtn = document.querySelector('.sidebar-create-agent')
                  if (createBtn instanceof HTMLElement) {
                    createBtn.click()
                  }
                }}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Create Agent
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
