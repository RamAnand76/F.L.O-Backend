import { FastifyInstance } from 'fastify';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { getProfileSchema, getSummarySchema, updateProfileSchema } from './profile.schema';
import { authenticate } from '../../middleware/authenticate';

export async function profileRoutes(fastify: FastifyInstance) {
  const profileService = new ProfileService(fastify.prisma);
  const controller = new ProfileController(profileService);

  fastify.get('/', { preHandler: [authenticate], schema: getProfileSchema }, controller.getProfile.bind(controller));
  fastify.get('/summary', { preHandler: [authenticate], schema: getSummarySchema }, controller.getSummary.bind(controller));
  fastify.put('/', { preHandler: [authenticate], schema: updateProfileSchema }, controller.updateProfile.bind(controller));
}
