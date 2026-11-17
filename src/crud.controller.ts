import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Render,
  UseGuards,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AuthGuard } from './auth/guards/auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@UseGuards(AuthGuard, RolesGuard)
@Controller('crud')
@ApiExcludeController()
export class CrudController {
  @Get()
  @Render('pages/cruds/crud')
  getCrudPage() {
    return {
      entities: [
        {
          name: 'Посты',
          entity: 'posts',
        },
        {
          name: 'Корзины',
          entity: 'carts',
        },
        {
          name: 'Блюда',
          entity: 'dishes',
        },
        {
          name: 'Категории',
          entity: 'categories',
        },
        {
          name: 'Заказы',
          entity: 'orders',
        },
        {
          name: 'Отзывы',
          entity: 'testimonials',
        },
        {
          name: 'Пользователи',
          entity: 'users',
        },
      ],
    };
  }

  @Get(':entity')
  @Render('pages/cruds/chooseAction')
  getChooseActionPage(@Param('entity') entity: string) {
    const titleMap = {
      posts: 'Посты',
      carts: 'Корзины',
      dishes: 'Блюда',
      categories: 'Категории',
      orders: 'Заказы',
      testimonials: 'Отзывы',
      users: 'Пользователи',
    };

    if (!titleMap[entity]) {
      throw new NotFoundException('Указанная сущность не найдена');
    }
    return {
      pageTitle: titleMap[entity],
    };
  }
}
