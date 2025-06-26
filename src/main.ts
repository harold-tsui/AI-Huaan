import express from 'express';
import cors from 'cors';
import path from 'path';
import { Server } from 'http';
import { setupRoutes } from './routes';
import { registerAllServices } from './services/register-services';
import { initializeGlobalLogger, getGlobalLogger, LogLevel } from './utils/logger';
import { config } from './utils/config';
import { globalServiceFactory } from './shared/mcp-core/service-factory';

export let server: Server | null = null;

  // Initialize global logger
  
  initializeGlobalLogger({ level: config.logging.level as LogLevel, filePath: config.logging.filePath });
  const logger = getGlobalLogger();

  export async function bootstrap(): Promise<Server> {
  if (server && server.listening) {
      logger.info('Server is already running, skipping bootstrap.');
      return server;
    }
    // Register all MCP services
    await registerAllServices();
    logger.info('All MCP services have been registered.');
    
    // Create and initialize all registered services
     try {
       const serviceConfigs = [
         // First create services without dependencies
         { name: 'KnowledgeGraphService' },
         { 
           name: 'obsidian-storage-service',
           config: {
             obsidianApiUrl: process.env.OBSIDIAN_API_URL,
             obsidianApiKey: process.env.OBSIDIAN_API_KEY,
             defaultVaultName: process.env.OBSIDIAN_VAULT_NAME
           }
         },
         // Then create services that depend on others
         { name: 'organization-service' },
         { name: 'PresentationService' },
         { name: 'knowledge-ingestion' }
       ];
      
      await globalServiceFactory.createAndInitializeServices(serviceConfigs);
      logger.info('All MCP services have been created and initialized.');
    } catch (error) {
      logger.error('Failed to create and initialize services:', error);
      throw error;
    }

    const app = express();
    const port = Number(process.env.PORT) || 8081;

    // Middlewares
    app.use(cors());
    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../dist')));

    // Setup routes
    setupRoutes(app);

    // Start server
    return new Promise((resolve, reject) => {
      server = app.listen(port, '0.0.0.0', () => {
        logger.info(`Server is listening on http://0.0.0.0:${port}`);
        resolve(server as Server);
      });

      server.on('error', (err) => {
        logger.error('Server failed to start:', err);
        reject(err);
      });
    });
  }

  if (require.main === module) {
    bootstrap().catch(error => {
      logger.error('Failed to bootstrap the application:', error);
      process.exit(1);
    });
  }

  export async function shutdown(serverInstance?: Server): Promise<void> {
    return new Promise((resolve) => {
      if (!serverInstance) {
        logger.warn('No server instance provided for shutdown.');
        resolve();
        return;
      }
      
      serverInstance.close(() => {
        logger.info('Server has been shut down.');
        resolve();
      });
    });
  }