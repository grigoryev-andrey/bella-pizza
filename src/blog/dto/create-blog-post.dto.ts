import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlogPostDto {
  @ApiProperty({
    example: 'Лучшая пицца в городе',
    description: 'Заголовок поста блога',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Сегодня мы расскажем о секретах нашей пиццы...',
    description: 'Содержание поста блога',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    example: 'Шеф-повар Антонио',
    description: 'Автор поста',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  author: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID пользователя-автора',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
