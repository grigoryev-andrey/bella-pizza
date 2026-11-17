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
  UseGuards,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
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
import { Cart } from './entities/cart.entity';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Carts')
@Controller('api/carts')
export class CartsApiController {
  constructor(private readonly cartsService: CartsService) {}

  @Sse('events')
  @ApiOperation({ summary: 'Подписка на события корзин (SSE)' })
  @ApiResponse({
    status: 200,
    description: 'Поток событий в формате Server-Sent Events',
  })
  events(): Observable<MessageEvent> {
    return this.cartsService.getEvents().pipe(
      map((event) => ({
        data: event,
      })),
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  @ApiOperation({ summary: 'Получить список корзин с пагинацией' })
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
    description: 'Список корзин с пагинацией',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(Cart) },
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
    const [items, total] = await this.cartsService.findAll(
      pageNum,
      Number(limit),
    );
    const totalPages = Math.ceil(total / limit);

    if (pageNum > totalPages && totalPages > 0) pageNum = totalPages;
    if (pageNum < 1) pageNum = 1;

    if (pageNum !== Number(page)) {
      const [correctedItems] = await this.cartsService.findAll(
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
  @ApiOperation({ summary: 'Получить корзину по ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID корзины',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Найденная корзина',
    type: Cart,
  })
  @ApiResponse({ status: 404, description: 'Корзина не найдена' })
  findOne(@Param('id') id: string) {
    return this.cartsService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Получить корзину по ID пользователя' })
  @ApiParam({
    name: 'userId',
    description: 'UUID пользователя',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Корзина пользователя',
    type: Cart,
  })
  async findOrCreateByUserId(@Param('userId') userId: string) {
    return this.cartsService.findOrCreateByUserId(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Создать новую корзину' })
  @ApiBody({ type: CreateCartDto })
  @ApiResponse({
    status: 201,
    description: 'Корзина успешно создана',
    type: Cart,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  create(@Body() dto: CreateCartDto) {
    return this.cartsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить корзину по ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID корзины',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdateCartDto })
  @ApiResponse({
    status: 200,
    description: 'Обновленная корзина',
    type: Cart,
  })
  @ApiResponse({ status: 404, description: 'Корзина не найдена' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  update(@Param('id') id: string, @Body() dto: UpdateCartDto) {
    return this.cartsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить корзину по ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID корзины',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Корзина успешно удалена' })
  @ApiResponse({ status: 404, description: 'Корзина не найдена' })
  remove(@Param('id') id: string) {
    return this.cartsService.remove(id);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Добавить элемент в корзину' })
  @ApiParam({
    name: 'id',
    description: 'UUID корзины',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: CreateCartItemDto })
  @ApiResponse({
    status: 201,
    description: 'Элемент успешно добавлен в корзину',
    type: Cart,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 404, description: 'Корзина или блюдо не найдены' })
  addItem(@Param('id') cartId: string, @Body() dto: CreateCartItemDto) {
    return this.cartsService.addItem(cartId, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Обновить элемент корзины' })
  @ApiParam({
    name: 'itemId',
    description: 'UUID элемента корзины',
    example: 'b1c2d3e4-f5g6-7890-hijk-lm1234567890',
  })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({
    status: 200,
    description: 'Элемент корзины успешно обновлен',
    type: Cart,
  })
  @ApiResponse({ status: 404, description: 'Элемент корзины не найден' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  updateItem(@Param('itemId') itemId: string, @Body() dto: UpdateCartItemDto) {
    return this.cartsService.updateItem(itemId, dto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Удалить элемент из корзины' })
  @ApiParam({
    name: 'itemId',
    description: 'UUID элемента корзины',
    example: 'b1c2d3e4-f5g6-7890-hijk-lm1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Элемент успешно удален из корзины',
    type: Cart,
  })
  @ApiResponse({ status: 404, description: 'Элемент корзины не найден' })
  removeItem(@Param('itemId') itemId: string) {
    return this.cartsService.removeItem(itemId);
  }
}
