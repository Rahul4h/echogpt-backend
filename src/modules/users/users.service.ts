import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersRepository } from './repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
  ) {}

  async getProfile(userId: string) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.safeUser(user);
  }

  async updateProfile(
    userId: string,
    data: {
      name?: string;
      email?: string;
    },
  ) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: {
      name?: string;
      email?: string;
    } = {};

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }

    if (data.email !== undefined) {
      const normalizedEmail = data.email.trim().toLowerCase();

      if (normalizedEmail !== user.email) {
        const existingUser =
          await this.usersRepository.findByEmail(
            normalizedEmail,
          );

        if (existingUser) {
          throw new ConflictException(
            'Email is already registered',
          );
        }

        updateData.email = normalizedEmail;
      }
    }

    const updatedUser = await this.usersRepository.update(
      userId,
      updateData,
    );

    return this.safeUser(updatedUser);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException(
        'Current password is incorrect',
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.usersRepository.update(userId, {
      passwordHash,
    });

    return {
      message: 'Password changed successfully',
    };
  }

  async deleteAccount(userId: string) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.delete(userId);

    return {
      message: 'Account deleted successfully',
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