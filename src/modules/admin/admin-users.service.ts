import { Injectable,NotFoundException,} from '@nestjs/common';

import { AdminUsersRepository } from './repositories/admin-users.repository';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly adminUsersRepository: AdminUsersRepository,
  ) {}

  async findUsers(params: {
    page: number;
    limit: number;
    search?: string;
    role?: 'USER' | 'ADMIN';
    sortBy?: 'createdAt' | 'email' | 'name';
    sortOrder?: 'asc' | 'desc';
  }) {
    const [users, total] =
      await this.adminUsersRepository.findUsers(params);

    const totalPages = Math.ceil(total / params.limit);

    return {
      data: users,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
    };
  }

  async updateUserRole(userId: string, role: 'USER' | 'ADMIN') {
  const user = await this.adminUsersRepository.updateUserRole(
    userId,
    role,
  );

  if (!user) {
    throw new NotFoundException('User not found.');
  }

  return user;
}


async updateUserStatus(
  userId: string,
  status: 'ACTIVE' | 'SUSPENDED',
) {
  const user = await this.adminUsersRepository.updateUserStatus(
    userId,
    status,
  );

  if (!user) {
    throw new NotFoundException('User not found.');
  }

  return user;
}
}