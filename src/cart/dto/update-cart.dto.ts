import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDto } from './create-cart.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCartItemDto } from './create-cart-item.dto';

export class UpdateCartDto extends PartialType(CreateCartDto) {
  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID пользователя (опционально)',
  })
  userId?: string;

  @ApiPropertyOptional({
    type: () => [CreateCartItemDto],
    description: 'Элементы корзины (опционально)',
  })
  items?: CreateCartItemDto[];
}
