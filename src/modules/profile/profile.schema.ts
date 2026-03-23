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

export const educationSchema = {
  create: {
    tags: ['Profile'],
    security: [{ bearerAuth: [] }],
    body: {
      type: 'object',
      required: ['school'],
      properties: {
        school: { type: 'string' },
        degree: { type: 'string' },
        fieldOfStudy: { type: 'string' },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
        description: { type: 'string' },
      },
    },
  },
  update: {
    tags: ['Profile'],
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
    },
    body: {
      type: 'object',
      properties: {
        school: { type: 'string' },
        degree: { type: 'string' },
        fieldOfStudy: { type: 'string' },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
        description: { type: 'string' },
      },
    },
  },
};

export const experienceSchema = {
  create: {
    tags: ['Profile'],
    security: [{ bearerAuth: [] }],
    body: {
      type: 'object',
      required: ['company', 'position'],
      properties: {
        company: { type: 'string' },
        position: { type: 'string' },
        location: { type: 'string' },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
        description: { type: 'string' },
        isCurrent: { type: 'boolean' },
      },
    },
  },
  update: {
    tags: ['Profile'],
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
    },
    body: {
      type: 'object',
      properties: {
        company: { type: 'string' },
        position: { type: 'string' },
        location: { type: 'string' },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
        description: { type: 'string' },
        isCurrent: { type: 'boolean' },
      },
    },
  },
};

export const importResumeSchema = {
  tags: ['Profile'],
  security: [{ bearerAuth: [] }],
  description: 'Upload a PDF or Docx resume file',
  consumes: ['multipart/form-data'],
};
