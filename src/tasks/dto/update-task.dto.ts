
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'عنوان المهمة الجديد',
    example: 'Learn Prisma',
    minLength: 3,
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  title?: string;

  @ApiPropertyOptional({
    description: 'تفاصيل المهمة الجديدة',
    example: 'Practice database operations',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'حالة اكتمال المهمة',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
