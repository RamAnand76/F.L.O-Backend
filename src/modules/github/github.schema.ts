export const connectSchema = {
  tags: ['GitHub'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['username'],
    properties: {
      username: { type: 'string' },
    },
  },
};

export const getProfileSchema = {
  tags: ['GitHub'],
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100 },
    },
  },
};

export const refreshGithubSchema = {
  tags: ['GitHub'],
  security: [{ bearerAuth: [] }],
};

export const disconnectSchema = {
  tags: ['GitHub'],
  security: [{ bearerAuth: [] }],
};
