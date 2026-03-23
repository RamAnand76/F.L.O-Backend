import fp from 'fastify-plugin';
import multipart, { FastifyMultipartOptions } from '@fastify/multipart';

export default fp<FastifyMultipartOptions>(async (fastify) => {
  fastify.register(multipart, {
    limits: {
      fieldNameSize: 100, // Max field name size in bytes
      fieldSize: 100,     // Max field value size in bytes
      fields: 10,         // Max number of non-file fields
      fileSize: 5 * 1024 * 1024, // 5MB limit
      files: 1,           // Max number of file fields
    },
  });
});
