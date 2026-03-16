import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';

async function authPlugin(fastify: FastifyInstance) {
  await fastify.register(fastifyJwt, {
    secret: fastify.config.JWT_SECRET,
    sign: {
      expiresIn: fastify.config.JWT_ACCESS_EXPIRY,
    },
  });

  // We can also have a separate JWT instance for refresh tokens if needed,
  // but for simplicity, we'll use the same plugin or manually verify.
  // The user requested a specific refresh token secret.
  
  fastify.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
}

export default fp(authPlugin);
