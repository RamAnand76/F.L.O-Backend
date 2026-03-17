export const registerSchema = {
  tags: ['Auth'],
  body: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
      name: { type: 'string', minLength: 2 },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
    },
  },
};

export const loginSchema = {
  tags: ['Auth'],
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
    },
  },
};

export const refreshSchema = {
  tags: ['Auth'],
  body: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: { type: 'string' },
    },
  },
};

export const meSchema = {
  tags: ['Auth'],
  security: [{ bearerAuth: [] }],
};

export const logoutSchema = {
  tags: ['Auth'],
  security: [{ bearerAuth: [] }],
};
