export const updateReposSchema = {
  body: {
    type: 'object',
    required: ['selectedRepoIds'],
    properties: {
      selectedRepoIds: { type: 'array', items: { type: 'integer' } },
    },
  },
};

export const updateSkillsSchema = {
  body: {
    type: 'object',
    required: ['skills'],
    properties: {
      skills: { type: 'array', items: { type: 'string' } },
    },
  },
};

export const updateTemplateSchema = {
  body: {
    type: 'object',
    required: ['selectedTemplate'],
    properties: {
      selectedTemplate: { type: 'string', enum: ['minimal', 'developer', 'creative'] },
    },
  },
};
