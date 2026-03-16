import { FastifyReply, FastifyRequest } from 'fastify';
import { ProfileService } from './profile.service';

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
}
