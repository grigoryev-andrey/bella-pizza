import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Sse,
  MessageEvent,
  Query,
  Res,
  Req,
} from '@nestjs/common';
import { BlogPostsService } from './blog-posts.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response, Request } from 'express';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { BlogPost } from './entities/blog-post.entity';

@ApiTags('Blog Posts')
@Controller('api/blog-posts')
export class BlogPostsApiController {
  constructor(private readonly blogPostsService: BlogPostsService) {}

  @Sse('events')
  @ApiOperation({ summary: 'Подписка на события постов блога (SSE)' })
  @ApiResponse({
    status: 200,
    description: 'Поток событий в формате Server-Sent Events',
  })
  events(): Observable<MessageEvent> {
    return this.blogPostsService.getEvents().pipe(
      map((event) => ({
        data: event,
      })),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Получить список постов блога с пагинацией' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Номер страницы (по умолчанию: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Количество элементов на странице (по умолчанию: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Список постов блога с пагинацией',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(BlogPost) },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 100 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 10 },
          },
        },
      },
    },
  })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    let pageNum = Number(page);
    const [items, total] = await this.blogPostsService.findAll(
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
      items.length = 0;
      items.push(...correctedItems);
    }
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;

    const links: string[] = [];

    if (pageNum > 1) {
      links.push(`<${baseUrl}?page=${pageNum - 1}&limit=${limit}>; rel="prev"`);
    }
    if (pageNum < totalPages) {
      links.push(`<${baseUrl}?page=${pageNum + 1}&limit=${limit}>; rel="next"`);
    }

    if (links.length) {
      res.setHeader('Link', links.join(', '));
    }

    return res.json({
      data: items,
      meta: {
        total,
        page: pageNum,
        limit: Number(limit),
        totalPages,
      },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пост блога по ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID поста блога',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Найденный пост блога',
    type: BlogPost,
  })
  @ApiResponse({ status: 404, description: 'Пост блога не найден' })
  findOne(@Param('id') id: string) {
    return this.blogPostsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать новый пост блога' })
  @ApiBody({ type: CreateBlogPostDto })
  @ApiResponse({
    status: 201,
    description: 'Пост блога успешно создан',
    type: BlogPost,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  create(@Body() dto: CreateBlogPostDto) {
    return this.blogPostsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить пост блога по ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID поста блога',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdateBlogPostDto })
  @ApiResponse({
    status: 200,
    description: 'Обновленный пост блога',
    type: BlogPost,
  })
  @ApiResponse({ status: 404, description: 'Пост блога не найден' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  update(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogPostsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить пост блога по ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID поста блога',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Пост блога успешно удален' })
  @ApiResponse({ status: 404, description: 'Пост блога не найден' })
  remove(@Param('id') id: string) {
    return this.blogPostsService.remove(id);
  }
}
