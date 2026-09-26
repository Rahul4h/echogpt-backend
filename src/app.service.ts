import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './prisma/prisma.service';

export interface PaginationParams {
  page: number;
  limit: number;
}

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  status() {
    return {
      name: 'EchoGPT API',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async register(email: string, name: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
      },
    });

    return this.safeUser(user);
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.safeUser(user);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.safeUser(user);
  }

  async list(
    userId: string,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.conversation.findMany({
        where: {
          userId,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.conversation.count({
        where: {
          userId,
        },
      }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(userId: string, title: string) {
    return this.prisma.conversation.create({
      data: {
        userId,
        title: title.trim(),
      },
    });
  }

  async update(userId: string, id: string, title: string) {
    const result = await this.prisma.conversation.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        title: title.trim(),
        updatedAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Conversation not found');
    }

    return this.prisma.conversation.findUnique({
      where: { id },
    });
  }

  async remove(userId: string, id: string) {
    const result = await this.prisma.conversation.deleteMany({
      where: {
        id,
        userId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Conversation not found');
    }
  }

  async messages(
    userId: string,
    conversationId: string,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where: {
          conversationId,
        },
        orderBy: {
          createdAt: 'asc',
        },
        skip,
        take: limit,
      }),
      this.prisma.message.count({
        where: {
          conversationId,
        },
      }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async message(
    userId: string,
    conversationId: string,
    content: string,
    role: 'USER' | 'SYSTEM' = 'USER',
  ) {
    return this.prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
        select: {
          id: true,
        },
      });

      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      const message = await tx.message.create({
        data: {
          conversationId,
          role,
          content: content.trim(),
        },
      });

      await tx.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          updatedAt: new Date(),
        },
      });

      return message;
    });
  }

  async removeAccount(userId: string) {
    const result = await this.prisma.user.deleteMany({
      where: {
        id: userId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('User not found');
    }
  }

  private safeUser(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: Date;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}