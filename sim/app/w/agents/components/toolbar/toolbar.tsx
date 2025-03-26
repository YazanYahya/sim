'use client'

/**
 * Toolbar component for the Agent Builder
 *
 * This component provides configuration tools for agents:
 * - Model selection controls
 * - MCP server connection management
 * - Prompt configuration options
 * - Testing and deployment actions
 * - Save/publish functionality
 */
import { useEffect, useState } from 'react'
import { Globe, Plus, Settings, Trash } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { ScrollArea } from '@/app/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/app/components/ui/sheet'
import { Textarea } from '@/app/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/components/ui/tooltip'
import { useAgentStore } from '../../stores/store'
import AddMcpServerDialog from './add-mcp-server-dialog'

interface ToolbarProps {}

export default function Toolbar({}: ToolbarProps) {
  const { agents, selectedAgentId, deleteAgent, updateAgent, updateAgentConfig } = useAgentStore()

  // States for agent data and UI controls
  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [addMcpServerOpen, setAddMcpServerOpen] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)

  // Initialize form values when agent changes
  useEffect(() => {
    if (selectedAgent) {
      setName(selectedAgent.config.name)
      setDescription(selectedAgent.config.description)
      setSystemPrompt(selectedAgent.config.systemPrompt)
    }
  }, [selectedAgent])

  // Handle agent deletion
  const handleDeleteAgent = () => {
    if (selectedAgentId) {
      deleteAgent(selectedAgentId)
      setConfirmDeleteOpen(false)
    }
  }

  // Handle model change
  const handleModelChange = (value: string) => {
    if (!selectedAgent) return

    updateAgentConfig(selectedAgent.id, {
      model: value,
    })
  }

  // Handle save changes
  const handleSave = () => {
    if (!selectedAgent) return

    updateAgent(selectedAgent.id, {
      config: {
        ...selectedAgent.config,
        name,
        description,
        systemPrompt,
      },
    })

    // Close any open sheets
    setConfigOpen(false)
  }

  // Handle publish
  const handlePublishClick = () => {
    console.log('Publishing agent')
  }

  if (!selectedAgent) {
    return (
      <div className="h-16 border-b px-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">No agent selected</div>
      </div>
    )
  }

  return (
    <>
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Agent info and controls */}
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="text-sm font-medium">{selectedAgent.config.name}</h3>
            <p className="text-xs text-muted-foreground truncate max-w-[180px]">
              {selectedAgent.config.description}
            </p>
          </div>

          {/* Model selection */}
          <div className="w-[180px]">
            <Select value={selectedAgent.config.model} onValueChange={handleModelChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="Claude 3 Opus">Claude 3 Opus</SelectItem>
                <SelectItem value="Claude 3 Sonnet">Claude 3 Sonnet</SelectItem>
                <SelectItem value="Claude 3 Haiku">Claude 3 Haiku</SelectItem>
                <SelectItem value="Llama 3 70B">Llama 3 70B</SelectItem>
                <SelectItem value="Llama 3 8B">Llama 3 8B</SelectItem>
                <SelectItem value="Mistral Large">Mistral Large</SelectItem>
                <SelectItem value="Mistral Small">Mistral Small</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Add Server Button */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 h-8 text-xs"
            onClick={() => setAddMcpServerOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Add Server</span>
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Agent Config Button */}
          <Sheet open={configOpen} onOpenChange={setConfigOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2 h-8">
                <Settings className="h-4 w-4" />
                <span className="text-xs">Configure</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[450px] sm:w-[540px] overflow-hidden">
              <SheetHeader className="px-3 pt-3">
                <SheetTitle>Agent Configuration</SheetTitle>
                <SheetDescription>Configure your agent's settings and behavior</SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-210px)] mt-2">
                <div className="space-y-4 pb-6 px-3">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Agent name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What this agent does..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="systemPrompt">System Prompt</Label>
                    <Textarea
                      id="systemPrompt"
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder="Instructions for the agent..."
                      rows={10}
                    />
                    <p className="text-xs text-muted-foreground">
                      The system prompt defines how your agent behaves and responds. Be specific
                      about the agent's role, knowledge, and limitations.
                    </p>
                  </div>
                </div>
              </ScrollArea>
              <SheetFooter className="px-3 pb-3 pt-2 border-t">
                <SheetClose asChild>
                  <Button variant="outline">Cancel</Button>
                </SheetClose>
                <Button onClick={handleSave}>Save Changes</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {/* Delete Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDeleteOpen(true)}
                  className="flex items-center h-8 text-destructive border-destructive/20 hover:bg-destructive/10"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete agent</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Publish Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handlePublishClick}
                  className="flex items-center gap-2 h-8"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-xs">Publish</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Publish agent to the configured servers</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the agent "{selectedAgent.config.name}". This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAgent}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add MCP server dialog */}
      <AddMcpServerDialog open={addMcpServerOpen} onOpenChange={setAddMcpServerOpen} />
    </>
  )
}
