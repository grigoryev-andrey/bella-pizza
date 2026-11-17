import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '../auth/guards/auth.guard';

@UseGuards(AuthGuard, RolesGuard)
@ApiExcludeController()
@Controller('crud/testimonials')
export class TestimonialsCrudController {
  constructor() {}

  @Get('create')
  @Render('pages/cruds/testimonials/create')
  getCreateBlogPost() {
    return {};
  }

  @Get('update')
  @Render('pages/cruds/testimonials/update')
  getUpdateBlogPost() {
    return {};
  }

  @Get('delete')
  @Render('pages/cruds/testimonials/delete')
  getDeleteBlogPost() {
    return {};
  }
}
