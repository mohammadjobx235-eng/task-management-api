
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

type AuthenticatedRequest = Request & {
  user: { userId: number; email: string };
};

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء مهمة جديدة للمستخدم الحالي' })
  @ApiResponse({ status: 201, description: 'تم إنشاء المهمة بنجاح' })
  @ApiResponse({ status: 400, description: 'بيانات الطلب غير صالحة' })
  @ApiResponse({ status: 401, description: 'يلزم تسجيل الدخول' })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'عرض جميع مهام المستخدم الحالي' })
  @ApiResponse({ status: 200, description: 'تم جلب المهام بنجاح' })
  @ApiResponse({ status: 401, description: 'يلزم تسجيل الدخول' })
  findAll(@Req() req: AuthenticatedRequest) {
    return this.tasksService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض مهمة محددة' })
  @ApiParam({ name: 'id', type: Number, description: 'رقم المهمة' })
  @ApiResponse({ status: 200, description: 'تم جلب المهمة بنجاح' })
  @ApiResponse({ status: 404, description: 'المهمة غير موجودة' })
  @ApiResponse({ status: 401, description: 'يلزم تسجيل الدخول' })
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tasksService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تعديل مهمة محددة' })
  @ApiParam({ name: 'id', type: Number, description: 'رقم المهمة' })
  @ApiResponse({ status: 200, description: 'تم تعديل المهمة بنجاح' })
  @ApiResponse({ status: 400, description: 'بيانات التعديل غير صالحة' })
  @ApiResponse({ status: 404, description: 'المهمة غير موجودة' })
  @ApiResponse({ status: 401, description: 'يلزم تسجيل الدخول' })
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف مهمة محددة' })
  @ApiParam({ name: 'id', type: Number, description: 'رقم المهمة' })
  @ApiResponse({ status: 200, description: 'تم حذف المهمة بنجاح' })
  @ApiResponse({ status: 404, description: 'المهمة غير موجودة' })
  @ApiResponse({ status: 401, description: 'يلزم تسجيل الدخول' })
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tasksService.remove(req.user.userId, id);
  }
}
