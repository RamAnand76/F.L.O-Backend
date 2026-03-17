import { FastifyInstance } from 'fastify';
import { DeployController } from './deploy.controller';
import { DeployService } from './deploy.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { deploySchema, deployStatusSchema } from './deploy.schema';
import { authenticate } from '../../middleware/authenticate';

export async function deployRoutes(fastify: FastifyInstance) {
  const portfolioService = new PortfolioService(fastify.prisma);
  const deployService = new DeployService(
    fastify.prisma,
    fastify.config.GITHUB_API_TOKEN || '',
    portfolioService
  );
  const controller = new DeployController(deployService);

  fastify.post('/github-pages', { preHandler: [authenticate], schema: deploySchema }, controller.deployToGithubPages.bind(controller));
  fastify.get('/status', { preHandler: [authenticate], schema: deployStatusSchema }, controller.getStatus.bind(controller));
}
