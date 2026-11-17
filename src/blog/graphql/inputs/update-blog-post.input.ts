import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateBlogPostInput } from './create-blog-post.input';

@InputType()
export class UpdateBlogPostInput extends PartialType(CreateBlogPostInput) {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  author?: string;

  @Field({ nullable: true })
  userId?: string;
}
