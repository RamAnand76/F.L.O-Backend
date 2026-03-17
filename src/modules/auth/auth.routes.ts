import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { loginSchema, logoutSchema, meSchema, refreshSchema, registerSchema } from './auth.schema';
import { authenticate } from '../../middleware/authenticate';

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService(fastify.prisma, fastify);
  const controller = new AuthController(authService);

  fastify.post('/register', { schema: registerSchema }, controller.register.bind(controller));
  fastify.post('/login', { schema: loginSchema }, controller.login.bind(controller));
  fastify.post('/refresh', { schema: refreshSchema }, controller.refresh.bind(controller));
  
  fastify.post('/logout', { preHandler: [authenticate], schema: logoutSchema }, controller.logout.bind(controller));
  fastify.get('/me', { preHandler: [authenticate], schema: meSchema }, controller.me.bind(controller));
}
