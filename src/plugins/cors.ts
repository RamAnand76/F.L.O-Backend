import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifyCors from '@fastify/cors';

async function corsPlugin(fastify: FastifyInstance) {
  await fastify.register(fastifyCors, {
    origin: fastify.config.FRONTEND_URL,
    credentials: true,
  });
}

export default fp(corsPlugin);
