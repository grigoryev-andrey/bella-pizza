import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPost } from './entities/blog-post.entity';
import { BlogPostsService } from './blog-posts.service';
import { BlogPostsApiController } from './blog-posts.api.controller';
import { User } from '../users/entities/user.entity';
import { BlogPostsPagesController } from './blog-posts.pages.controller';
import { BlogPostsCrudController } from './blog-posts.crud.controller';
import { BlogPostsResolver } from './graphql/resolvers/blog-posts.resolver';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([BlogPost, User])],
  controllers: [
    BlogPostsApiController,
    BlogPostsPagesController,
    BlogPostsCrudController,
  ],
  providers: [BlogPostsService, BlogPostsResolver, AuthService, UsersService],
})
export class BlogPostsModule {}
