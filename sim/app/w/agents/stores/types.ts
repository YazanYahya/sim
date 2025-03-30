/**
 * Type Definitions for Agent Builder
 *
 * This module defines the TypeScript interfaces and types used throughout the Agent Builder:
 * - Data models for agents, MCP servers, and chat sessions
 * - State interfaces for Zustand stores
 * - Type definitions for UI state and actions
 * - Utility types for filtering and sorting
 *
 * @module AgentTypes
 */

export interface MCPServer {
  id: string
  name: string
  url: string
  apiKey?: string
  connectionType?: 'standard_io' | 'sse'
  command?: string
  arguments?: string
  status?: 'online' | 'offline' | 'error'
  envVariables?: Record<string, string>
}

export interface AgentConfig {
  name: string
  description: string
  model: string
  apiKey: string
  systemPrompt: string
  mcpServerIds?: string[]
  metadata?: Record<string, any>
}

export interface Agent {
  id: string
  config: AgentConfig
}

export interface ChatMessage {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

export interface ChatSession {
  id: string
  agentId: string
  title: string
  createdAt: string
  updatedAt: string
  messages: ChatMessage[]
}

export interface Message {
  id: string
  agentId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  status?: 'sending' | 'sent' | 'received' | 'error'
}

export interface LogEntry {
  id?: string
  timestamp: string
  agentId: string
  mcpServerId: string
  direction: 'inbound' | 'outbound'
  content: string
  type?: 'request' | 'response' | 'error' | 'info'
}

type AgentSortOption = 'name' | 'createdAt' | 'updatedAt'
type SortDirection = 'asc' | 'desc'

export interface AgentState {
  // Collections
  agents: Agent[]
  mcpServers: MCPServer[]
  chatSessions: ChatSession[]

  // UI state
  selectedAgentId: string | null
  selectedSessionId: string | null
  isCreatingAgent: boolean
  isEditingAgent: boolean
  sortBy: AgentSortOption
  sortDirection: SortDirection
  searchQuery: string
  filteredAgents: Agent[]

  // Status
  loading: boolean
  error: string | null

  // Actions
  setAgents: (agents: Agent[]) => void
  addAgent: (agent: Agent) => string
  updateAgent: (id: string, updates: Partial<Agent>) => void
  deleteAgent: (id: string) => void
  selectAgent: (id: string | null) => void

  setMcpServers: (servers: MCPServer[]) => void
  addMcpServer: (server: MCPServer) => void
  updateMcpServer: (id: string, updates: Partial<MCPServer>) => void
  deleteMcpServer: (id: string) => void

  setChatSessions: (sessions: ChatSession[]) => void
  addChatSession: (session: ChatSession) => void
  updateChatSession: (id: string, updates: Partial<ChatSession>) => void
  deleteChatSession: (id: string) => void
  selectChatSession: (id: string | null) => void
  addMessageToSession: (sessionId: string, message: ChatMessage) => void

  setSearchQuery: (query: string) => void
  setSortBy: (sortBy: AgentSortOption) => void
  setSortDirection: (direction: SortDirection) => void

  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Filter and sort
  applyFilters: () => void
}
