import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(AuthGuard, RolesGuard)
@ApiExcludeController()
@Controller('crud/orders')
export class OrdersCrudController {
  constructor() {}

  @Get('create')
  @Render('pages/cruds/orders/create')
  getCreateOrder() {
    return {};
  }

  @Get('update')
  @Render('pages/cruds/orders/update')
  getUpdateOrder() {
    return {};
  }

  @Get('delete')
  @Render('pages/cruds/orders/delete')
  getDeleteOrder() {
    return {};
  }
}
