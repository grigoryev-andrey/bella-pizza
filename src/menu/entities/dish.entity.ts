import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Category } from './category.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('dishes')
export class Dish {
  @Field(() => ID)
  @ApiProperty({
    example: 'b1c2d3e4-f5g6-7890-hijk-lm1234567890',
    description: 'UUID блюда',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @ApiProperty({
    example: 'Маргарита',
    description: 'Название блюда',
  })
  @Column({ length: 100 })
  name: string;

  @Field()
  @ApiProperty({
    example: 'Классическая пицца с томатным соусом и моцареллой',
    description: 'Описание блюда',
  })
  @Column('text')
  description: string;

  @Field(() => Float)
  @ApiProperty({
    example: 12.99,
    description: 'Цена блюда',
  })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Field()
  @ApiProperty({
    example: 'https://example.com/images/margarita.jpg',
    description: 'URL изображения блюда',
  })
  @Column()
  imageUrl: string;

  @Field(() => Category)
  @ApiProperty({
    type: () => Category,
    description: 'Категория блюда',
  })
  @ManyToOne(() => Category, (category) => category.dishes, { eager: true })
  category: Category;
}
