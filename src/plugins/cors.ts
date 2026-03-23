import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifyCors from '@fastify/cors';

async function corsPlugin(fastify: FastifyInstance) {
  await fastify.register(fastifyCors, {
    origin: (origin, cb) => {
      // In development, handle missing origin or standard localhost ports
      if (!origin || /localhost:3000$/.test(origin)) {
        cb(null, true);
        return;
      }
      cb(new Error('Not allowed'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
    credentials: true,
  });
}

export default fp(corsPlugin);
