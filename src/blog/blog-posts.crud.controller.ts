import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '../auth/guards/auth.guard';

@UseGuards(AuthGuard, RolesGuard)
@ApiExcludeController()
@Controller('crud/posts')
export class BlogPostsCrudController {
  constructor() {}

  @Get('create')
  @Render('pages/cruds/blog/create')
  getCreateBlogPost() {
    return {};
  }

  @Get('update')
  @Render('pages/cruds/blog/update')
  getUpdateBlogPost() {
    return {};
  }

  @Get('delete')
  @Render('pages/cruds/blog/delete')
  getDeleteBlogPost() {
    return {};
  }
}
