import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { MenuService } from '../../menu.service';
import { Category } from '../../entities/category.entity';
import { CreateCategoryInput } from '../inputs/create-category.input';
import { UpdateCategoryInput } from '../inputs/update-category.input';
import { UpdateDishInput } from '../inputs/update-dish.input';
import { Dish } from '../../entities/dish.entity';
import { CreateDishInput } from '../inputs/create-dish.input';
@Resolver()
export class MenuResolver {
  constructor(private readonly menuService: MenuService) {}

  @Query(() => [Category])
  async categories(): Promise<Category[]> {
    return this.menuService.findAllCategories();
  }

  @Query(() => Category)
  async category(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Category> {
    return this.menuService.findOneCategory(id);
  }

  @Mutation(() => Category)
  async createCategory(
    @Args('input') input: CreateCategoryInput,
  ): Promise<Category> {
    return this.menuService.createCategory(input);
  }

  @Mutation(() => Category)
  async updateCategory(
    @Args('input') input: UpdateCategoryInput,
  ): Promise<Category> {
    return this.menuService.updateCategory(input.id, input);
  }

  @Mutation(() => Boolean)
  async removeCategory(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.menuService.removeCategory(id);
    return true;
  }

  @Query(() => [Dish])
  async dishes(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): Promise<Dish[]> {
    const [dishes] = await this.menuService.findAllDishes(page, limit);
    return dishes;
  }

  @Query(() => Dish)
  async dish(@Args('id', { type: () => ID }) id: string): Promise<Dish> {
    return this.menuService.findOneDish(id);
  }

  @Mutation(() => Dish)
  async createDish(@Args('input') input: CreateDishInput): Promise<Dish> {
    return this.menuService.createDish(input);
  }

  @Mutation(() => Dish)
  async updateDish(@Args('input') input: UpdateDishInput): Promise<Dish> {
    return this.menuService.updateDish(input.id, input);
  }

  @Mutation(() => Boolean)
  async removeDish(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.menuService.removeDish(id);
    return true;
  }
}
