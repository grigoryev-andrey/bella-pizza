import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Cart } from './cart.entity';
import { Dish } from '../../menu/entities/dish.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('cart_items')
export class CartItem {
  @Field(() => ID)
  @ApiProperty({
    example: 'b1c2d3e4-f5g6-7890-hijk-lm1234567890',
    description: 'UUID элемента корзины',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Cart)
  @ApiProperty({
    type: () => Cart,
    description: 'Корзина, к которой принадлежит элемент',
  })
  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  cart: Cart;

  @Field(() => Dish)
  @ApiProperty({
    type: () => Dish,
    description: 'Блюдо в корзине',
  })
  @ManyToOne(() => Dish, { eager: true, onDelete: 'CASCADE' })
  dish: Dish;

  @Field(() => Int)
  @ApiProperty({
    example: 2,
    description: 'Количество блюд',
    minimum: 1,
  })
  @Column({ default: 1 })
  quantity: number;
}
