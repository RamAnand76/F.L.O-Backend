export const testimonialSchema = {
  create: {
    body: {
      type: 'object',
      required: ['name', 'role', 'content'],
      properties: {
        name: { type: 'string' },
        role: { type: 'string' },
        content: { type: 'string' },
        avatarUrl: { type: 'string' },
        isFeatured: { type: 'boolean', default: false },
        caseStudyUrl: { type: 'string' }
      }
    }
  },
  update: {
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        role: { type: 'string' },
        content: { type: 'string' },
        avatarUrl: { type: 'string' },
        isFeatured: { type: 'boolean' },
        caseStudyUrl: { type: 'string' }
      }
    }
  }
};
