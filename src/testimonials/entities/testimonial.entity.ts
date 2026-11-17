import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('testimonials')
export class Testimonial {
  @Field(() => ID)
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID отзыва',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @ApiProperty({
    example: 'Отличная пицца! Быстрая доставка и вкусная еда.',
    description: 'Текст отзыва',
  })
  @Column('text')
  message: string;

  @Field(() => Int)
  @ApiProperty({
    example: 5,
    description: 'Рейтинг от 1 до 5',
    minimum: 1,
    maximum: 5,
  })
  @Column({ type: 'int', default: 5 })
  rating: number;

  @Field()
  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Дата создания отзыва',
  })
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => User)
  @ApiProperty({
    type: () => User,
    description: 'Пользователь, оставивший отзыв',
  })
  @OneToOne(() => User, (user) => user.testimonial, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
