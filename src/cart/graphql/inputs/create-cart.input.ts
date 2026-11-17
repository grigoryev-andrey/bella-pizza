import { Field, ID, InputType } from '@nestjs/graphql';
import { IsArray, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCartItemInput } from './create-cart-item.input';

@InputType()
export class CreateCartInput {
  @Field(() => ID)
  @IsUUID()
  userId: string;

  @Field(() => [CreateCartItemInput], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCartItemInput)
  @IsOptional()
  items: CreateCartItemInput[];
}
