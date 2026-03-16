import { FastifyReply, FastifyRequest } from 'fastify';
import { AiService } from './ai.service';

export class AiController {
  constructor(private aiService: AiService) {}

  async enhance(request: FastifyRequest, reply: FastifyReply) {
    const { prompt, context } = request.body as any;
    const result = await this.aiService.enhanceContent(prompt, context);
    return result;
  }
}
