import { PartialType } from '@nestjs/mapped-types';
import { CreateDishDto } from './create-dish.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDishDto extends PartialType(CreateDishDto) {
  @ApiPropertyOptional({
    example: 'Маргарита Премиум',
    description: 'Название блюда (опционально)',
    maxLength: 100,
  })
  name?: string;

  @ApiPropertyOptional({
    example: 'Улучшенная версия классической пиццы',
    description: 'Описание блюда (опционально)',
  })
  description?: string;

  @ApiPropertyOptional({
    example: 15.99,
    description: 'Цена блюда (опционально)',
    minimum: 0.01,
  })
  price?: number;

  @ApiPropertyOptional({
    example: 'https://example.com/images/margarita-premium.jpg',
    description: 'URL изображения блюда (опционально)',
  })
  imageUrl?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID категории (опционально)',
  })
  categoryId?: string;
}
