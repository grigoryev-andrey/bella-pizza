import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiPropertyOptional({
    example: 'confirmed',
    description: 'Статус заказа (опционально)',
    enum: ['pending', 'confirmed', 'delivered'],
  })
  @IsOptional()
  @IsIn(['pending', 'confirmed', 'delivered'])
  status?: 'pending' | 'confirmed' | 'delivered';
}
