import { FastifyReply, FastifyRequest } from 'fastify';
import { DeployService } from './deploy.service';

export class DeployController {
  constructor(private deployService: DeployService) {}

  async deployToGithubPages(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const { repoName, customDomain } = request.body as any;
    const result = await this.deployService.deployToGithubPages(userId, repoName, customDomain);
    return reply.status(202).send(result);
  }

  async getStatus(request: FastifyRequest, reply: FastifyReply) {
    // In a real app, we'd check GitHub API for the pages build status
    return { status: 'deployed', message: 'Deployment check not implemented' };
  }
}
