import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '../auth/guards/auth.guard';

@UseGuards(AuthGuard, RolesGuard)
@ApiExcludeController()
@Controller('crud/users')
export class UsersCrudController {
  constructor() {}

  @Get('create')
  @Render('pages/cruds/users/create')
  getCreateUser() {
    return {};
  }

  @Get('update')
  @Render('pages/cruds/users/update')
  getUpdateUser() {
    return {};
  }

  @Get('delete')
  @Render('pages/cruds/users/delete')
  getDeleteUser() {
    return {};
  }
}
