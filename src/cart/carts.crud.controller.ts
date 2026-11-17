import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '../auth/guards/auth.guard';

@UseGuards(AuthGuard, RolesGuard)
@ApiExcludeController()
@Controller('crud/carts')
export class CartsCrudController {
  constructor() {}

  @Get('create')
  @Render('pages/cruds/carts/create')
  getCreateUser() {
    return {};
  }

  @Get('update')
  @Render('pages/cruds/carts/update')
  getUpdateUser() {
    return {};
  }

  @Get('delete')
  @Render('pages/cruds/carts/delete')
  getDeleteUser() {
    return {};
  }
}
