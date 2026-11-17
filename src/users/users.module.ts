import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersApiController } from './users.api.controller';
import { User } from './entities/user.entity';
import { UsersCrudController } from './users.crud.controller';
import { UsersResolver } from './graphql/resolvers/users.resolver';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersApiController, UsersCrudController],
  providers: [UsersService, UsersResolver, AuthService],
  exports: [UsersService],
})
export class UsersModule {}
