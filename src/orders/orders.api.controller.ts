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
  Req, UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
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
import { Order } from './entities/order.entity';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Orders')
@Controller('api/orders')
export class OrdersApiController {
  constructor(private readonly ordersService: OrdersService) {}

  @Sse('events')
  @ApiOperation({ summary: 'Подписка на события заказов (SSE)' })
  @ApiResponse({
    status: 200,
    description: 'Поток событий в формате Server-Sent Events',
  })
  sseEvents(): Observable<MessageEvent> {
    return this.ordersService.getEvents().pipe(
      map((event) => ({
        data: event,
      })),
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  @ApiOperation({ summary: 'Получить список заказов с пагинацией' })
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
    description: 'Список заказов с пагинацией',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(Order) },
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
    const [items, total] = await this.ordersService.findAll(
      pageNum,
      Number(limit),
    );
    const totalPages = Math.ceil(total / limit);

    if (pageNum > totalPages && totalPages > 0) pageNum = totalPages;
    if (pageNum < 1) pageNum = 1;

    if (pageNum !== Number(page)) {
      const [correctedItems] = await this.ordersService.findAll(
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
  @ApiOperation({ summary: 'Получить заказ по ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID заказа',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Найденный заказ',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Заказ не найден' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать новый заказ' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Заказ успешно создан',
    type: Order,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({
    status: 404,
    description: 'Пользователь или блюдо не найдены',
  })
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить заказ по ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID заказа',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({
    status: 200,
    description: 'Заказ успешно обновлен',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Заказ не найден' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить заказ по ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID заказ',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Заказ успешно удален' })
  @ApiResponse({ status: 404, description: 'Заказ не найден' })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
