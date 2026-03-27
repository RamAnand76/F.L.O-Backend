export const assetSchema = {
  get: {
    querystring: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        sortBy: { type: 'string', enum: ['newest', 'oldest'], default: 'newest' }
      }
    }
  }
};
