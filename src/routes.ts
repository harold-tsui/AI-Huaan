import { Express, Request, Response } from 'express';
import configManagementRoutes from './services/config-management/config-management.controller';
import organizationConfigRoutes from './services/organization/organization-config.controller';
import knowledgeIngestionRoutes from './services/knowledge-ingestion/knowledge-ingestion.controller';
import authRoutes from './services/auth/auth.controller';

export function setupRoutes(app: Express): void {
  // Simple root route
  app.get('/', (req: Request, res: Response) => {
    res.send('AI-Huaan BASB System is running!');
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/config', configManagementRoutes);
  app.use('/api/organization', organizationConfigRoutes);
  app.use('/api/capture', knowledgeIngestionRoutes);
}