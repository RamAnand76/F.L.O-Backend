import { FastifyInstance } from 'fastify';
import querystring from 'querystring';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { loginSchema, logoutSchema, meSchema, refreshSchema, registerSchema } from './auth.schema';
import { authenticate } from '../../middleware/authenticate';

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService(fastify.prisma, fastify);
  const controller = new AuthController(authService);

  fastify.post('/register', { schema: registerSchema }, controller.register.bind(controller));
  fastify.post('/login', { schema: loginSchema }, controller.login.bind(controller));
  
  // Custom content type parser for Swagger UI's oauth2 form data
  fastify.addContentTypeParser('application/x-www-form-urlencoded', { parseAs: 'string' }, function (req, body, done) {
    try {
      done(null, querystring.parse(body as string));
    } catch (err) {
      done(err as Error, undefined);
    }
  });

  // Dedicated endpoint for Swagger UI login
  fastify.post('/swagger-login', { schema: { hide: true } }, async (request, reply) => {
    const body = request.body as any;
    const email = body.username; // Swagger sends 'username'
    const password = body.password;
    
    try {
      const result = await authService.login({ email, password });
      return { access_token: result.accessToken, token_type: 'bearer' };
    } catch (error: any) {
      reply.status(401).send({ error: 'invalid_grant', error_description: error.message });
    }
  });

  fastify.post('/refresh', { schema: refreshSchema }, controller.refresh.bind(controller));
  
  fastify.post('/logout', { preHandler: [authenticate], schema: logoutSchema }, controller.logout.bind(controller));
  fastify.get('/me', { preHandler: [authenticate], schema: meSchema }, controller.me.bind(controller));
}
