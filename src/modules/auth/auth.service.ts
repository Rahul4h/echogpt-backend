import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

import { PrismaService } from '../../prisma/prisma.service';

type AccessTokenPayload = {
  sub: string;
  email: string;
  role: string;
};

type RefreshTokenPayload = {
  sub: string;
  email: string;
  role: string;
  sid: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(
    email: string,
    name: string,
    password: string,
  ) {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const freePlan = await tx.subscriptionPlan.upsert({
        where: { name: 'FREE' },
        update: {},
        create: {
          name: 'FREE',
          description: 'Free EchoGPT plan',
          price: 0,
          currency: 'USD',
          requestLimit: 100,
          tokenLimit: 10000,
        },
      });

      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          name: name.trim(),
          passwordHash,
        },
      });

      await tx.subscription.create({
        data: {
          userId: user.id,
          planId: freePlan.id,
          status: 'ACTIVE',
        },
      });

      return user;
    });

    return this.createSessionAndTokens(result);
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createSessionAndTokens(user);
  }

  async refresh(refreshToken: string) {
    let payload: RefreshTokenPayload;

    try {
      payload = await this.jwt.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.config.getOrThrow<string>(
            'jwt.refreshSecret',
          ),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.prisma.session.findFirst({
      where: {
        id: payload.sid,
        userId: payload.sub,
        status: 'ACTIVE',
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenMatches = await bcrypt.compare(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!tokenMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    return this.createSessionAndTokens(user);
  }

  async logout(refreshToken: string) {
    let payload: RefreshTokenPayload;

    try {
      payload = await this.jwt.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.config.getOrThrow<string>(
            'jwt.refreshSecret',
          ),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.prisma.session.findFirst({
      where: {
        id: payload.sid,
        userId: payload.sub,
        status: 'ACTIVE',
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenMatches = await bcrypt.compare(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!tokenMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    return {
      message: 'Logged out successfully',
    };
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

  private async createSessionAndTokens(user: {
    id: string;
    email: string;
    role: string;
    name: string;
    createdAt: Date;
  }) {
    const sessionId = randomUUID();

    const accessTokenPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const refreshTokenPayload: RefreshTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      sid: sessionId,
    };

    const accessToken = await this.jwt.signAsync(
      accessTokenPayload,
    );

    const refreshToken = await this.jwt.signAsync(
      refreshTokenPayload,
      {
        secret: this.config.getOrThrow<string>(
          'jwt.refreshSecret',
        ),
        expiresIn: this.config.get<string>(
          'jwt.refreshExpiresIn',
          '7d',
        ) as never,
      },
    );

    const refreshTokenHash = await bcrypt.hash(
      refreshToken,
      12,
    );

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    await this.prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        refreshTokenHash,
        expiresAt,
        status: 'ACTIVE',
      },
    });

    return {
      user: this.safeUser(user),
      accessToken,
      refreshToken,
    };
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