import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuService } from './menu.service';
import { MenuApiController } from './menu.api.controller';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { MenuPagesController } from './menu.pages.controller';
import { MenuCrudController } from './menu.crud.controller';
import { MenuResolver } from './graphql/resolvers/menu.resolver';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthService } from '../auth/auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Dish]),
    CacheModule.register({
      ttl: 5,
      max: 100,
    }),
    UsersModule,
  ],
  controllers: [MenuApiController, MenuPagesController, MenuCrudController],
  providers: [MenuService, MenuResolver, AuthService],
  exports: [MenuService],
})
export class MenuModule {}
