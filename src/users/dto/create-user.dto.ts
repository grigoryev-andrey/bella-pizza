import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsEnum,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsUUID()
  @IsOptional()
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID пользователя',
  })
  id?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'John Doe', description: 'Имя пользователя' })
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'john@example.com',
    description: 'Email пользователя',
  })
  email: string;

  @IsEnum(['user', 'admin'])
  @ApiProperty({
    enum: ['user', 'admin'],
    example: 'user',
    description: 'Роль пользователя',
    default: 'user',
  })
  role: 'user' | 'admin';
}
