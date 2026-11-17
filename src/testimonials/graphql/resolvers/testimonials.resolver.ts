import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { TestimonialsService } from '../../testimonials.service';
import { CreateTestimonialInput } from '../inputs/create-testimonial.input';
import { UpdateTestimonialInput } from '../inputs/update-testimonial.input';
import { Testimonial } from '../../entities/testimonial.entity';

@Resolver(() => Testimonial)
export class TestimonialsResolver {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Query(() => [Testimonial])
  async testimonials(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): Promise<Testimonial[]> {
    const [items] = await this.testimonialsService.findAll(page, limit);
    return items;
  }

  @Query(() => Testimonial)
  async testimonial(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Testimonial> {
    return this.testimonialsService.findOne(id);
  }

  @Mutation(() => Testimonial)
  async createTestimonial(
    @Args('input') input: CreateTestimonialInput,
  ): Promise<Testimonial> {
    return this.testimonialsService.create(input);
  }

  @Mutation(() => Testimonial)
  async updateTestimonial(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateTestimonialInput,
  ): Promise<Testimonial> {
    return this.testimonialsService.update(id, input);
  }

  @Mutation(() => Boolean)
  async removeTestimonial(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.testimonialsService.remove(id);
    return true;
  }
}
