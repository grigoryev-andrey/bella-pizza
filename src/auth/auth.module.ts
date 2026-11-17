import {
  DynamicModule,
  Module,
  MiddlewareConsumer,
  NestModule,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { initSuperTokens, SuperTokensConfig } from './supertokens.config';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { SessionMiddleware } from '../session.middleware';
import { UsersService } from '../users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

@Module({})
export class AuthModule implements NestModule {
  static forRoot(config: SuperTokensConfig): DynamicModule {
    initSuperTokens(config);

    return {
      module: AuthModule,
      imports: [UsersModule, TypeOrmModule.forFeature([User])],
      providers: [AuthService, AuthGuard, RolesGuard, UsersService],
      exports: [AuthService, AuthGuard, RolesGuard],
    };
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware).forRoutes('*');
  }
}
