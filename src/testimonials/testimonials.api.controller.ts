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
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
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
import { Testimonial } from './entities/testimonial.entity';

@ApiTags('Testimonials')
@Controller('api/testimonials')
export class TestimonialsApiController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Sse('events')
  @ApiOperation({ summary: 'Подписка на события отзывов (SSE)' })
  @ApiResponse({
    status: 200,
    description: 'Поток событий в формате Server-Sent Events',
  })
  sseEvents(): Observable<MessageEvent> {
    return this.testimonialsService.getEvents().pipe(
      map((event) => ({
        data: event,
      })),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Получить список отзывов с пагинацией' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Номер страницы (по умолчанию: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Количество элементов на странице (по умолчанию: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Список отзывов с пагинацией',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(Testimonial) },
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
    const [items, total] = await this.testimonialsService.findAll(
      pageNum,
      Number(limit),
    );
    const totalPages = Math.ceil(total / limit);

    if (pageNum > totalPages && totalPages > 0) pageNum = totalPages;
    if (pageNum < 1) pageNum = 1;

    if (pageNum !== Number(page)) {
      const [correctedItems] = await this.testimonialsService.findAll(
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
  @ApiOperation({ summary: 'Получить отзыв по ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID отзыва',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Найденный отзыв',
    type: Testimonial,
  })
  @ApiResponse({ status: 404, description: 'Отзыв не найден' })
  findOne(@Param('id') id: string) {
    return this.testimonialsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать новый отзыв' })
  @ApiBody({ type: CreateTestimonialDto })
  @ApiResponse({
    status: 201,
    description: 'Отзыв успешно создан',
    type: Testimonial,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  create(@Body() dto: CreateTestimonialDto) {
    return this.testimonialsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить отзыв по ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID отзыва',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdateTestimonialDto })
  @ApiResponse({
    status: 200,
    description: 'Обновленный отзыв',
    type: Testimonial,
  })
  @ApiResponse({ status: 404, description: 'Отзыв не найден' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  update(@Param('id') id: string, @Body() dto: UpdateTestimonialDto) {
    return this.testimonialsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить отзыв по ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID отзыва',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Отзыв успешно удален' })
  @ApiResponse({ status: 404, description: 'Отзыв не найден' })
  remove(@Param('id') id: string) {
    return this.testimonialsService.remove(id);
  }
}
