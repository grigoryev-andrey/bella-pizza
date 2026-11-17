import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { CartsService } from './carts.service';
import { ApiExcludeController } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CartItem } from './entities/cart-item.entity';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('cart')
@ApiExcludeController()
export class CartsPagesController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  @UseGuards(AuthGuard)
  @Render('pages/cart')
  async getCartPage(@CurrentUser() user: { userId: string }) {
    let cart: { items: CartItem[] } = { items: [] };
    if (user.userId) {
      cart = await this.cartsService.findOrCreateByUserId(user.userId);
    }

    return {
      title: 'Bella Pizza',
      cart,
      userId: user.userId,
      helpers: {
        multiply: (a: number, b: number) => (a * b).toFixed(2),
        calculateTotal: (items: CartItem[]) => {
          return items
            .reduce((total, item) => total + item.dish.price * item.quantity, 0)
            .toFixed(2);
        },
      },
    };
  }
}
