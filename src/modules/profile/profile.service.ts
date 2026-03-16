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
}
