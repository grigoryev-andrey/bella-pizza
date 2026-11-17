import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDishDto {
  @ApiProperty({
    example: 'Маргарита',
    description: 'Название блюда',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Классическая пицца с томатным соусом и моцареллой',
    description: 'Описание блюда',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: 12.99,
    description: 'Цена блюда',
    minimum: 0.01,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  price: number;

  @ApiProperty({
    example: 'https://example.com/images/margarita.jpg',
    description: 'URL изображения блюда',
  })
  @IsNotEmpty()
  // @IsUrl()
  imageUrl: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID категории',
  })
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;
}
