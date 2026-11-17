import { Controller, Get, Param, Query, Render } from '@nestjs/common';
import { MenuService } from './menu.service';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('menu')
@ApiExcludeController()
export class MenuPagesController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @Render('pages/menu')
  async getMenuPage(@Query('page') page = 1, @Query('limit') limit = 10) {
    let pageNum = Number(page);
    const [dishes, total] = await this.menuService.findAllDishes(
      pageNum,
      Number(limit),
    );
    const totalPages = Math.ceil(total / limit);

    if (pageNum > totalPages && totalPages > 0) pageNum = totalPages;
    if (pageNum < 1) pageNum = 1;

    if (pageNum !== Number(page)) {
      const [correctedItems] = await this.menuService.findAllDishes(
        pageNum,
        Number(limit),
      );
      dishes.length = 0;
      dishes.push(...correctedItems);
    }

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
      categories: (await this.menuService.findAllCategories()).map(
        (category) => ({
          name: category.name,
          id: category.id,
          count: category.dishes.length,
        }),
      ),
      pagination: {
        page: pageNum,
        limit: Number(limit),
        total,
        totalPages,
        hasPrev: pageNum > 1,
        hasNext: pageNum < totalPages,
        prevPage: pageNum > 1 ? pageNum - 1 : null,
        nextPage: pageNum < totalPages ? pageNum + 1 : null,
      },
    };
  }

  @Get(':id')
  @Render('pages/menu')
  async getMenuPageByCategory(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const [dishes, total] =
      await this.menuService.findDishesByCategoryPaginated(
        id,
        pageNum,
        limitNum,
      );

    const totalPages = Math.ceil(total / limitNum);

    return {
      title: 'Bella Pizza',
      dishes: dishes.map((dish) => ({
        id: dish.id,
        name: dish.name,
        description: dish.description,
        category: dish.category?.name,
        price: `$${dish.price}`,
        image: dish.imageUrl,
      })),
      categories: (await this.menuService.findAllCategories()).map(
        (category) => ({
          name: category.name,
          id: category.id,
          count: category.dishes.length,
        }),
      ),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasPrev: pageNum > 1,
        hasNext: pageNum < totalPages,
        prevPage: pageNum > 1 ? pageNum - 1 : null,
        nextPage: pageNum < totalPages ? pageNum + 1 : null,
        baseUrl: `/menu/${id}`,
      },
    };
  }
}
