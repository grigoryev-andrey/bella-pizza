import { PartialType } from '@nestjs/mapped-types';
import { CreateCartItemDto } from './create-cart-item.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCartItemDto extends PartialType(CreateCartItemDto) {
  @ApiPropertyOptional({
    example: 'c1d2e3f4-g5h6-7890-ijkl-mn1234567890',
    description: 'UUID блюда (опционально)',
  })
  dishId?: string;

  @ApiPropertyOptional({
    example: 3,
    description: 'Количество блюд (опционально)',
    minimum: 1,
  })
  quantity?: number;
}
