export const enhanceSchema = {
  tags: ['AI'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['prompt', 'context'],
    properties: {
      prompt: { type: 'string' },
      context: {
        type: 'object',
        required: ['field', 'currentValue'],
        properties: {
          field: { type: 'string', enum: ['bio', 'name', 'skills'] },
          currentValue: { type: 'string' },
        },
      },
    },
  },
};
