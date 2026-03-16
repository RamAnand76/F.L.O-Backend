import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(request: FastifyRequest, reply: FastifyReply) {
    const result = await this.authService.register(request.body);
    return reply.status(201).send(result);
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const result = await this.authService.login(request.body);
    return result;
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = request.body as any;
    const result = await this.authService.refresh(refreshToken);
    return result;
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    // In a real app, we'd invalidate the refresh token in DB
    return { message: 'Logged out successfully' };
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const result = await this.authService.me(userId);
    return result;
  }
}
