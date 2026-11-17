import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersApiController } from './orders.api.controller';
import { Order } from './entities/order.entity';
import { User } from '../users/entities/user.entity';
import { Dish } from '../menu/entities/dish.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrdersCrudController } from './orders.crud.controller';
import { OrdersResolver } from './graphql/resolvers/orders.resolver';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User, OrderItem, Dish])],
  controllers: [OrdersApiController, OrdersCrudController],
  providers: [OrdersService, OrdersResolver, AuthService, UsersService],
})
export class OrdersModule {}
