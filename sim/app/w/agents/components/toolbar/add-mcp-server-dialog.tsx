'use client'

import { useState } from 'react'
import { CodeIcon, DatabaseIcon } from '@/app/components/icons'
import { Button } from '@/app/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { useAgentStore } from '../../stores/store'
import { validateMcpServer } from '../../utils/mcp-server'

interface AddMcpServerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ConnectionType = 'standard_io' | 'sse'

export default function AddMcpServerDialog({ open, onOpenChange }: AddMcpServerDialogProps) {
  const { addMcpServer, selectedAgentId, addMcpServerToAgent } = useAgentStore()

  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [connectionType, setConnectionType] = useState<ConnectionType>('standard_io')
  const [command, setCommand] = useState('')
  const [arguments_, setArguments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const serverData = {
      name,
      url,
      apiKey,
      connectionType,
      command: connectionType === 'standard_io' ? command : undefined,
      arguments: connectionType === 'standard_io' ? arguments_ : undefined,
    }

    // Validate the server data
    const validation = validateMcpServer(serverData)

    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    setIsSubmitting(true)

    const newMcpServer = {
      name,
      url,
      apiKey,
      connectionType,
      command: connectionType === 'standard_io' ? command : undefined,
      arguments: connectionType === 'standard_io' ? arguments_ : undefined,
      status: 'offline' as 'online' | 'offline' | 'error',
    }

    // Add the new MCP server to the store
    const serverId = addMcpServer(newMcpServer)

    // If an agent is selected, automatically add the server to that agent
    if (selectedAgentId) {
      addMcpServerToAgent(selectedAgentId, serverId)
    }

    // Reset form and close dialog
    resetForm()
    onOpenChange(false)
    setIsSubmitting(false)
  }

  const resetForm = () => {
    setName('')
    setUrl('')
    setApiKey('')
    setCommand('')
    setArguments('')
    setConnectionType('standard_io')
    setErrors([])
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) resetForm()
        onOpenChange(state)
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Server</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {errors.length > 0 && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              <ul className="list-disc pl-5">
                {errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Server Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., api-service, data-processor"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="connectionType">Connection Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={connectionType === 'standard_io' ? 'default' : 'outline'}
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => setConnectionType('standard_io')}
              >
                <CodeIcon className="w-5 h-5" /> Standard IO
              </Button>
              <Button
                type="button"
                variant={connectionType === 'sse' ? 'default' : 'outline'}
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => setConnectionType('sse')}
              >
                <DatabaseIcon className="w-5 h-5" /> SSE
              </Button>
            </div>
          </div>

          {connectionType === 'standard_io' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="command">Command</Label>
                <Input
                  id="command"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="e.g., python3, node"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arguments">Arguments</Label>
                <Input
                  id="arguments"
                  value={arguments_}
                  onChange={(e) => setArguments(e.target.value)}
                  placeholder="e.g., path/to/script.py"
                  required
                />
              </div>
            </>
          )}

          {connectionType === 'sse' && (
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g., http://localhost:8000/events"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your API key"
            />
            <p className="text-xs text-muted-foreground">
              API key for authenticating with the MCP server
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                onOpenChange(false)
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Add Server
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
