import { FastifyInstance } from 'fastify';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { GithubService } from '../github/github.service';
import { AiService } from '../ai/ai.service';
import { 
  getProfileSchema, 
  getSummarySchema, 
  updateProfileSchema,
  educationSchema,
  experienceSchema,
  importResumeSchema
} from './profile.schema';
import { authenticate } from '../../middleware/authenticate';

export async function profileRoutes(fastify: FastifyInstance) {
  const githubService = new GithubService(fastify.prisma, fastify.config.GITHUB_API_TOKEN);
  const aiService = new AiService(fastify.config.GEMINI_API_KEY!);
  
  const profileService = new ProfileService(fastify.prisma, githubService, aiService);
  const controller = new ProfileController(profileService);

  const auth = { preHandler: [authenticate] };

  // Profile
  fastify.get('/', { ...auth, schema: getProfileSchema }, controller.getProfile.bind(controller));
  fastify.get('/summary', { ...auth, schema: getSummarySchema }, controller.getSummary.bind(controller));
  fastify.put('/', { ...auth, schema: updateProfileSchema }, controller.updateProfile.bind(controller));

  // Automation
  fastify.post('/sync-github', { ...auth }, controller.syncGithub.bind(controller));
  fastify.post('/import-resume', { ...auth, schema: importResumeSchema }, controller.importResume.bind(controller));

  // Education
  fastify.post('/education', { ...auth, schema: educationSchema.create }, controller.addEducation.bind(controller));
  fastify.patch('/education/:id', { ...auth, schema: educationSchema.update }, controller.updateEducation.bind(controller));
  fastify.delete('/education/:id', { ...auth }, controller.deleteEducation.bind(controller));

  // Experience
  fastify.post('/experience', { ...auth, schema: experienceSchema.create }, controller.addExperience.bind(controller));
  fastify.patch('/experience/:id', { ...auth, schema: experienceSchema.update }, controller.updateExperience.bind(controller));
  fastify.delete('/experience/:id', { ...auth }, controller.deleteExperience.bind(controller));
}
