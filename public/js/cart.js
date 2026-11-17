class CartManager {
  constructor() {
    this.userId = null;
    this.init();
  }

  init() {
    this.getCurrentUser();
    this.bindEvents();
    this.updateCartTotal();
  }

  async getCurrentUser() {
    try {
      const response = await fetch('/api/users/me');
      if (response.ok) {
        const user = await response.json();
        this.userId = user.userId;
      }
    } catch (error) {
      console.error('Error getting user:', error);
    }
  }

  bindEvents() {
    document.querySelectorAll('.quantity-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const action = e.target.closest('.quantity-btn').dataset.action;
        const itemElement = e.target.closest('.cart-item');
        this.handleQuantityChange(action, itemElement);
      });
    });

    document.querySelectorAll('.remove-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const itemElement = e.target.closest('.cart-item');
        this.removeItem(itemElement);
      });
    });

    const clearCartBtn = document.getElementById('clear-cart');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', () => this.clearCart());
    }

    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => this.checkout());
    }
  }

  async handleQuantityChange(action, itemElement) {
    const itemId = itemElement.dataset.itemId;
    const quantityElement = itemElement.querySelector('.quantity');
    let quantity = parseInt(quantityElement.textContent);

    try {
      if (action === 'increase') {
        quantity++;
        await this.updateItemQuantity(itemId, quantity);
        quantityElement.textContent = quantity;
      } else if (action === 'decrease' && quantity > 1) {
        quantity--;
        await this.updateItemQuantity(itemId, quantity);
        quantityElement.textContent = quantity;
      } else {
        return;
      }

      this.updateItemTotal(itemElement);
      this.updateCartTotal();
      this.showSuccess('Количество обновлено');
    } catch (error) {
      console.error('Error updating quantity:', error);
      this.showError('Ошибка при обновлении количества');
    }
  }

  async removeItem(itemElement) {
    const itemId = itemElement.dataset.itemId;

    if (!confirm('Вы уверены, что хотите удалить товар из корзины?')) {
      return;
    }

    try {
      await this.sendRequest(`/api/carts/items/${itemId}`, 'DELETE');
      itemElement.remove();
      this.updateCartTotal();
      this.showSuccess('Товар удален из корзины');

      if (document.querySelectorAll('.cart-item').length === 0) {
        this.showEmptyCart();
      }
    } catch (error) {
      console.error('Error removing item:', error);
      this.showError('Ошибка при удалении товара');
    }
  }

  async clearCart() {
    if (!confirm('Вы уверены, что хотите очистить всю корзину?')) {
      return;
    }

    try {
      const items = document.querySelectorAll('.cart-item');
      for (const item of items) {
        const itemId = item.dataset.itemId;
        await this.sendRequest(`/api/carts/items/${itemId}`, 'DELETE');
      }

      this.clearCartItems();
      this.showEmptyCart();
      this.showSuccess('Корзина очищена');
    } catch (error) {
      console.error('Error clearing cart:', error);
      this.showError('Ошибка при очистке корзины');
    }
  }

  async checkout() {
    if (!this.userId) {
      this.showError('Пожалуйста, войдите в систему для оформления заказа');
      return;
    }

    const cartItems = this.getCartItemsData();
    if (cartItems.length === 0) {
      this.showError('Корзина пуста');
      return;
    }

    try {
      const orderData = {
        userId: this.userId,
        items: cartItems
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        this.showSuccess('Заказ успешно оформлен!');
        await this.clearCartAfterOrder();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Order creation failed');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      this.showError('Ошибка при оформлении заказа: ' + error.message);
    }
  }

  getCartItemsData() {
    const items = [];
    document.querySelectorAll('.cart-item').forEach((itemElement) => {
      const dishId = itemElement.dataset.dishId;
      const quantity = parseInt(itemElement.querySelector('.quantity').textContent);

      items.push({
        dishId: dishId,
        quantity: quantity
      });
    });
    return items;
  }

  async clearCartAfterOrder() {
    try {
      const items = document.querySelectorAll('.cart-item');
      for (const item of items) {
        const itemId = item.dataset.itemId;
        await this.sendRequest(`/api/carts/items/${itemId}`, 'DELETE');
      }

      this.clearCartItems();
      this.showEmptyCart();
    } catch (error) {
      console.error('Error clearing cart after order:', error);
    }
  }

  clearCartItems() {
    const cartItems = document.querySelector('.cart-items');
    if (cartItems) {
      while (cartItems.firstChild) {
        cartItems.removeChild(cartItems.firstChild);
      }
    }
  }

  async updateItemQuantity(itemId, quantity) {
    return this.sendRequest(`/api/carts/items/${itemId}`, 'PATCH', {
      quantity: quantity,
    });
  }

  updateItemTotal(itemElement) {
    const price = parseFloat(
      itemElement.querySelector('.item-price').textContent.replace(/^\$/, ''),
    );
    const quantity = parseInt(
      itemElement.querySelector('.quantity').textContent,
    );
    const totalElement = itemElement.querySelector('.total-price');

    totalElement.textContent = '$'+(price * quantity).toFixed(2);
  }

  updateCartTotal() {
    const totalElements = document.querySelectorAll('.total-price');
    let total = 0;

    totalElements.forEach((element) => {
      const price = parseFloat(element.textContent.replace(/^\$/, ''));
      total += price;
    });

    const cartTotalElement = document.getElementById('cart-total');
    if (cartTotalElement) {
      cartTotalElement.textContent = '$'+total.toFixed(2);
    }
  }

  showEmptyCart() {
    const cartContainer = document.querySelector('.cart-page .cart-container');
    const pageName = document.querySelector('.cart-page-name');

    if (pageName) {
      pageName.classList.add('hidden');
    }

    if (cartContainer) {
      while (cartContainer.firstChild) {
        cartContainer.removeChild(cartContainer.firstChild);
      }

      const emptyCartDiv = document.createElement('div');
      emptyCartDiv.className = 'empty-cart';

      const heading = document.createElement('h2');
      heading.textContent = 'Корзина пуста';

      const paragraph = document.createElement('p');
      paragraph.textContent = 'Добавьте товары из меню';

      const link = document.createElement('a');
      link.href = '/menu';
      link.className = 'btn btn-primary';
      link.textContent = 'Перейти в меню';

      emptyCartDiv.appendChild(heading);
      emptyCartDiv.appendChild(paragraph);
      emptyCartDiv.appendChild(link);

      cartContainer.appendChild(emptyCartDiv);
    }
  }

  async sendRequest(url, method, data = null) {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    if (method !== 'DELETE') {
      return response.json();
    }
  }

  showSuccess(message) {
    toastr.success(message);
  }

  showError(message) {
    toastr.error(message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new CartManager();
});