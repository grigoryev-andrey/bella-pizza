import { InputType, Field, ID, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID, MaxLength, Min } from 'class-validator';

@InputType()
export class CreateDishInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field(() => Float)
  @Min(0.01)
  price: number;

  @Field()
  @IsNotEmpty()
  imageUrl: string;

  @Field(() => ID)
  @IsUUID()
  categoryId: string;
}
