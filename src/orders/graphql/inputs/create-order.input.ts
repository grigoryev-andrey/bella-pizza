import { InputType, Field, ID } from '@nestjs/graphql';
import { CreateOrderItemInput } from './create-order-item.input';
import { IsOptional, IsUUID } from 'class-validator';

@InputType()
export class CreateOrderInput {
  @Field(() => ID)
  @IsUUID()
  userId: string;

  @Field(() => [CreateOrderItemInput])
  @IsOptional()
  items: CreateOrderItemInput[];
}
