import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Dish } from './dish.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('categories')
export class Category {
  @Field(() => ID)
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID категории',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @ApiProperty({
    example: 'Пицца',
    description: 'Название категории',
  })
  @Column({ unique: true })
  name: string;

  @Field(() => [Dish])
  @ApiPropertyOptional({
    type: () => [Dish],
    description: 'Блюда в этой категории',
  })
  @OneToMany(() => Dish, (dish) => dish.category)
  dishes: Dish[];
}
