'use client'

import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { Textarea } from '@/app/components/ui/textarea'
import { useAgentStore } from '../../stores/store'
import { validateAgentConfig } from '../../utils/agent'

interface CreateAgentDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function CreateAgentDialog({ open, onOpenChange }: CreateAgentDialogProps) {
  const { addAgent, selectAgent } = useAgentStore()

  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [model, setModel] = useState('Claude 3 Sonnet')
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Use internal state if no external state is provided
  const dialogOpen = open !== undefined ? open : isOpen
  const setDialogOpen = onOpenChange || setIsOpen

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Create a config for validation
    const config = {
      name,
      description,
      model,
      systemPrompt,
    }

    // Validate the configuration
    const validation = validateAgentConfig(config)

    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    setIsSubmitting(true)

    const newAgent = {
      config: {
        name,
        description,
        model,
        systemPrompt,
      },
    }

    // Add the agent
    const agentId = addAgent(newAgent)

    // Select the newly created agent
    selectAgent(agentId)

    // Reset form
    resetForm()

    // Close dialog
    setDialogOpen(false)
    setIsSubmitting(false)
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setModel('Claude 3 Sonnet')
    setSystemPrompt('You are a helpful assistant.')
    setErrors([])
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
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
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Customer Support Agent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Handles customer inquiries and support requests."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select value={model} onValueChange={setModel} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
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

          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Instructions for the agent..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                setDialogOpen(false)
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Agent'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
