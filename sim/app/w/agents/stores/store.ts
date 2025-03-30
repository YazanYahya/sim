/**
 * Agent Builder Zustand Store
 *
 * Central state management for the Agent Builder application:
 * - Maintains collections of agents, MCP servers, and chat sessions
 * - Handles CRUD operations for all entities
 * - Manages UI state including selections, filters, and sorting
 * - Provides actions for modifying state
 * - Implements filtering and sorting logic
 *
 * @module AgentStore
 */
import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { Agent, AgentConfig, ChatMessage, ChatSession, LogEntry, MCPServer, Message } from './types'

interface AgentState {
  agents: Agent[]
  mcpServers: MCPServer[]
  chatSessions: ChatSession[]
  messages: Message[]
  logs: LogEntry[]
  selectedAgentId: string | null
  selectedSessionId: string | null
  isCreatingAgent: boolean
  isEditingAgent: boolean
  sortBy: string
  sortDirection: string
  searchQuery: string
  filteredAgents: Agent[]
  loading: boolean
  error: string | null
  setAgents: (agents: Agent[]) => void
  addAgent: (agent: Omit<Agent, 'id'>) => string
  updateAgent: (id: string, agent: Partial<Agent>) => void
  deleteAgent: (id: string) => void
  selectAgent: (id: string | null) => void
  updateAgentConfig: (id: string, config: Partial<AgentConfig>) => void
  addMcpServer: (server: Omit<MCPServer, 'id'>) => string
  updateMcpServer: (id: string, server: Partial<MCPServer>) => void
  deleteMcpServer: (id: string) => void
  addMcpServerToAgent: (agentId: string, mcpServerId: string) => void
  removeMcpServerFromAgent: (agentId: string, mcpServerId: string) => void
  setChatSessions: (sessions: ChatSession[]) => void
  addChatSession: (session: ChatSession) => void
  updateChatSession: (id: string, updates: Partial<ChatSession>) => void
  deleteChatSession: (id: string) => void
  selectChatSession: (id: string) => void
  addMessageToSession: (sessionId: string, message: ChatMessage) => void
  addMessage: (message: Omit<Message, 'id'>) => void
  clearMessages: () => void
  addLog: (log: Omit<LogEntry, 'id'>) => void
  clearLogs: () => void
}

export const useAgentStore = create<AgentState>((set, get) => ({
  // Collections
  agents: [],
  mcpServers: [],
  chatSessions: [],
  messages: [],
  logs: [],

  // UI state
  selectedAgentId: null,
  selectedSessionId: null,
  isCreatingAgent: false,
  isEditingAgent: false,
  sortBy: 'name',
  sortDirection: 'asc',
  searchQuery: '',
  filteredAgents: [],

  // Status
  loading: true,
  error: null,

  // Agent actions
  setAgents: (agents) => {
    set({ agents, filteredAgents: agents, loading: false })
  },

  addAgent: (agent) => {
    const id = nanoid()
    set((state) => ({
      agents: [...state.agents, { id, ...agent }],
      selectedAgentId: id,
    }))
    return id
  },

  updateAgent: (id, agent) => {
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, ...agent } : a)),
    }))
  },

  deleteAgent: (id) => {
    set((state) => ({
      agents: state.agents.filter((agent) => agent.id !== id),
    }))
  },

  selectAgent: (id) => {
    set({ selectedAgentId: id })
  },

  addMcpServer: (server) => {
    const id = nanoid()
    set((state) => ({
      mcpServers: [...state.mcpServers, { id, ...server }],
    }))
    return id
  },

  updateMcpServer: (id, server) => {
    set((state) => ({
      mcpServers: state.mcpServers.map((s) => (s.id === id ? { ...s, ...server } : s)),
    }))
  },

  deleteMcpServer: (id) => {
    set((state) => ({
      mcpServers: state.mcpServers.filter((s) => s.id !== id),
      agents: state.agents.map((agent) => {
        if (agent.config.mcpServerIds?.includes(id)) {
          const mcpServerIds = (agent.config.mcpServerIds || []).filter(
            (serverId) => serverId !== id
          )

          return {
            ...agent,
            config: {
              ...agent.config,
              mcpServerIds: mcpServerIds.length > 0 ? mcpServerIds : undefined,
            },
          }
        }
        return agent
      }),
    }))
  },

  addMcpServerToAgent: (agentId, mcpServerId) => {
    set((state) => {
      const agent = state.agents.find((a) => a.id === agentId)
      const server = state.mcpServers.find((s) => s.id === mcpServerId)

      if (!agent || !server) return state

      const currentIds = agent.config.mcpServerIds || []
      if (currentIds.includes(mcpServerId)) return state

      const mcpServerIds = [...currentIds, mcpServerId]

      return {
        agents: state.agents.map((a) =>
          a.id === agentId
            ? {
                ...a,
                config: {
                  ...a.config,
                  mcpServerIds,
                },
              }
            : a
        ),
      }
    })
  },

  removeMcpServerFromAgent: (agentId, mcpServerId) => {
    set((state) => {
      const agent = state.agents.find((a) => a.id === agentId)
      if (!agent) return state

      const mcpServerIds = (agent.config.mcpServerIds || []).filter((id) => id !== mcpServerId)

      return {
        agents: state.agents.map((a) =>
          a.id === agentId
            ? {
                ...a,
                config: {
                  ...a.config,
                  mcpServerIds: mcpServerIds.length > 0 ? mcpServerIds : undefined,
                },
              }
            : a
        ),
      }
    })
  },

  // Chat session actions
  setChatSessions: (sessions) => {
    set({ chatSessions: sessions })
  },

  addChatSession: (session) => {
    set((state) => ({
      chatSessions: [...state.chatSessions, session],
    }))
  },

  updateChatSession: (id, updates) => {
    set((state) => ({
      chatSessions: state.chatSessions.map((session) =>
        session.id === id ? { ...session, ...updates } : session
      ),
    }))
  },

  deleteChatSession: (id) => {
    set((state) => ({
      chatSessions: state.chatSessions.filter((session) => session.id !== id),
    }))
  },

  selectChatSession: (id) => {
    set({ selectedSessionId: id })
  },

  addMessageToSession: (sessionId, message) => {
    set((state) => ({
      chatSessions: state.chatSessions.map((session) =>
        session.id === sessionId
          ? { ...session, messages: [...session.messages, message] }
          : session
      ),
    }))
  },

  updateAgentConfig: (id, config) => {
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, config: { ...a.config, ...config } } : a
      ),
    }))
  },

  // Message methods
  addMessage: (message) => {
    const id = nanoid()
    set((state) => ({
      messages: [...state.messages, { id, ...message }],
    }))
  },

  clearMessages: () => {
    set({ messages: [] })
  },

  // Log methods
  addLog: (log) => {
    const id = nanoid()
    set((state) => ({
      logs: [...state.logs, { id, ...log }],
    }))
  },

  clearLogs: () => {
    set({ logs: [] })
  },
}))
