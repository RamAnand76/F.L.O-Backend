import { FastifyInstance } from 'fastify';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { connectSchema } from './github.schema';
import { authenticate } from '../../middleware/authenticate';

export async function githubRoutes(fastify: FastifyInstance) {
  const githubService = new GithubService(fastify.prisma, fastify.config.GITHUB_API_TOKEN);
  const controller = new GithubController(githubService);

  fastify.post('/connect', { preHandler: [authenticate], schema: connectSchema }, controller.connect.bind(controller));
  fastify.get('/profile', { preHandler: [authenticate] }, controller.getProfile.bind(controller));
  fastify.get('/repos', { preHandler: [authenticate] }, controller.getProfile.bind(controller)); // Reusing profile result as it contains repos
  fastify.post('/refresh', { preHandler: [authenticate] }, controller.refresh.bind(controller));
  fastify.delete('/disconnect', { preHandler: [authenticate] }, controller.disconnect.bind(controller));
}
