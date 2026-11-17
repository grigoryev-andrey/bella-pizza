import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsInt, Min, Max, IsUUID } from 'class-validator';

@InputType()
export class CreateTestimonialInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  message: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @Field()
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
