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
  Header,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
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
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';

@ApiTags('Menu')
@Controller('api/menu')
export class MenuApiController {
  constructor(private readonly menuService: MenuService) {}

  @Sse('events')
  @ApiOperation({ summary: 'Подписка на события меню (SSE)' })
  @ApiResponse({
    status: 200,
    description: 'Поток событий в формате Server-Sent Events',
  })
  events(): Observable<MessageEvent> {
    return this.menuService.getEvents().pipe(map((event) => ({ data: event })));
  }

  @Get('categories')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: 'Получить все категории' })
  @ApiResponse({
    status: 200,
    description: 'Список всех категорий',
    type: [Category],
  })
  findAllCategories() {
    return this.menuService.findAllCategories();
  }

  @Get('categories/:id')
  @Header('Cache-Control', 'public, max-age=600')
  findOneCategory(@Param('id') id: string) {
    return this.menuService.findOneCategory(id);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Создать новую категорию' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Категория успешно создана',
    type: Category,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({
    status: 400,
    description: 'Категория с таким именем уже существует',
  })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.menuService.createCategory(dto);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Обновить категорию по ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID категории',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Категория успешно обновлена',
    type: Category,
  })
  @ApiResponse({ status: 404, description: 'Категория не найдена' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({
    status: 409,
    description: 'Категория с таким именем уже существует',
  })
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.menuService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Удалить категорию по ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID категории',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Категория успешно удалена' })
  @ApiResponse({ status: 404, description: 'Категория не найдена' })
  removeCategory(@Param('id') id: string) {
    return this.menuService.removeCategory(id);
  }

  @Get('dishes')
  @ApiOperation({ summary: 'Получить список блюд с пагинацией' })
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
    description: 'Список блюд с пагинацией',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(Dish) },
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
  async findAllDishes(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    let pageNum = Number(page);
    const [items, total] = await this.menuService.findAllDishes(
      pageNum,
      Number(limit),
    );
    const totalPages = Math.ceil(total / limit);

    if (pageNum > totalPages && totalPages > 0) pageNum = totalPages;
    if (pageNum < 1) pageNum = 1;

    if (pageNum !== Number(page)) {
      const [correctedItems] = await this.menuService.findAllDishes(
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

    if (links.length) res.setHeader('Link', links.join(', '));

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

  @Get('dishes/:id')
  @ApiOperation({ summary: 'Получить блюдо по ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID блюда',
    example: 'b1c2d3e4-f5g6-7890-hijk-lm1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Найденное блюдо',
    type: Dish,
  })
  @ApiResponse({ status: 404, description: 'Блюдо не найдено' })
  findOneDish(@Param('id') id: string) {
    return this.menuService.findOneDish(id);
  }

  @Post('dishes')
  @ApiOperation({ summary: 'Создать новое блюдо' })
  @ApiBody({ type: CreateDishDto })
  @ApiResponse({
    status: 201,
    description: 'Блюдо успешно создано',
    type: Dish,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 404, description: 'Категория не найдена' })
  createDish(@Body() dto: CreateDishDto) {
    return this.menuService.createDish(dto);
  }

  @Patch('dishes/:id')
  @ApiOperation({ summary: 'Обновить блюдо по ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID блюда',
    example: 'b1c2d3e4-f5g6-7890-hijk-lm1234567890',
  })
  @ApiBody({ type: UpdateDishDto })
  @ApiResponse({
    status: 200,
    description: 'Блюдо успешно обновлено',
    type: Dish,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  updateDish(@Param('id') id: string, @Body() dto: UpdateDishDto) {
    return this.menuService.updateDish(id, dto);
  }

  @Delete('dishes/:id')
  @ApiOperation({ summary: 'Удалить блюдо по ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID блюда',
    example: 'b1c2d3e4-f5g6-7890-hijk-lm1234567890',
  })
  @ApiResponse({ status: 200, description: 'Блюдо успешно удалено' })
  @ApiResponse({ status: 404, description: 'Блюдо не найдено' })
  removeDish(@Param('id') id: string) {
    return this.menuService.removeDish(id);
  }
}
