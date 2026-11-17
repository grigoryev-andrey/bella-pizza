import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { User } from '../users/entities/user.entity';
import { Dish } from '../menu/entities/dish.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Subject } from 'rxjs';

@Injectable()
export class CartsService {
  private events$ = new Subject<{ type: string; data: any }>();

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Dish)
    private readonly dishRepository: Repository<Dish>,
  ) {}

  getEvents() {
    return this.events$.asObservable();
  }

  async findAll(page = 1, limit = 10): Promise<[Cart[], number]> {
    return this.cartRepository.findAndCount({
      relations: ['items', 'items.dish', 'user'],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.dish', 'user'],
    });

    if (cart) {
      return cart;
    }

    const cartDto = new CreateCartDto();
    cartDto.userId = userId;
    cartDto.items = [];
    await this.create(cartDto);

    return (await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.dish', 'user'],
    }))!;
  }

  async findOne(id: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id },
      relations: ['items', 'items.dish', 'user'],
    });
    if (!cart) throw new NotFoundException(`Cart with id ${id} not found`);
    return cart;
  }

  async create(dto: CreateCartDto): Promise<Cart> {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user)
      throw new NotFoundException(`User with id ${dto.userId} not found`);

    const items: CartItem[] = [];
    for (const itemDto of dto.items) {
      const dish = await this.dishRepository.findOne({
        where: { id: itemDto.dishId },
      });
      if (!dish)
        throw new NotFoundException(`Dish with id ${itemDto.dishId} not found`);

      const cartItem = this.cartItemRepository.create({
        dish,
        quantity: itemDto.quantity,
      });
      items.push(cartItem);
    }

    const cart = this.cartRepository.create({ user, items });
    const saved = await this.cartRepository.save(cart);

    this.events$.next({ type: 'created', data: saved });

    return saved;
  }

  async update(id: string, dto: UpdateCartDto): Promise<Cart> {
    const cart = await this.findOne(id);

    if (dto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: dto.userId },
      });
      if (!user)
        throw new NotFoundException(`User with id ${dto.userId} not found`);
      cart.user = user;
    }

    if (dto.items) {
      await this.cartItemRepository.delete({ cart: { id: cart.id } });
      const items: CartItem[] = [];
      for (const itemDto of dto.items) {
        const dish = await this.dishRepository.findOne({
          where: { id: itemDto.dishId },
        });
        if (!dish)
          throw new NotFoundException(
            `Dish with id ${itemDto.dishId} not found`,
          );
        const cartItem = this.cartItemRepository.create({
          dish,
          quantity: itemDto.quantity,
          cart,
        });
        items.push(cartItem);
      }
      cart.items = items;
    }

    const updated = await this.cartRepository.save(cart);

    this.events$.next({ type: 'updated', data: updated });

    return updated;
  }

  async remove(id: string): Promise<void> {
    const cart = await this.findOne(id);
    await this.cartRepository.remove(cart);

    this.events$.next({ type: 'removed', data: { id } });
  }

  async addItem(cartId: string, dto: CreateCartItemDto): Promise<Cart> {
    const cart = await this.findOne(cartId);
    const dish = await this.dishRepository.findOne({
      where: { id: dto.dishId },
    });
    if (!dish)
      throw new NotFoundException(`Dish with id ${dto.dishId} not found`);

    const cartItem = this.cartItemRepository.create({
      dish,
      quantity: dto.quantity,
      cart,
    });

    await this.cartItemRepository.save(cartItem);
    const updated = await this.findOne(cartId);

    this.events$.next({ type: 'item_added', data: updated });

    return updated;
  }

  async updateItem(itemId: string, dto: UpdateCartItemDto): Promise<CartItem> {
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: ['dish', 'cart'],
    });
    if (!item)
      throw new NotFoundException(`CartItem with id ${itemId} not found`);

    if (dto.dishId) {
      const dish = await this.dishRepository.findOne({
        where: { id: dto.dishId },
      });
      if (!dish)
        throw new NotFoundException(`Dish with id ${dto.dishId} not found`);
      item.dish = dish;
    }

    if (dto.quantity) item.quantity = dto.quantity;

    const updated = await this.cartItemRepository.save(item);

    this.events$.next({ type: 'item_updated', data: updated });

    return updated;
  }

  async removeItem(itemId: string): Promise<void> {
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId },
    });
    if (!item)
      throw new NotFoundException(`CartItem with id ${itemId} not found`);
    await this.cartItemRepository.remove(item);

    this.events$.next({ type: 'item_removed', data: { itemId } });
  }

  async addOneToCart(itemId: string): Promise<CartItem> {
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId },
    });
    if (!item)
      throw new NotFoundException(`CartItem with id ${itemId} not found`);

    item.quantity++;
    const updated = await this.cartItemRepository.save(item);

    this.events$.next({ type: 'item_updated', data: { itemId } });

    return updated;
  }
}
