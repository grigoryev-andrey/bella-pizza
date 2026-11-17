import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartItemDto {
  @ApiProperty({
    example: 'c1d2e3f4-g5h6-7890-ijkl-mn1234567890',
    description: 'UUID блюда',
  })
  @IsNotEmpty()
  @IsString()
  dishId: string;

  @ApiProperty({
    example: 2,
    description: 'Количество блюд',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}
