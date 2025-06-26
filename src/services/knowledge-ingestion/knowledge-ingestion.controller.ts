import { Router, Request, Response } from 'express';
import { globalServiceFactory } from '../../shared/mcp-core/service-factory';
import { IKnowledgeIngestionService } from './knowledge-ingestion.interface';
import { KNOWLEDGE_INGESTION_SERVICE_ID } from './constants';

const router = Router();

const getKnowledgeIngestionService = () => {
  const service = globalServiceFactory.getServiceInstance(KNOWLEDGE_INGESTION_SERVICE_ID);
  console.log(`[KnowledgeIngestionController] Service lookup for '${KNOWLEDGE_INGESTION_SERVICE_ID}':`, service ? 'Found' : 'Not found');
  return service;
};

router.post('/note', async (req: Request, res: Response) => {
  const { title, content, format, ...options } = req.body;
  if (!title || !content) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'validation_error',
        message: 'Title and content are required',
      },
    });
  }

  try {
    const service: any = getKnowledgeIngestionService();
    console.log(`[KnowledgeIngestionController] Service instance:`, service);
    console.log(`[KnowledgeIngestionController] Service has captureNote method:`, service && typeof service.captureNote === 'function');
    
    if (!service) {
      console.error(`[KnowledgeIngestionController] Service '${KNOWLEDGE_INGESTION_SERVICE_ID}' not found`);
      return res.status(503).json({ error: 'Knowledge Ingestion Service not available' });
    }
    
    if (typeof service.captureNote !== 'function') {
      console.error(`[KnowledgeIngestionController] Service does not have captureNote method`);
      return res.status(503).json({ error: 'Knowledge Ingestion Service does not support captureNote' });
    }
    const knowledgeItem = await service.captureNote(title, content, format, options);
    const responseData = {
      id: knowledgeItem.id,
      title: knowledgeItem.title,
      content_path: knowledgeItem.contentPath,
      source_url: knowledgeItem.source.url || '',
      created_at: knowledgeItem.createdAt,
      updated_at: knowledgeItem.updatedAt,
    };
    res.status(201).json({ success: true, data: responseData });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'internal_server_error',
        message: error.message,
      },
    });
  }
});

export default router;