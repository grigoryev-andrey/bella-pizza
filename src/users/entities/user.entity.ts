import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Testimonial } from '../../testimonials/entities/testimonial.entity';
import { BlogPost } from '../../blog/entities/blog-post.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { Order } from '../../orders/entities/order.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID пользователя',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @ApiProperty({ example: 'John Doe', description: 'Имя пользователя' })
  @Column()
  name: string;

  @Field()
  @ApiProperty({
    example: 'john@example.com',
    description: 'Email пользователя (уникальный)',
  })
  @Column({ unique: true })
  email: string;

  @Field(() => Testimonial, { nullable: true })
  @ApiPropertyOptional({
    type: () => Testimonial,
    description: 'Отзыв пользователя (один пользователь - один отзыв)',
  })
  @OneToOne(() => Testimonial, (testimonial) => testimonial.user)
  testimonial: Testimonial;

  @Field(() => [BlogPost], { nullable: true })
  @ApiPropertyOptional({
    type: () => [BlogPost],
    description: 'Посты блога пользователя',
  })
  @OneToMany(() => BlogPost, (post) => post.user)
  blogPosts: BlogPost[];

  @Field(() => Cart, { nullable: true })
  @ApiPropertyOptional({
    type: () => Cart,
    description: 'Корзина пользователя',
  })
  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  @Field(() => [Order], { nullable: true })
  @ApiPropertyOptional({
    type: () => [Order],
    description: 'Заказы пользователя',
  })
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @Field()
  @ApiProperty({
    enum: ['user', 'admin'],
    example: 'user',
    description: 'Роль пользователя',
  })
  @Column({
    type: 'enum',
    enum: ['user', 'admin'],
    default: 'user',
  })
  role: 'user' | 'admin';
}
