import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogPostDto } from './create-blog-post.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBlogPostDto extends PartialType(CreateBlogPostDto) {
  @ApiPropertyOptional({
    example: 'Обновленный заголовок поста',
    description: 'Заголовок поста блога (опционально)',
  })
  title?: string;

  @ApiPropertyOptional({
    example: 'Обновленное содержание поста...',
    description: 'Содержание поста блога (опционально)',
  })
  content?: string;

  @ApiPropertyOptional({
    example: 'Обновленный автор',
    description: 'Автор поста (опционально)',
  })
  author?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID пользователя-автора (опционально)',
  })
  userId?: string;
}
