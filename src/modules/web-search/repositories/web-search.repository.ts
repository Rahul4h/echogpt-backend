import { Injectable } from '@nestjs/common';

import {
  SearchStatus,
} from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class WebSearchRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(data: {
    userId: string;
    providerId?: string;
    query: string;
    pageUrl?: string;
    pageContext?: string;
    status?: SearchStatus;
    resultCount?: number;
    latencyMs?: number;
  }) {
    return this.prisma.webSearch.create({
      data: {
        userId: data.userId,
        providerId: data.providerId,
        query: data.query,
        pageUrl: data.pageUrl,
        pageContext: data.pageContext,
        status: data.status ?? SearchStatus.PENDING,
        resultCount: data.resultCount,
        latencyMs: data.latencyMs,
      },
    });
  }

  async findHistory(
    userId: string,
    limit = 20,
  ) {
    return this.prisma.webSearch.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  async findRecent(
  userId: string,
  limit = 10,
) {
  return this.prisma.webSearch.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}

async findSuggestions(
  userId: string,
  query: string,
  limit = 10,
) {
  return this.prisma.webSearch.findMany({
    where: {
      userId,
      query: {
        contains: query,
        mode: 'insensitive',
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    select: {
      query: true,
    },
  });
}
}