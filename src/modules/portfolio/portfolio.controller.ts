import { FastifyReply, FastifyRequest } from 'fastify';
import { PortfolioService } from './portfolio.service';

export class PortfolioController {
  constructor(private portfolioService: PortfolioService) {}

  async getPortfolio(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const result = await this.portfolioService.getPortfolio(userId);
    return result;
  }

  async updateRepos(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const { selectedRepoIds } = request.body as any;
    const result = await this.portfolioService.updateRepos(userId, selectedRepoIds);
    return result;
  }

  async updateSkills(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const { skills } = request.body as any;
    const result = await this.portfolioService.updateSkills(userId, skills);
    return result;
  }

  async updateTemplate(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const { selectedTemplate } = request.body as any;
    const result = await this.portfolioService.updateTemplate(userId, selectedTemplate);
    return result;
  }

  async getExportData(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const result = await this.portfolioService.getExportData(userId);
    return result;
  }
}
