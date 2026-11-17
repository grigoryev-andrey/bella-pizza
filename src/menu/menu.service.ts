import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { Subject } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class MenuService {
  private events$ = new Subject<{
    type: string;
    entity: 'category' | 'dish';
    data: any;
  }>();

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Dish)
    private readonly dishRepository: Repository<Dish>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  getEvents() {
    return this.events$.asObservable();
  }

  async findAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find({ relations: ['dishes'] });
  }

  async findOneCategory(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['dishes'],
    });
    if (!category)
      throw new NotFoundException(`Category with id ${id} not found`);
    return category;
  }

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(dto);
    const saved = await this.categoryRepository.save(category);
    this.events$.next({ type: 'created', entity: 'category', data: saved });
    return saved;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOneCategory(id);
    if (dto.name !== undefined) {
      category.name = dto.name;
    }
    const updated = await this.categoryRepository.save(category);
    this.events$.next({ type: 'updated', entity: 'category', data: updated });
    return updated;
  }

  async removeCategory(id: string): Promise<void> {
    const category = await this.findOneCategory(id);
    await this.categoryRepository.remove(category);
    this.events$.next({ type: 'removed', entity: 'category', data: { id } });
  }

  async findAllDishes(page = 1, limit = 10): Promise<[Dish[], number]> {
    const cacheKey = `dishes_page_${page}_limit_${limit}`;

    const cached = await this.cacheManager.get<[Dish[], number]>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.dishRepository.findAndCount({
      relations: ['category'],
      skip: (page - 1) * limit,
      take: limit,
    });

    await this.cacheManager.set(cacheKey, result, 5);

    return result;
  }

  async findDishesByCategoryPaginated(
    categoryId: string,
    page = 1,
    limit = 10,
  ): Promise<[Dish[], number]> {
    return this.dishRepository.findAndCount({
      where: { category: { id: categoryId } },
      relations: ['category'],
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });
  }

  async findOneDish(id: string): Promise<Dish> {
    const dish = await this.dishRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!dish) throw new NotFoundException(`Dish with id ${id} not found`);
    return dish;
  }

  async createDish(dto: CreateDishDto): Promise<Dish> {
    const category = await this.categoryRepository.findOne({
      where: { id: dto.categoryId },
    });
    if (!category)
      throw new NotFoundException(
        `Category with id ${dto.categoryId} not found`,
      );

    const dish = this.dishRepository.create({
      ...dto,
      category,
    });

    const saved = await this.dishRepository.save(dish);
    this.events$.next({ type: 'created', entity: 'dish', data: saved });
    return saved;
  }

  async updateDish(id: string, dto: UpdateDishDto): Promise<Dish> {
    const dish = await this.findOneDish(id);

    if (dto.categoryId !== undefined) {
      const category = await this.categoryRepository.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Category with id ${dto.categoryId} not found`,
        );
      }
      dish.category = category;
    }

    if (dto.name !== undefined) dish.name = dto.name;
    if (dto.description !== undefined) dish.description = dto.description;
    if (dto.price !== undefined) dish.price = dto.price;
    if (dto.imageUrl !== undefined) dish.imageUrl = dto.imageUrl;

    const updated = await this.dishRepository.save(dish);
    this.events$.next({ type: 'updated', entity: 'dish', data: updated });
    return updated;
  }

  async removeDish(id: string): Promise<void> {
    const dish = await this.findOneDish(id);
    await this.dishRepository.remove(dish);
    this.events$.next({ type: 'removed', entity: 'dish', data: { id } });
  }
}
