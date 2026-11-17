import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { OrdersService } from '../../orders.service';
import { CreateOrderInput } from '../inputs/create-order.input';
import { UpdateOrderInput } from '../inputs/update-order.input';
import { Order } from '../../entities/order.entity';
import { UpdateOrderDto } from '../../dto/update-order.dto';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Query(() => [Order])
  async orders(
    @Args('page', { type: () => Number, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Number, defaultValue: 10 }) limit: number,
  ): Promise<Order[]> {
    const [orders] = await this.ordersService.findAll(page, limit);
    return orders;
  }

  @Query(() => Order)
  async order(@Args('id', { type: () => ID }) id: string): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Mutation(() => Order)
  async createOrder(@Args('input') input: CreateOrderInput): Promise<Order> {
    return this.ordersService.create(input);
  }

  @Mutation(() => Order)
  async updateOrder(@Args('input') input: UpdateOrderInput): Promise<Order> {
    return this.ordersService.update(input.id, input);
  }

  @Mutation(() => Boolean)
  async removeOrder(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.ordersService.remove(id);
    return true;
  }

  @Mutation(() => Order)
  async confirmOrder(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Order> {
    const orderDto = new UpdateOrderDto();
    orderDto.status = 'confirmed';
    return await this.ordersService.update(id, orderDto);
  }
}
