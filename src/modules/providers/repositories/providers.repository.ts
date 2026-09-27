import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

type ProviderType = 'OPENAI' | 'ANTHROPIC' | 'GOOGLE';

@Injectable()
export class ProvidersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    name: string;
    type: ProviderType;
    baseUrl?: string;
    modelName?: string;
    encryptedApiKey?: string;
    enabled?: boolean;
    isDefault?: boolean;
  }) {
    return this.prisma.aiProvider.create({ data });
  }

  findAll() {
    return this.prisma.aiProvider.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.aiProvider.findUnique({
      where: { id },
    });
  }

  findByName(name: string) {
    return this.prisma.aiProvider.findUnique({
      where: { name },
    });
  }

  findDefault() {
    return this.prisma.aiProvider.findFirst({
      where: {
        enabled: true,
        isDefault: true,
      },
    });
  }

  update(
    id: string,
    data: {
      name?: string;
      type?: ProviderType;
      baseUrl?: string | null;
      modelName?: string | null;
      encryptedApiKey?: string;
      enabled?: boolean;
      isDefault?: boolean;
    },
  ) {
    return this.prisma.aiProvider.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return this.prisma.aiProvider.delete({
      where: { id },
    });
  }

  async clearDefault() {
    await this.prisma.aiProvider.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });
  }

  async createAsDefault(data: {
    name: string;
    type: ProviderType;
    baseUrl?: string;
    modelName?: string;
    encryptedApiKey?: string;
    enabled?: boolean;
  }) {
    return this.prisma.$transaction(async (tx) => {
      await tx.aiProvider.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });

      return tx.aiProvider.create({
        data: {
          ...data,
          isDefault: true,
        },
      });
    });
  }

  async updateAsDefault(
    id: string,
    data: {
      name?: string;
      type?: ProviderType;
      baseUrl?: string | null;
      modelName?: string | null;
      encryptedApiKey?: string;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.aiProvider.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });

      return tx.aiProvider.update({
        where: { id },
        data: {
          ...data,
          isDefault: true,
        },
      });
    });
  }

  async setDefault(id: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.aiProvider.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });

      return tx.aiProvider.update({
        where: { id },
        data: { isDefault: true },
      });
    });
  }

  async disable(id: string) {
    return this.prisma.aiProvider.update({
      where: { id },
      data: {
        enabled: false,
        isDefault: false,
      },
    });
  }

  async enable(id: string) {
    return this.prisma.aiProvider.update({
      where: { id },
      data: {
        enabled: true,
      },
    });
  }
}