import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { CartItem } from './cart-item.entity';
import { User } from '../../users/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('carts')
export class Cart {
  @Field(() => ID)
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID корзины',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => [CartItem], { nullable: true })
  @ApiPropertyOptional({
    type: () => [CartItem],
    description: 'Элементы корзины',
  })
  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];

  @Field(() => User)
  @ApiProperty({
    type: () => User,
    description: 'Пользователь-владелец корзины',
  })
  @OneToOne(() => User, (user) => user.cart, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
