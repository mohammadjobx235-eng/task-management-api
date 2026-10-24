
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new task for the authenticated user
  async create(userId: number, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        completed: dto.completed ?? false,
        userId,
      },
    });
  }

  // Get all tasks belonging to the authenticated user
  async findAll(userId: number) {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Find one task and verify its ownership
  async findOne(userId: number, id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.userId !== userId) {
      throw new ForbiddenException(
        'You cannot access this task',
      );
    }

    return task;
  }

  // Update only the allowed task fields
  async update(userId: number, id: number, dto: UpdateTaskDto) {
    // Verify that the task exists and belongs to this user
    await this.findOne(userId, id);

    return this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && {
          title: dto.title,
        }),

        ...(dto.description !== undefined && {
          description: dto.description,
        }),

        ...(dto.completed !== undefined && {
          completed: dto.completed,
        }),
      },
    });
  }

  // Delete a task only if it belongs to the authenticated user
  async remove(userId: number, id: number) {
    // Verify ownership before deleting
    await this.findOne(userId, id);

    await this.prisma.task.delete({
      where: { id },
    });

    return {
      message: 'Task deleted successfully',
    };
  }
}
