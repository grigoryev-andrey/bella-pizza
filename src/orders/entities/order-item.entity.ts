import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Dish } from '../../menu/entities/dish.entity';
import { Order } from './order.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('order_items')
export class OrderItem {
  @Field(() => ID)
  @ApiProperty({
    example: 'b1c2d3e4-f5g6-7890-hijk-lm1234567890',
    description: 'UUID элемента заказа',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Order)
  @ApiProperty({
    type: () => Order,
    description: 'Заказ, к которому принадлежит элемент',
  })
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @Field(() => Dish)
  @ApiProperty({
    type: () => Dish,
    description: 'Блюдо в заказе',
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

  @Field(() => Float)
  @ApiProperty({
    example: 12.99,
    description: 'Цена за единицу блюда',
  })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
}