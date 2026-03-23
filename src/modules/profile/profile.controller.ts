import { FastifyReply, FastifyRequest } from 'fastify';
import { ProfileService } from './profile.service';
import { AppError } from '../../utils/errors';

export class ProfileController {
  constructor(private profileService: ProfileService) {}

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const result = await this.profileService.getProfile(userId);
    return result;
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const result = await this.profileService.updateProfile(userId, request.body);
    return {
      message: 'Profile updated successfully',
      data: result,
    };
  }

  async syncGithub(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const result = await this.profileService.syncFromGithub(userId);
    return {
      message: 'Education and experience synced from GitHub',
      data: result,
    };
  }

  async importResume(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const data = await request.file();
    
    if (!data) {
      throw new AppError('No resume file uploaded', 400);
    }

    const buffer = await data.toBuffer();
    const result = await this.profileService.importFromResume(
      userId,
      buffer,
      data.filename
    );

    return {
      message: 'Resume imported successfully',
      data: result,
    };
  }

  // Education CRUD
  async addEducation(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const result = await this.profileService.addEducation(userId, request.body);
    return reply.status(201).send(result);
  }

  async updateEducation(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const result = await this.profileService.updateEducation(id, request.body);
    return result;
  }

  async deleteEducation(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    await this.profileService.deleteEducation(id);
    return reply.status(204).send();
  }

  // Experience CRUD
  async addExperience(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const result = await this.profileService.addExperience(userId, request.body);
    return reply.status(201).send(result);
  }

  async updateExperience(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const result = await this.profileService.updateExperience(id, request.body);
    return result;
  }

  async deleteExperience(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    await this.profileService.deleteExperience(id);
    return reply.status(204).send();
  }

  async getSummary(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const result = await this.profileService.getSummary(userId);
    return result;
  }
}
