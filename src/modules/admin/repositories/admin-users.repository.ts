
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AdminUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUsers(params: {
    page: number;
    limit: number;
    search?: string;
    role?: 'USER' | 'ADMIN';
    sortBy?: 'createdAt' | 'email' | 'name';
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page,
      limit,
      search,
      role,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const where = {
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              {
                email: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                name: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    return Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      this.prisma.user.count({
        where,
      }),
    ]);
  }

  
  async updateUserRole(userId: string, role: 'USER' | 'ADMIN') {
  const user = await this.prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    return null;
  }

  return this.prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}


async updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED') {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    return null;
  }

  return this.prisma.user.update({
    where: { id: userId },
    data: { status },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
}

