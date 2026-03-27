import { FastifyReply, FastifyRequest } from 'fastify';
import { AssetService } from './asset.service';
import { AppError } from '../../utils/errors';

export class AssetController {
  constructor(private assetService: AssetService) {}

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const { type, sortBy } = request.query as any;
    
    const result = await this.assetService.getAll(userId, type, sortBy);
    return reply.send(result);
  }

  async upload(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const data = await request.file();

    if (!data) {
      throw new AppError('No file uploaded', 400);
    }

    const buffer = await data.toBuffer();
    // Use data.mimetype or infer from data.filename
    const mimetype = data.mimetype || 'application/octet-stream';
    const size = buffer.length;

    const result = await this.assetService.upload(userId, data.filename, buffer, mimetype, size);
    return reply.status(201).send(result);
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const { id } = request.params as any;
    
    await this.assetService.delete(id, userId);
    return reply.status(204).send();
  }
}
