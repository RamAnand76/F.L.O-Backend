export const updateProfileSchema = {
  tags: ['Profile'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      bio: { type: 'string' },
      email: { type: 'string' }, // removed strict format: 'email' to allow empty inputs without throwing opaque fetch errors
      location: { type: 'string' },
      website: { type: 'string' },
      github: { type: 'string' },
      twitter: { type: 'string' },
      linkedin: { type: 'string' },
    },
  },
};

export const getProfileSchema = {
  tags: ['Profile'],
  security: [{ bearerAuth: [] }],
};

export const getSummarySchema = {
  tags: ['Profile'],
  security: [{ bearerAuth: [] }],
};
