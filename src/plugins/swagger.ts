import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

async function swaggerPlugin(fastify: FastifyInstance) {
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'F.L.O API',
        description: 'Backend API for F.L.O Portfolio Generator. Use the /auth/login endpoint to get a token, then paste it in the "Authorize" button (format: Bearer <token>).',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${fastify.config.PORT}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      // Note: We don't set global security here to allow login/register to remain public in the UI
    },
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });
}

export default fp(swaggerPlugin);
