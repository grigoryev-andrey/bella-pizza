import { InputType, Field, ID, Float } from '@nestjs/graphql';
import { MaxLength, Min, IsOptional, IsUUID } from 'class-validator';

@InputType()
export class UpdateDishInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0.01)
  price?: number;

  @Field({ nullable: true })
  @IsOptional()
  imageUrl?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  categoryId?: string;
}
