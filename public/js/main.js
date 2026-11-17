const clientStart = performance.now();

toastr.options = {
  positionClass: 'toast-bottom-right',
  timeOut: 3000,
  extendedTimeOut: 1000,
  showMethod: 'slideDown',
  hideMethod: 'slideUp'
};

window.addEventListener('DOMContentLoaded', async function () {
  let currentPath = document.location.pathname.split("/").pop();

  const menuItems = document.querySelectorAll('nav ul li a');
  menuItems.forEach((item) => {
    const itemPath = item.getAttribute('href');
    if (currentPath === itemPath) {
      item.parentElement.classList.add('active');
    }
  });

  const cartButton = document.querySelector('.cart-button');
  const crudButton = document.querySelector('.main-crud-button');

  cartButton.addEventListener('click', async function () {
    try {
      await me();
      window.location.href = `/cart`;
    } catch (err) {
      toastr.error('Пожалуйста, войдите в аккаунт, чтобы перейти в корзину');
    }
  });

  crudButton.addEventListener('click', function () {
    window.location.href = `/crud`;
  });

  await initAddToCartButtons();
})

window.addEventListener('load', () => {
  const clientTime = performance.now() - clientStart;
  const clientTimeElement = document.getElementById('client-time');
  if (clientTimeElement) {
    clientTimeElement.textContent = `Client render time: ${clientTime.toFixed(2)}ms`;
  }
});

async function me() {
  const res = await fetch('/api/users/me', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.userId || null;
}

async function fetchCartByUser(userId) {
  const res = await fetch(`/api/carts/user/${encodeURIComponent(userId)}`, {
    method: 'GET',
    credentials: 'include'
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`fetchCartByUser: ${res.status} ${res.statusText}`);
  return await res.json();
}

async function createCart(userId) {
  const res = await fetch('/api/carts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userId, items: [] })
  });
  if (!res.ok) throw new Error(`createCart: ${res.status} ${res.statusText}`);
  return await res.json();
}

async function getOrCreateCart(userId) {
  const cart = await fetchCartByUser(userId);
  if (cart) return cart;
  return await createCart(userId);
}

async function patchCartItemQuantity(itemId, newQty) {
  const res = await fetch(`/api/carts/items/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ quantity: newQty })
  });
  if (!res.ok) throw new Error(`patchCartItemQuantity: ${res.status} ${res.statusText}`);
  return await res.json();
}

async function postCartItem(cartId, dishId, qty = 1) {
  const res = await fetch(`/api/carts/${cartId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ dishId, quantity: qty })
  });
  if (!res.ok) throw new Error(`postCartItem: ${res.status} ${res.statusText}`);
  return await res.json();
}

function setButtonQtyText(btn, qty) {
  if (!btn) return;
  if (qty && qty > 0) {
    btn.textContent = `В корзине (${qty})`;
    btn.classList.add('in-cart');
    btn.setAttribute('data-qty', String(qty));
  } else {
    btn.textContent = 'Выбрать';
    btn.classList.remove('in-cart');
    btn.removeAttribute('data-qty');
  }
}

async function addItemToCartFromButton(dishId, btn) {
  const userId = await me();
  if (!userId) {
    toastr.error('Пожалуйста, войдите в аккаунт, чтобы добавлять в корзину');
    throw new Error('Unauthenticated');
  }

  const cart = await getOrCreateCart(userId);

  const items = cart.items || [];
  const existing = items.find(it => {
    return (it.dish && (it.dish.id === dishId || it.dish === dishId)) || (it.dishId && it.dishId === dishId);
  });

  if (existing) {
    const newQty = (existing.quantity || 0) + 1;
    const updatedItem = await patchCartItemQuantity(existing.id, newQty);
    setButtonQtyText(btn, updatedItem.quantity);
    return { type: 'patched', item: updatedItem, cartId: cart.id };
  } else {
    const updatedCart = await postCartItem(cart.id, dishId, 1);
    const newItem = (updatedCart.items || []).find(it => {
      return (it.dish && (it.dish.id === dishId || it.dish === dishId)) || (it.dishId && it.dishId === dishId);
    });
    const qty = newItem ? newItem.quantity : 1;
    setButtonQtyText(btn, qty);
    return { type: 'posted', item: newItem, cart: updatedCart };
  }
}

async function initAddToCartButtons() {
  const buttons = Array.from(document.querySelectorAll('.add-to-cart-btn'));
  if (!buttons.length) return;

  let userId = null;
  try { userId = await me(); } catch (e) { userId = null; }

  let cart = null;
  if (userId) {
    try {
      cart = await fetchCartByUser(userId);
    } catch (err) {
      console.warn('fetchCartByUser failed:', err);
      cart = null;
    }
  }

  buttons.forEach((btn) => {
    const card = btn.closest('.dish-card');
    const dishId = card?.getAttribute('data-id');

    if (cart && Array.isArray(cart.items)) {
      const found = cart.items.find(it => {
        return (it.dish && (it.dish.id === dishId || it.dish === dishId)) || (it.dishId && it.dishId === dishId);
      });
      if (found) setButtonQtyText(btn, found.quantity);
    }

    btn.addEventListener('click', async (e) => {
      const dishIdLocal = card?.getAttribute('data-id');
      if (!dishIdLocal) {
        toastr.error('Ошибка: не найден dishId');
        return;
      }
      btn.disabled = true;
      try {
        await addItemToCartFromButton(dishIdLocal, btn);
        toastr.success('Добавлено в корзину');
      } catch (err) {
        if (err.message !== 'Unauthenticated') {
          console.error('addItemToCart error', err);
          toastr.error('Не удалось добавить в корзину');
        }
      } finally {
        btn.disabled = false;
      }
    });
  });
}

async function refreshAddToCartButtons() {
  const buttons = Array.from(document.querySelectorAll('.add-to-cart-btn'));
  if (!buttons.length) return;

  let userId = null;
  try { userId = await me(); } catch (e) { userId = null; }

  if (!userId) {
    buttons.forEach((btn) => {
      setButtonQtyText(btn, 0);
    })
    return;
  }

  let cart = null;
  try {
    cart = await fetchCartByUser(userId);
  } catch (err) {
    console.warn('fetchCartByUser failed:', err);
    cart = null;
  }

  buttons.forEach((btn) => {
    const card = btn.closest('.dish-card');
    const dishId = card?.getAttribute('data-id');

    if (cart && Array.isArray(cart.items)) {
      const found = cart.items.find(it => {
        return (it.dish && (it.dish.id === dishId || it.dish === dishId)) || (it.dishId && it.dishId === dishId);
      });
      if (found) setButtonQtyText(btn, found.quantity);
    }
  })
}