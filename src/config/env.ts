import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifyEnv from '@fastify/env';

const schema = {
  type: 'object',
  required: ['PORT', 'DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'],
  properties: {
    PORT: { type: 'number', default: 3001 },
    HOST: { type: 'string', default: '0.0.0.0' },
    NODE_ENV: { type: 'string', default: 'development' },
    DATABASE_URL: { type: 'string' },
    JWT_SECRET: { type: 'string' },
    JWT_REFRESH_SECRET: { type: 'string' },
    JWT_ACCESS_EXPIRY: { type: 'string', default: '15m' },
    JWT_REFRESH_EXPIRY: { type: 'string', default: '7d' },
    GITHUB_API_TOKEN: { type: 'string' },
    GEMINI_API_KEY: { type: 'string' },
    FRONTEND_URL: { type: 'string', default: 'http://localhost:3000' },
  },
};

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      PORT: number;
      HOST: string;
      NODE_ENV: string;
      DATABASE_URL: string;
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;
      JWT_ACCESS_EXPIRY: string;
      JWT_REFRESH_EXPIRY: string;
      GITHUB_API_TOKEN?: string;
      GEMINI_API_KEY?: string;
      FRONTEND_URL: string;
    };
  }
}

async function envPlugin(fastify: FastifyInstance) {
  await fastify.register(fastifyEnv, {
    schema,
    dotenv: true,
  });
}

export default fp(envPlugin);
