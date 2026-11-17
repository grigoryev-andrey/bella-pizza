import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestimonialsService } from './testimonials.service';
import { TestimonialsApiController } from './testimonials.api.controller';
import { Testimonial } from './entities/testimonial.entity';
import { User } from '../users/entities/user.entity';
import { TestimonialsCrudController } from './testimonials.crud.controller';
import { TestimonialsResolver } from './graphql/resolvers/testimonials.resolver';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([Testimonial, User])],
  controllers: [TestimonialsApiController, TestimonialsCrudController],
  providers: [
    TestimonialsService,
    TestimonialsResolver,
    AuthService,
    UsersService,
  ],
  exports: [TestimonialsService],
})
export class TestimonialsModule {}
