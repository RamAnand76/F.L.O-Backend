import { PrismaClient } from '@prisma/client';
import { AppError } from '../../utils/errors';

export class ProfileService {
  constructor(private prisma: PrismaClient) {}

  async getProfile(userId: string) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
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

  async getSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        githubProfile: true,
        portfolio: true,
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
