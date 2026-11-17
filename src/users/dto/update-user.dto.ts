import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    example: 'John Doe Updated',
    description: 'Имя пользователя (опционально)',
  })
  name?: string;

  @ApiPropertyOptional({
    example: 'john.updated@example.com',
    description: 'Email пользователя (опционально)',
  })
  email?: string;

  @IsOptional()
  @IsEnum(['user', 'admin'])
  @ApiPropertyOptional({
    enum: ['user', 'admin'],
    example: 'admin',
    description: 'Роль пользователя (опционально)',
  })
  role?: 'user' | 'admin';
}
