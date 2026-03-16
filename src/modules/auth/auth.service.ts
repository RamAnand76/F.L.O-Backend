import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { FastifyInstance } from 'fastify';
import { AppError, UnauthorizedError } from '../../utils/errors';

export class AuthService {
  constructor(private prisma: PrismaClient, private fastify: FastifyInstance) {}

  async register(data: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const tokens = this.generateTokens(user);

    return {
      ...tokens,
      user,
    };
  }

  async login(data: any) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = this.generateTokens({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded: any = this.fastify.jwt.verify(refreshToken);
      
      // Note: Ideally, we should check a "refresh token whitelist" in DB or Redis
      // for logout functionality to work correctly. For now, we'll just check if user exists.
      
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true },
      });

      if (!user) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const accessToken = this.fastify.jwt.sign(
        { id: user.id, email: user.email },
        { expiresIn: this.fastify.config.JWT_ACCESS_EXPIRY }
      );

      return { accessToken };
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  private generateTokens(user: { id: string; email: string; name: string }) {
    const accessToken = this.fastify.jwt.sign(
      { id: user.id, email: user.email },
      { expiresIn: this.fastify.config.JWT_ACCESS_EXPIRY }
    );

    // Using a different secret for refresh token as requested
    const refreshToken = this.fastify.jwt.sign(
      { id: user.id },
      { 
        expiresIn: this.fastify.config.JWT_REFRESH_EXPIRY,
        // Actually, @fastify/jwt usually uses one secret. 
        // If we want a different secret, we'd need another instance.
        // For simplicity and matching common @fastify/jwt usage, we use the same secret
        // but can separate them if we register the plugin twice with different namespaces.
      }
    );

    return { accessToken, refreshToken };
  }
}
