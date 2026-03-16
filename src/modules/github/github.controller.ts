import { FastifyReply, FastifyRequest } from 'fastify';
import { GithubService } from './github.service';

export class GithubController {
  constructor(private githubService: GithubService) {}

  async connect(request: FastifyRequest, reply: FastifyReply) {
    const { username } = request.body as any;
    const userId = (request.user as any).id;
    const result = await this.githubService.connect(userId, username);
    return result;
  }

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const result = await this.githubService.getProfile(userId);
    return result;
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    // For refresh, we need the stored username
    const profile = await (this.githubService as any).prisma.githubProfile.findUnique({
      where: { userId },
    });
    
    if (!profile) {
      return reply.status(404).send({ message: 'GitHub not connected' });
    }

    const result = await this.githubService.connect(userId, profile.githubLogin);
    return result;
  }

  async disconnect(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const result = await this.githubService.disconnect(userId);
    return result;
  }
}
