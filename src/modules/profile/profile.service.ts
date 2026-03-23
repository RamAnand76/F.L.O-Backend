import { PrismaClient } from '@prisma/client';
import { AppError } from '../../utils/errors';
import { GithubService } from '../github/github.service';
import { AiService } from '../ai/ai.service';
import { ResumeParser } from '../../utils/resume-parser';

export class ProfileService {
  constructor(
    private prisma: PrismaClient,
    private githubService?: GithubService,
    private aiService?: AiService
  ) {}

  async getProfile(userId: string) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
      include: {
        education: true,
        experience: true,
      },
    });

    if (!portfolio) {
      // Return empty data if no portfolio yet
      return {
        name: '',
        bio: '',
        email: '',
        location: '',
        website: '',
        github: '',
        twitter: '',
        linkedin: '',
        education: [],
        experience: [],
      };
    }

    return {
      name: portfolio.customName,
      bio: portfolio.customBio,
      email: portfolio.customEmail,
      location: portfolio.customLocation,
      website: portfolio.customWebsite,
      github: portfolio.customGithub,
      twitter: portfolio.customTwitter,
      linkedin: portfolio.customLinkedin,
      education: portfolio.education,
      experience: portfolio.experience,
    };
  }

  async updateProfile(userId: string, data: any) {
    return this.prisma.portfolio.upsert({
      where: { userId },
      create: {
        userId,
        customName: data.name ?? '',
        customBio: data.bio ?? '',
        customEmail: data.email ?? '',
        customLocation: data.location ?? '',
        customWebsite: data.website ?? '',
        customGithub: data.github ?? '',
        customTwitter: data.twitter ?? '',
        customLinkedin: data.linkedin ?? '',
      },
      update: {
        customName: data.name,
        customBio: data.bio,
        customEmail: data.email,
        customLocation: data.location,
        customWebsite: data.website,
        customGithub: data.github,
        customTwitter: data.twitter,
        customLinkedin: data.linkedin,
      },
    });
  }

  async syncFromGithub(userId: string) {
    if (!this.githubService || !this.aiService) {
      throw new AppError('GitHub or AI service not configured', 500);
    }

    const githubProfile = await this.prisma.githubProfile.findUnique({
      where: { userId },
    });

    if (!githubProfile) {
      throw new AppError('No GitHub profile connected', 404);
    }

    // 1. Fetch README
    const readme = await this.githubService.getProfileReadme(githubProfile.githubLogin);
    
    // 2. Fetch Bio
    const bio = githubProfile.bio || '';

    // 3. Combine and extract
    const content = `GitHub Bio: ${bio}\n\nGitHub README:\n${readme || 'No README found.'}`;
    const extracted = await this.aiService.extractPortfolioData(content);

    // 4. Save to DB
    return this.saveExtractedData(userId, extracted);
  }

  async importFromResume(userId: string, buffer: Buffer, filename: string) {
    if (!this.aiService) {
      throw new AppError('AI service not configured', 500);
    }

    const text = await ResumeParser.parse(buffer, filename);
    const extracted = await this.aiService.extractPortfolioData(text);

    return this.saveExtractedData(userId, extracted);
  }

  private async saveExtractedData(userId: string, data: any) {
    const portfolio = await this.prisma.portfolio.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    await this.prisma.$transaction([
      this.prisma.education.deleteMany({ where: { portfolioId: portfolio.id } }),
      this.prisma.experience.deleteMany({ where: { portfolioId: portfolio.id } }),
      this.prisma.education.createMany({
        data: data.education.map((edu: any) => ({
          portfolioId: portfolio.id,
          school: edu.school || '',
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          startDate: edu.startDate,
          endDate: edu.endDate,
          description: edu.description,
        })),
      }),
      this.prisma.experience.createMany({
        data: data.experience.map((exp: any) => ({
          portfolioId: portfolio.id,
          company: exp.company || '',
          position: exp.position || '',
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.description,
          isCurrent: exp.isCurrent || false,
        })),
      }),
    ]);

    return this.getProfile(userId);
  }

  // CRUD for Education
  async addEducation(userId: string, data: any) {
    const portfolio = await this.getOrCreatePortfolio(userId);
    return this.prisma.education.create({
      data: {
        portfolioId: portfolio.id,
        ...data,
      },
    });
  }

  async updateEducation(id: string, data: any) {
    return this.prisma.education.update({
      where: { id },
      data,
    });
  }

  async deleteEducation(id: string) {
    await this.prisma.education.delete({ where: { id } });
  }

  // CRUD for Experience
  async addExperience(userId: string, data: any) {
    const portfolio = await this.getOrCreatePortfolio(userId);
    return this.prisma.experience.create({
      data: {
        portfolioId: portfolio.id,
        ...data,
      },
    });
  }

  async updateExperience(id: string, data: any) {
    return this.prisma.experience.update({
      where: { id },
      data,
    });
  }

  async deleteExperience(id: string) {
    await this.prisma.experience.delete({ where: { id } });
  }

  private async getOrCreatePortfolio(userId: string) {
    return this.prisma.portfolio.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  async getSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        githubProfile: true,
        portfolio: {
          include: {
            education: true,
            experience: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      github: user.githubProfile
        ? {
            connected: true,
            login: user.githubProfile.githubLogin,
            avatar: user.githubProfile.avatarUrl,
            publicRepos: user.githubProfile.publicRepos,
          }
        : { connected: false },
      portfolio: user.portfolio
        ? {
            id: user.portfolio.id,
            skills: user.portfolio.skills,
            reposCount: user.portfolio.selectedRepoIds.length,
            template: user.portfolio.selectedTemplate,
            deployedUrl: user.portfolio.deployedUrl,
            educationCount: user.portfolio.education.length,
            experienceCount: user.portfolio.experience.length,
            customData: {
              name: user.portfolio.customName,
              bio: user.portfolio.customBio,
              email: user.portfolio.customEmail,
              location: user.portfolio.customLocation,
              website: user.portfolio.customWebsite,
              github: user.portfolio.customGithub,
              twitter: user.portfolio.customTwitter,
              linkedin: user.portfolio.customLinkedin,
            },
          }
        : {
            id: null,
            skills: [],
            reposCount: 0,
            template: 'minimal',
            deployedUrl: null,
            educationCount: 0,
            experienceCount: 0,
            customData: {
              name: '',
              bio: '',
              email: '',
              location: '',
              website: '',
              github: '',
              twitter: '',
              linkedin: '',
            },
          },
    };
  }
}
