import { PartialType } from '@nestjs/mapped-types';
import { CreateTestimonialDto } from './create-testimonial.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTestimonialDto extends PartialType(CreateTestimonialDto) {
  @ApiPropertyOptional({
    example: 'Обновленный текст отзыва',
    description: 'Текст отзыва (опционально)',
    maxLength: 1000,
  })
  message?: string;

  @ApiPropertyOptional({
    example: 4,
    description: 'Рейтинг от 1 до 5 (опционально)',
    minimum: 1,
    maximum: 5,
  })
  rating?: number;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID пользователя (опционально)',
  })
  userId?: string;
}
