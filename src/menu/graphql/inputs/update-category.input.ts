import { InputType, Field, ID } from '@nestjs/graphql';
import { MaxLength, IsOptional, IsUUID } from 'class-validator';

@InputType()
export class UpdateCategoryInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(100)
  name?: string;
}
