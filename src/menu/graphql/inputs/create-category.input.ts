import { InputType, Field } from '@nestjs/graphql';
import { MaxLength } from 'class-validator';

@InputType()
export class CreateCategoryInput {
  @Field()
  @MaxLength(100)
  name: string;
}
