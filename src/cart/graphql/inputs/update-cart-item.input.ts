import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

@InputType()
export class UpdateCartItemInput {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  dishId?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;
}
