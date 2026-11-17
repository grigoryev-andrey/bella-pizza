import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { User } from '../users/entities/user.entity';
import { Dish } from '../menu/entities/dish.entity';
import { Subject } from 'rxjs';

@Injectable()
export class OrdersService {
  private events$ = new Subject<{ type: string; data: any }>();

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Dish) private readonly dishRepository: Repository<Dish>,
  ) {}

  getEvents() {
    return this.events$.asObservable();
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) throw new NotFoundException(`User ${dto.userId} not found`);

    let total = 0;
    const items: OrderItem[] = [];

    for (const itemDto of dto.items) {
      const dish = await this.dishRepository.findOne({
        where: { id: itemDto.dishId },
      });
      if (!dish)
        throw new NotFoundException(`Dish ${itemDto.dishId} not found`);

      const price = Number(dish.price) * itemDto.quantity;
      total += price;

      const orderItem = this.orderItemRepository.create({
        dish,
        quantity: itemDto.quantity,
        price: dish.price,
      });

      items.push(orderItem);
    }

    const order = this.orderRepository.create({
      user,
      items,
      total,
      status: 'pending',
    });

    const saved = await this.orderRepository.save(order);

    this.events$.next({ type: 'created', data: saved });

    return saved;
  }

  async findAll(page = 1, limit = 10): Promise<[Order[], number]> {
    return this.orderRepository.findAndCount({
      relations: ['items', 'items.dish', 'user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async update(id: string, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    if (dto.status) {
      order.status = dto.status;
    }

    if (dto.items) {
      await this.orderItemRepository.delete({ order: { id } });

      let total = 0;
      const items: OrderItem[] = [];

      for (const itemDto of dto.items) {
        const dish = await this.dishRepository.findOne({
          where: { id: itemDto.dishId },
        });
        if (!dish)
          throw new NotFoundException(`Dish ${itemDto.dishId} not found`);

        const price = Number(dish.price) * itemDto.quantity;
        total += price;

        const orderItem = this.orderItemRepository.create({
          order,
          dish,
          quantity: itemDto.quantity,
          price: dish.price,
        });

        items.push(orderItem);
      }

      order.items = items;
      order.total = total;
    }

    const updated = await this.orderRepository.save(order);

    this.events$.next({ type: 'updated', data: updated });

    return updated;
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);

    this.events$.next({ type: 'removed', data: { id } });
  }
}
