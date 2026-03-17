export const deploySchema = {
  tags: ['Deployment'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['repoName'],
    properties: {
      repoName: { type: 'string' },
      customDomain: { type: 'string' },
    },
  },
};

export const deployStatusSchema = {
  tags: ['Deployment'],
  security: [{ bearerAuth: [] }],
};
