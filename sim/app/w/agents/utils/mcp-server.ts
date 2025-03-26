/**
 * MCP Server Connection Utilities
 *
 * This module provides utilities for managing connections to MCP servers:
 * - Connection testing and validation
 * - API client preparation for MCP operations
 * - Health monitoring and status checks
 *
 * @module MCPServerUtils
 */
import { MCPServer } from '../stores/types'


/**
 * Validates an MCP server configuration
 */
export function validateMcpServer(server: Partial<MCPServer>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!server.name?.trim()) {
    errors.push('Name is required')
  }

  if (!server.connectionType) {
    errors.push('Connection type is required')
  } else if (server.connectionType !== 'standard_io' && server.connectionType !== 'sse') {
    errors.push("Connection type must be either 'standard_io' or 'sse'")
  }

  // Validate URL for SSE connection type
  if (server.connectionType === 'sse') {
    if (!server.url?.trim()) {
      errors.push('URL is required for SSE connections')
    } else {
      try {
        new URL(server.url)
      } catch (e) {
        errors.push('URL is invalid')
      }
    }
  }

  // Validate command and arguments for Standard IO connection type
  if (server.connectionType === 'standard_io') {
    if (!server.command?.trim()) {
      errors.push('Command is required for Standard IO connections')
    }
    if (!server.arguments?.trim()) {
      errors.push('Arguments are required for Standard IO connections')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
