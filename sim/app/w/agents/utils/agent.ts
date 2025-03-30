/**
 * Agent Management Utilities
 *
 * This module provides utilities for working with agent configurations:
 * - Validation of agent configurations
 * - Creation of default agents with sensible defaults
 *
 * These utilities help maintain consistency in agent configurations
 * and provide helper functions for common agent-related operations.
 *
 * @module AgentUtils
 */
import { AgentConfig } from '../stores/types'


/**
 * Validates an agent configuration
 */
export function validateAgentConfig(config: Partial<AgentConfig>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!config.name?.trim()) {
    errors.push('Name is required')
  }

  if (!config.description?.trim()) {
    errors.push('Description is required')
  }

  if (!config.model?.trim()) {
    errors.push('Model is required')
  }

  if (!config.apiKey?.trim()) {
    errors.push('API key is required')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
