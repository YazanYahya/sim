import { ToolConfig } from '../types'
import { AirtableCreateParams, AirtableCreateResponse } from './types'

// import { logger } from '@/utils/logger' // Removed logger due to import issues

export const airtableCreateRecordsTool: ToolConfig<AirtableCreateParams, AirtableCreateResponse> = {
  id: 'airtable_create_records',
  name: 'Airtable Create Records',
  description: 'Write new records to an Airtable table',
  version: '1.0.0',

  oauth: {
    required: true,
    provider: 'airtable',
  },

  params: {
    accessToken: {
      type: 'string',
      required: true,
      description: 'OAuth access token',
    },
    baseId: {
      type: 'string',
      required: true,
      description: 'ID of the Airtable base',
    },
    tableId: {
      type: 'string',
      required: true,
      description: 'ID or name of the table',
    },
    records: {
      type: 'json',
      required: true,
      description: 'Array of records to create, each with a `fields` object',
      // Example: [{ fields: { "Field 1": "Value1", "Field 2": "Value2" } }]
    },
  },

  request: {
    url: (params) => `https://api.airtable.com/v0/${params.baseId}/${params.tableId}`,
    method: 'POST',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
    // Body should contain { records: [...] } and optionally { typecast: true }
    body: (params) => ({ records: params.records }),
  },

  transformResponse: async (response) => {
    const data = await response.json()
    if (!response.ok) {
      // logger.error('Airtable API error:', data)
      throw new Error(data.error?.message || 'Failed to create Airtable records')
    }
    return {
      success: true,
      output: {
        records: data.records || [],
        metadata: {
          recordCount: (data.records || []).length,
        },
      },
    }
  },

  transformError: (error: any) => {
    // logger.error('Airtable tool error:', error)
    return `Failed to create Airtable records: ${error.message || 'Unknown error'}`
  },
}
