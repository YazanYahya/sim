import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { MCPServer } from '@/app/w/agents/stores/types'
import { ProviderToolConfig } from '@/providers/types'
import { ToolResponse } from '@/tools/types'

export class McpClient {
  private client: Client
  private isConnected: boolean = false

  constructor(private mcpServer: MCPServer) {
    console.log('Initializing McpClient with server config:', {
      connectionType: mcpServer.connectionType,
      url: mcpServer.url,
      hasApiKey: !!mcpServer.apiKey,
    })

    this.client = new Client(
      { name: 'Mcp Client', version: '1.0.0' },
      { capabilities: { tools: {} } }
    )
    console.log('McpClient initialized successfully')
  }

  async connect(): Promise<boolean> {
    console.log('Attempting to connect to MCP server...')
    try {
      let transport

      if (this.mcpServer.connectionType === 'sse') {
        console.log('Using SSE transport with URL:', this.mcpServer.url)
        transport = new SSEClientTransport(new URL(this.mcpServer.url), {
          requestInit: {
            headers: {
              Accept: 'text/event-stream',
            },
          },
        })
      } else if (this.mcpServer.connectionType === 'standard_io') {
        if (!this.mcpServer.command) {
          throw new Error('Command is required for standard_io connection type')
        }
        transport = new StdioClientTransport({
          command: this.mcpServer.command,
          args: this.mcpServer.arguments?.split(' ') || [],
          env: this.mcpServer.envVariables || {},
        })
      } else {
        throw new Error('Unsupported connection type')
      }

      await this.client.connect(transport)
      this.isConnected = true
      console.log('Successfully connected to MCP server')
      return true
    } catch (error) {
      console.error('Failed to connect to MCP server:', error)
      this.isConnected = false
      return false
    }
  }

  async listTools(): Promise<ProviderToolConfig[]> {
    console.log('Listing available tools...')
    if (!this.isConnected) {
      console.log('Client not connected, attempting to connect first')
      await this.connect()
    }

    try {
      const tools = await this.client.listTools()
      console.log(`Retrieved ${Object.keys(tools.tools || {}).length} tools from server`)

      const transformedTools = Object.values(tools.tools || {}).map((tool) => ({
        id: tool.name,
        name: tool.name,
        description: tool.description || `Execute the ${tool.name} tool`,
        params: {},
        parameters: {
          type: 'object',
          properties: tool.inputSchema?.properties || {},
          required: Array.isArray(tool.inputSchema?.required)
            ? tool.inputSchema.required
            : ([] as string[]),
        },
      }))

      console.log('Successfully transformed tools to provider format')
      return transformedTools
    } catch (error) {
      console.error('Failed to list tools:', error)
      return []
    }
  }

  async executeTool(name: string, args: Record<string, any>): Promise<ToolResponse> {
    console.log(`Executing tool "${name}" with arguments:`, args)
    if (!this.isConnected) {
      console.log('Client not connected, attempting to connect first')
      await this.connect()
    }

    try {
      const result = await this.client.callTool({
        name,
        arguments: args,
      })

      console.log(`Successfully executed tool "${name}"`)
      return {
        success: true,
        output: result,
      }
    } catch (error) {
      console.error(`Failed to execute tool ${name}:`, error)
      return {
        success: false,
        output: {},
        error: `Tool execution failed: ${error}`,
      }
    }
  }

  disconnect(): void {
    console.log('Disconnecting from MCP server')
    this.isConnected = false
    console.log('Disconnected successfully')
  }
}
