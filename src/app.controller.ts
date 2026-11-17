import { Controller, Get, Render } from '@nestjs/common';
import { TestimonialsService } from './testimonials/testimonials.service';
import { MenuService } from './menu/menu.service';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { Dish } from './menu/entities/dish.entity';
import { ApiExcludeController } from '@nestjs/swagger';

config();
const configService = new ConfigService();

@Controller()
@ApiExcludeController()
export class AppController {
  constructor(
    private readonly testimonialsService: TestimonialsService,
    private readonly menuService: MenuService,
  ) {}

  @Get()
  @Render('pages/homepage')
  async getIndexPage() {
    const newProductsId = configService.get<string>('NEW_PRODUCTS_GUID');
    let dishes: Dish[];
    if (!newProductsId) {
      dishes = (await this.menuService.findAllDishes())[0];
    } else {
      dishes = (await this.menuService.findOneCategory(newProductsId))?.dishes;
    }
    const testimonials = (await this.testimonialsService.findAll())[0];

    return {
      title: 'Bella Pizza',
      dishes: dishes.map((dish) => ({
        id: dish.id,
        name: dish.name,
        description: dish.description,
        category: dish.category?.name,
        price: dish.price,
        image: dish.imageUrl,
      })),
      testimonials: testimonials.slice(0, 5).map((t) => ({
        name: t.user.name,
        rating: '⭐️'.repeat(t.rating),
        text: t.message,
      })),
    };
  }
}
