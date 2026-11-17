import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '../auth/guards/auth.guard';

@UseGuards(AuthGuard, RolesGuard)
@ApiExcludeController()
@Controller('crud')
export class MenuCrudController {
  constructor() {}

  @Get('dishes/create')
  @Render('pages/cruds/dishes/create')
  getCreateDish() {
    return {};
  }

  @Get('dishes/update')
  @Render('pages/cruds/dishes/update')
  getUpdateDish() {
    return {};
  }

  @Get('dishes/delete')
  @Render('pages/cruds/dishes/delete')
  getDeleteDish() {
    return {};
  }

  @Get('categories/create')
  @Render('pages/cruds/categories/create')
  getCreateCategory() {
    return {};
  }

  @Get('categories/update')
  @Render('pages/cruds/categories/update')
  getUpdateCategory() {
    return {};
  }

  @Get('categories/delete')
  @Render('pages/cruds/categories/delete')
  getDeleteCategory() {
    return {};
  }
}
