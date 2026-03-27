import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../utils/errors';

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'assets');
fs.mkdir(UPLOADS_DIR, { recursive: true }).catch(console.error);

export class AssetService {
  constructor(private prisma: PrismaClient) {}

  async getAll(userId: string, type?: string, sortBy?: string) {
    const where: any = { userId };
    if (type) where.type = type;

    return this.prisma.asset.findMany({
      where,
      orderBy: { createdAt: sortBy === 'oldest' ? 'asc' : 'desc' }
    });
  }

  async upload(userId: string, filename: string, buffer: Buffer, mimetype: string, size?: number) {
    // Generate a unique filename using timestamp
    const ext = path.extname(filename);
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);
    
    // Save locally
    await fs.writeFile(filePath, buffer);

    // Determine basic type from mimetype
    let type = 'misc';
    if (mimetype.startsWith('image/')) type = 'image';
    else if (mimetype.startsWith('video/')) type = 'video';
    else if (mimetype.startsWith('audio/')) type = 'audio';
    else if (mimetype.includes('pdf') || mimetype.includes('document')) type = 'doc';
    else if (mimetype.includes('zip') || mimetype.includes('tar')) type = 'archive';
    else if (mimetype.includes('json') || mimetype.includes('javascript') || mimetype.includes('html')) type = 'code';

    // In a real app, this would be S3 URL or similar. We simulate with a local path
    const publicUrl = `/uploads/assets/${uniqueFilename}`;

    return this.prisma.asset.create({
      data: {
        userId,
        name: filename,
        type,
        url: publicUrl,
        size
      }
    });
  }

  async delete(id: string, userId: string) {
    const existing = await this.prisma.asset.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new AppError('Asset not found', 404);
    }

    // Try to remove the file from local storage if possible
    try {
      const filename = existing.url.split('/').pop();
      if (filename) {
        await fs.unlink(path.join(UPLOADS_DIR, filename));
      }
    } catch (err) {
      console.warn('Could not delete local file for asset', existing.id);
    }

    await this.prisma.asset.delete({
      where: { id }
    });
  }
}
