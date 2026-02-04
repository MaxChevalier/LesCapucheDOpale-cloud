import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { TableClient, TableServiceClient } from '@azure/data-tables';

interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp?: string;
  context?: string;
  service?: string;
  traceId?: string;
  metadata?: Record<string, unknown>;
}

interface LogTableEntity {
  partitionKey: string;
  rowKey: string;
  level: string;
  message: string;
  timestamp: string;
  context: string;
  service: string;
  traceId: string;
  metadata: string;
}

const TABLE_NAME = 'ApplicationLogs';

async function getTableClient(context: InvocationContext): Promise<TableClient | null> {
  const connectionString = process.env.AzureWebJobsStorage;

  if (!connectionString || connectionString === 'UseDevelopmentStorage=true') {
    context.log('Using development storage or no storage configured');
    
    if (connectionString === 'UseDevelopmentStorage=true') {
      try {
        const tableClient = TableClient.fromConnectionString(
          'UseDevelopmentStorage=true',
          TABLE_NAME,
        );
        await tableClient.createTable();
        return tableClient;
      } catch {
        context.log('Local storage emulator not available');
        return null;
      }
    }
    return null;
  }

  try {
    const tableServiceClient = TableServiceClient.fromConnectionString(connectionString);
    
    try {
      await tableServiceClient.createTable(TABLE_NAME);
    } catch (error: unknown) {
      if ((error as { statusCode?: number }).statusCode !== 409) {
        throw error;
      }
    }

    return TableClient.fromConnectionString(connectionString, TABLE_NAME);
  } catch (error) {
    context.error('Failed to initialize table client:', error);
    return null;
  }
}

async function storeLog(
  tableClient: TableClient,
  log: LogEntry,
  context: InvocationContext,
): Promise<void> {
  const timestamp = log.timestamp || new Date().toISOString();
  const date = timestamp.split('T')[0];

  const entity: LogTableEntity = {
    partitionKey: date,
    rowKey: `${timestamp}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    level: log.level,
    message: log.message,
    timestamp: timestamp,
    context: log.context || 'unknown',
    service: log.service || 'guild-backend',
    traceId: log.traceId || '',
    metadata: log.metadata ? JSON.stringify(log.metadata) : '{}',
  };

  try {
    await tableClient.createEntity(entity);
    context.log(`Stored log: [${log.level}] ${log.message}`);
  } catch (error) {
    context.error('Failed to store log:', error);
    throw error;
  }
}

async function logReceiver(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log('Log receiver function triggered');

  if (request.method === 'OPTIONS') {
    return {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    };
  }

  try {
    const body = await request.json() as LogEntry | LogEntry[];
    
    if (!body) {
      return {
        status: 400,
        jsonBody: { error: 'Request body is required' },
      };
    }

    const logs: LogEntry[] = Array.isArray(body) ? body : [body];

    if (logs.length === 0) {
      return {
        status: 400,
        jsonBody: { error: 'At least one log entry is required' },
      };
    }

    for (const log of logs) {
      if (!log.level || !log.message) {
        return {
          status: 400,
          jsonBody: { error: 'Each log entry must have "level" and "message" fields' },
        };
      }

      if (!['debug', 'info', 'warn', 'error'].includes(log.level)) {
        return {
          status: 400,
          jsonBody: { error: 'Level must be one of: debug, info, warn, error' },
        };
      }
    }

    const tableClient = await getTableClient(context);

    if (tableClient) {
      for (const log of logs) {
        await storeLog(tableClient, log, context);
      }
    } else {
      for (const log of logs) {
        context.log(`[${log.level.toUpperCase()}] ${log.context || ''}: ${log.message}`);
      }
    }

    for (const log of logs) {
      const logMethod = log.level === 'error' ? 'error' : 
                        log.level === 'warn' ? 'warn' : 'log';
      context[logMethod](`[${log.service || 'app'}] ${log.message}`);
    }

    return {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      jsonBody: {
        success: true,
        processed: logs.length,
        message: `Successfully processed ${logs.length} log(s)`,
      },
    };
  } catch (error) {
    context.error('Error processing log:', error);
    
    return {
      status: 500,
      jsonBody: {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

app.http('log-receiver', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: logReceiver,
});

