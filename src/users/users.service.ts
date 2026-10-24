
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Remove password before returning user data
  private sanitizeUser<T extends { password?: string }>(user: T) {
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  // Create a user
  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      12,
    );

    const user = await this.prisma.user.create({
      data: {
        firstname: createUserDto.firstname,
        lastname: createUserDto.lastname,
        email: createUserDto.email,
        password: hashedPassword,
      },
    });

    return this.sanitizeUser(user);
  }

  // Return only the authenticated user's own profile
  async findAll(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return [this.sanitizeUser(user)];
  }

  // Find a user only if the authenticated user owns the profile
  async findOne(userId: number, id: number) {
    if (userId !== id) {
      throw new ForbiddenException(
        'You cannot access this user',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  // Update only the authenticated user's own profile
  async update(
    userId: number,
    id: number,
    updateUserDto: UpdateUserDto,
  ) {
    await this.findOne(userId, id);

    const data: {
      firstname?: string;
      lastname?: string;
      email?: string;
      password?: string;
    } = {};

    if (updateUserDto.firstname !== undefined) {
      data.firstname = updateUserDto.firstname;
    }

    if (updateUserDto.lastname !== undefined) {
      data.lastname = updateUserDto.lastname;
    }

    if (updateUserDto.email !== undefined) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already registered');
      }

      data.email = updateUserDto.email;
    }

    if (updateUserDto.password !== undefined) {
      data.password = await bcrypt.hash(
        updateUserDto.password,
        12,
      );
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    return this.sanitizeUser(updatedUser);
  }

  // Delete only the authenticated user's own account
  async remove(userId: number, id: number) {
    await this.findOne(userId, id);

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }
}
