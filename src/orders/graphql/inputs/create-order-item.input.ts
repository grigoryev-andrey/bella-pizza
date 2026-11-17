import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class CreateOrderItemInput {
  @Field(() => ID)
  @IsUUID()
  dishId: string;

  @Field(() => Int)
  quantity: number;
}
