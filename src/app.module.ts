import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import dataSource from './data-source';

import { UsersModule } from './users/users.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { BlogPostsModule } from './blog/blog-posts.module';
import { CartsModule } from './cart/carts.module';
import { MenuModule } from './menu/menu.module';
import { OrdersModule } from './orders/orders.module';
import { CrudController } from './crud.controller';
import { ElapsedTimePlugin } from './elapsed-time.plugin';
import { AuthModule } from './auth/auth.module';
import { config } from 'dotenv';

config();
const configService = new ConfigService();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      useFactory: () => ({}),
      dataSourceFactory: async () => {
        await dataSource.initialize();
        return dataSource;
      },
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      introspection: true,
      context: ({ req, res }) => ({ req, res }),
      plugins: [ElapsedTimePlugin()],
    }),

    AuthModule.forRoot({
      connectionURI: configService.get<string>('SUPERTOKENS_CONNECTION_URI')!,
      apiDomain: configService.get<string>('API_DOMAIN')!,
      websiteDomain: configService.get<string>('WEBSITE_DOMAIN')!,
      apiKey: configService.get<string>('SUPERTOKENS_API_KEY')!,
      appName: configService.get<string>('APP_NAME')!,
    }),

    UsersModule,
    TestimonialsModule,
    BlogPostsModule,
    CartsModule,
    MenuModule,
    OrdersModule,
  ],
  controllers: [AppController, CrudController],
  providers: [AppService],
})
export class AppModule {}
