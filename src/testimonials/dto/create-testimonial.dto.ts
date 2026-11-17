import { IsNotEmpty, IsString, IsInt, Min, Max, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTestimonialDto {
  @ApiProperty({
    example: 'Отличная пицца! Быстрая доставка и вкусная еда.',
    description: 'Текст отзыва',
    maxLength: 1000,
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    example: 5,
    description: 'Рейтинг от 1 до 5',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID пользователя, оставившего отзыв',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
