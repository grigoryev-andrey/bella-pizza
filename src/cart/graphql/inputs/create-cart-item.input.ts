import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsUUID, Min } from 'class-validator';

@InputType()
export class CreateCartItemInput {
  @Field(() => ID)
  @IsUUID()
  dishId: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantity: number;
}
