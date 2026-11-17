import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('blog_posts')
export class BlogPost {
  @Field(() => ID)
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID поста блога',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @ApiProperty({
    example: 'Лучшая пицца в городе',
    description: 'Заголовок поста',
  })
  @Column()
  title: string;

  @Field()
  @ApiProperty({
    example: 'Сегодня мы расскажем о секретах нашей пиццы...',
    description: 'Содержание поста',
  })
  @Column('text')
  content: string;

  @Field()
  @ApiProperty({
    example: 'Шеф-повар Антонио',
    description: 'Автор поста',
  })
  @Column()
  author: string;

  @Field()
  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Дата создания поста',
  })
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => User)
  @ApiProperty({
    type: () => User,
    description: 'Пользователь-автор поста',
  })
  @ManyToOne(() => User, (user) => user.blogPosts, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;
}
