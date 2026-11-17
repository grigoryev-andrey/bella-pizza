import { Controller, Get, Query, Render } from '@nestjs/common';
import { BlogPostsService } from './blog-posts.service';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('blog')
@ApiExcludeController()
export class BlogPostsPagesController {
  constructor(private readonly blogPostsService: BlogPostsService) {}

  @Get()
  @Render('pages/blog')
  async getBlogPage(@Query('page') page = 1, @Query('limit') limit = 5) {
    let pageNum = Number(page);
    const [posts, total] = await this.blogPostsService.findAll(
      pageNum,
      Number(limit),
    );
    const totalPages = Math.ceil(total / limit);

    if (pageNum > totalPages && totalPages > 0) {
      pageNum = totalPages;
    }
    if (pageNum < 1) {
      pageNum = 1;
    }

    if (pageNum !== Number(page)) {
      const [correctedItems] = await this.blogPostsService.findAll(
        pageNum,
        Number(limit),
      );
      posts.length = 0;
      posts.push(...correctedItems);
    }

    return {
      title: 'Bella Pizza',
      posts: posts.map((post) => ({
        title: post.title,
        content: post.content,
        author: post.author,
        createdAt: post.createdAt.toLocaleString(),
      })),
      pagination: {
        page: pageNum,
        limit: Number(limit),
        total,
        totalPages,
        hasPrev: pageNum > 1,
        hasNext: pageNum < totalPages,
        prevPage: pageNum > 1 ? pageNum - 1 : null,
        nextPage: pageNum < totalPages ? pageNum + 1 : null,
      },
    };
  }
}
