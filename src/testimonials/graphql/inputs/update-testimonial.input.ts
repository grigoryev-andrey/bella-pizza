import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateTestimonialInput } from './create-testimonial.input';

@InputType()
export class UpdateTestimonialInput extends PartialType(
  CreateTestimonialInput,
) {
  @Field({ nullable: true })
  message?: string;

  @Field(() => Int, { nullable: true })
  rating?: number;

  @Field({ nullable: true })
  userId?: string;
}
