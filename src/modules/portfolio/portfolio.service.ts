import { PrismaClient } from '@prisma/client';
import { AppError } from '../../utils/errors';

export class PortfolioService {
  constructor(private prisma: PrismaClient) {}

  async getPortfolio(userId: string) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      return this.prisma.portfolio.create({
        data: { userId },
      });
    }

    return portfolio;
  }

  async updateRepos(userId: string, selectedRepoIds: number[]) {
    return this.prisma.portfolio.upsert({
      where: { userId },
      create: { userId, selectedRepoIds },
      update: { selectedRepoIds },
    });
  }

  async updateSkills(userId: string, skills: string[]) {
    return this.prisma.portfolio.upsert({
      where: { userId },
      create: { userId, skills },
      update: { skills },
    });
  }

  async updateTemplate(userId: string, selectedTemplate: string) {
    return this.prisma.portfolio.upsert({
      where: { userId },
      create: { userId, selectedTemplate },
      update: { selectedTemplate },
    });
  }

  async getExportData(userId: string) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            githubProfile: {
              include: { repositories: true },
            },
          },
        },
      },
    });

    if (!portfolio || !portfolio.user.githubProfile) {
      throw new AppError('Portfolio or GitHub profile not found', 404);
    }

    const { githubProfile } = portfolio.user;
    const selectedRepos = githubProfile.repositories.filter((repo) =>
      portfolio.selectedRepoIds.includes(repo.githubRepoId)
    );

    return {
      selectedRepoIds: portfolio.selectedRepoIds,
      skills: portfolio.skills,
      selectedTemplate: portfolio.selectedTemplate,
      customData: {
        name: portfolio.customName || githubProfile.name || portfolio.user.name,
        bio: portfolio.customBio || githubProfile.bio || '',
        email: portfolio.customEmail || githubProfile.email || portfolio.user.email,
        location: portfolio.customLocation || githubProfile.location || '',
        website: portfolio.customWebsite || githubProfile.blog || '',
        github: portfolio.customGithub || githubProfile.htmlUrl || '',
        twitter: portfolio.customTwitter || '',
        linkedin: portfolio.customLinkedin || '',
      },
      deployment: {
        deployedUrl: portfolio.deployedUrl,
        repoName: portfolio.repoName,
        customDomain: portfolio.customDomain,
      },
      github: {
        user: {
          login: githubProfile.githubLogin,
          avatar_url: githubProfile.avatarUrl,
        },
        repos: selectedRepos.map((repo) => ({
          name: repo.name,
          description: repo.description,
          stargazers_count: repo.stargazersCount,
          language: repo.language,
          html_url: repo.htmlUrl,
        })),
      },
    };
  }
}
