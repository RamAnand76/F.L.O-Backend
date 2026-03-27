import { PrismaClient } from '@prisma/client';
import { AppError } from '../../utils/errors';

export class TestimonialService {
  constructor(private prisma: PrismaClient) {}

  async getAll(userId: string) {
    return this.prisma.testimonial.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(userId: string, data: any) {
    return this.prisma.testimonial.create({
      data: {
        userId,
        name: data.name,
        role: data.role,
        content: data.content,
        avatarUrl: data.avatarUrl,
        isFeatured: data.isFeatured ?? false,
        caseStudyUrl: data.caseStudyUrl
      }
    });
  }

  async update(id: string, userId: string, data: any) {
    const existing = await this.prisma.testimonial.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new AppError('Testimonial not found', 404);
    }

    return this.prisma.testimonial.update({
      where: { id },
      data
    });
  }

  async delete(id: string, userId: string) {
    const existing = await this.prisma.testimonial.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new AppError('Testimonial not found', 404);
    }

    await this.prisma.testimonial.delete({
      where: { id }
    });
  }
}
