import { FastifyInstance } from 'fastify';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { enhanceSchema } from './ai.schema';
import { authenticate } from '../../middleware/authenticate';

export async function aiRoutes(fastify: FastifyInstance) {
  const aiService = new AiService(
    fastify.config.GEMINI_API_KEY ?? '',
    fastify.config.OPENROUTER_API_KEY ?? '',
  );
  const controller = new AiController(aiService);

  fastify.post('/enhance', { preHandler: [authenticate], schema: enhanceSchema }, controller.enhance.bind(controller));
}
