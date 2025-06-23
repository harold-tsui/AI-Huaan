import express from 'express';
import cors from 'cors';
import path from 'path';
import { Server } from 'http';
import { setupRoutes } from './routes';
import { registerAllServices } from './services/register-services';
import { initializeGlobalLogger, getGlobalLogger, LogLevel } from './utils/logger';
import { config } from './utils/config';

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

    const app = express();
    const port = Number(process.env.PORT) || 8081;

    // Middlewares
    app.use(cors());
    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../dist')));

    // Setup routes
    setupRoutes(app);

    // Start server
    return new Promise((resolve) => {
      server = app.listen(port, '0.0.0.0', () => {
        logger.info(`Server is listening on http://0.0.0.0:${port}`);
        resolve(server as Server);
      });
    });
  }

  if (require.main === module) {
    bootstrap().catch(error => {
      logger.error('Failed to bootstrap the application:', error);
      process.exit(1);
    });
  }

  export async function shutdown(serverInstance: Server): Promise<void> {
    return new Promise((resolve) => {
      serverInstance.close(() => {
        logger.info('Server has been shut down.');
        resolve();
      });
    });
  }