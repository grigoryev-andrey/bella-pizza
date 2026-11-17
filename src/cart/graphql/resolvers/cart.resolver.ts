import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Cart } from '../../entities/cart.entity';
import { CartsService } from '../../carts.service';
import { CreateCartInput } from '../inputs/create-cart.input';
import { UpdateCartInput } from '../inputs/update-cart.input';
import { CreateCartItemInput } from '../inputs/create-cart-item.input';
import { CartItem } from '../../entities/cart-item.entity';
import { UpdateCartItemInput } from '../inputs/update-cart-item.input';

@Resolver(() => Cart)
export class CartsResolver {
  constructor(private readonly cartsService: CartsService) {}

  @Query(() => [Cart], { name: 'carts' })
  async findAll(
    @Args('page', { type: () => Number, nullable: true }) page = 1,
    @Args('limit', { type: () => Number, nullable: true }) limit = 10,
  ): Promise<Cart[]> {
    const [result] = await this.cartsService.findAll(page, limit);
    return result;
  }

  @Query(() => Cart, { name: 'cart' })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<Cart> {
    return this.cartsService.findOne(id);
  }

  @Mutation(() => Cart, { name: 'createCart' })
  async create(@Args('input') input: CreateCartInput): Promise<Cart> {
    return this.cartsService.create(input);
  }

  @Mutation(() => Cart, { name: 'updateCart' })
  async update(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCartInput,
  ): Promise<Cart> {
    return this.cartsService.update(id, input);
  }

  @Mutation(() => Boolean, { name: 'removeCart' })
  async remove(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    await this.cartsService.remove(id);
    return true;
  }

  @Mutation(() => Cart, { name: 'addCartItem' })
  async addItem(
    @Args('cartId', { type: () => ID }) cartId: string,
    @Args('input') input: CreateCartItemInput,
  ): Promise<Cart> {
    return this.cartsService.addItem(cartId, input);
  }

  @Mutation(() => CartItem, { name: 'updateCartItem' })
  async updateItem(
    @Args('itemId', { type: () => ID }) itemId: string,
    @Args('input') input: UpdateCartItemInput,
  ): Promise<CartItem> {
    return this.cartsService.updateItem(itemId, input);
  }

  @Mutation(() => Boolean, { name: 'removeCartItem' })
  async removeItem(
    @Args('itemId', { type: () => ID }) itemId: string,
  ): Promise<boolean> {
    await this.cartsService.removeItem(itemId);
    return true;
  }

  @Mutation(() => CartItem, { name: 'addOneToCart' })
  async addOneToCart(
    @Args('itemId', { type: () => ID }) itemId: string,
  ): Promise<CartItem> {
    return await this.cartsService.addOneToCart(itemId);
  }
}
