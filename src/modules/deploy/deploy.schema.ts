export const deploySchema = {
  body: {
    type: 'object',
    required: ['repoName'],
    properties: {
      repoName: { type: 'string' },
      customDomain: { type: 'string' },
    },
  },
};
