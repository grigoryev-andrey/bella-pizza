import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { BlogPostsService } from '../../blog-posts.service';
import { CreateBlogPostInput } from '../inputs/create-blog-post.input';
import { UpdateBlogPostInput } from '../inputs/update-blog-post.input';
import { BlogPost } from '../../entities/blog-post.entity';

@Resolver(() => BlogPost)
export class BlogPostsResolver {
  constructor(private readonly blogPostsService: BlogPostsService) {}

  @Query(() => [BlogPost])
  async blogPosts(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): Promise<BlogPost[]> {
    const [posts] = await this.blogPostsService.findAll(page, limit);
    return posts;
  }

  @Query(() => BlogPost)
  async blogPost(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<BlogPost> {
    return this.blogPostsService.findOne(id);
  }

  @Mutation(() => BlogPost)
  async createBlogPost(
    @Args('input') input: CreateBlogPostInput,
  ): Promise<BlogPost> {
    return this.blogPostsService.create(input);
  }

  @Mutation(() => BlogPost)
  async updateBlogPost(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBlogPostInput,
  ): Promise<BlogPost> {
    return this.blogPostsService.update(id, input);
  }

  @Mutation(() => Boolean)
  async removeBlogPost(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.blogPostsService.remove(id);
    return true;
  }
}
