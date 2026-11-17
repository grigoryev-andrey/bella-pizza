import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('orders')
export class Order {
  @Field(() => ID)
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID заказа',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => User)
  @ApiProperty({
    type: () => User,
    description: 'Пользователь, сделавший заказ',
  })
  @ManyToOne(() => User, { eager: true })
  user: User;

  @Field(() => [OrderItem])
  @ApiProperty({
    type: () => [OrderItem],
    description: 'Элементы заказа',
  })
  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @Field(() => Float)
  @ApiProperty({
    example: 45.99,
    description: 'Общая сумма заказа',
  })
  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Field()
  @ApiProperty({
    example: 'pending',
    description: 'Статус заказа',
    enum: ['pending', 'confirmed', 'delivered'],
  })
  @Column({ default: 'pending' })
  status: 'pending' | 'confirmed' | 'delivered';

  @Field()
  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Дата создания заказа',
  })
  @CreateDateColumn()
  createdAt: Date;
}
