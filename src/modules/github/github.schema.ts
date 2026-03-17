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
};

export const refreshGithubSchema = {
  tags: ['GitHub'],
  security: [{ bearerAuth: [] }],
};

export const disconnectSchema = {
  tags: ['GitHub'],
  security: [{ bearerAuth: [] }],
};
