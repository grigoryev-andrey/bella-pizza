import { InputType, Field, ID } from '@nestjs/graphql';
import { CreateOrderItemInput } from './create-order-item.input';
import { IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class UpdateOrderInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => [CreateOrderItemInput], { nullable: true })
  @IsOptional()
  items?: CreateOrderItemInput[];

  @Field({ nullable: true })
  @IsString()
  status?: 'pending' | 'confirmed' | 'delivered';
}
