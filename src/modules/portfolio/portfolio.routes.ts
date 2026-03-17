import { FastifyInstance } from 'fastify';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { getExportSchema, getPortfolioSchema, updateReposSchema, updateSkillsSchema, updateTemplateSchema } from './portfolio.schema';
import { authenticate } from '../../middleware/authenticate';

export async function portfolioRoutes(fastify: FastifyInstance) {
  const portfolioService = new PortfolioService(fastify.prisma);
  const controller = new PortfolioController(portfolioService);

  fastify.get('/', { preHandler: [authenticate], schema: getPortfolioSchema }, controller.getPortfolio.bind(controller));
  fastify.put('/repos', { preHandler: [authenticate], schema: updateReposSchema }, controller.updateRepos.bind(controller));
  fastify.put('/skills', { preHandler: [authenticate], schema: updateSkillsSchema }, controller.updateSkills.bind(controller));
  fastify.put('/template', { preHandler: [authenticate], schema: updateTemplateSchema }, controller.updateTemplate.bind(controller));
  fastify.get('/export', { preHandler: [authenticate], schema: getExportSchema }, controller.getExportData.bind(controller));
}
