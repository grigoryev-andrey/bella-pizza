import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartsService } from './carts.service';
import { CartsApiController } from './carts.api.controller';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { User } from '../users/entities/user.entity';
import { Dish } from '../menu/entities/dish.entity';
import { CartsPagesController } from './carts.pages.controller';
import { CartsCrudController } from './carts.crud.controller';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { CartsResolver } from './graphql/resolvers/cart.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, User, Dish])],
  controllers: [CartsApiController, CartsPagesController, CartsCrudController],
  providers: [CartsService, AuthService, UsersService, CartsResolver],
})
export class CartsModule {}
