document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get('id'));
  if (!productId) return;

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const background = document.querySelector('.product-detail-page');
  const savedTheme = localStorage.getItem('theme');
  applyTheme(savedTheme === 'dark');

  themeToggleBtn?.addEventListener('click', () => {
    const isDark = background?.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    applyTheme(!isDark);
  });

  function applyTheme(isDark) {
    if (!background) return;
    background.classList.toggle('dark-mode', isDark);
    themeToggleBtn.textContent = isDark ? 'LIGHT' : 'DARK';
  }

  fetch('/data/products.json')
    .then(res => res.json())
    .then(products => {
      const product = products.find(p => p.id === productId);
      if (!product) return;
      displayProductDetails(product);
      displayRelatedProducts(product, products);
    });

  function displayProductDetails(product) {
    const container = document.querySelector('.product--detail');
    if (!container) return;

    container.innerHTML = `
      <div class="product--image-container">
        <div class="product--image-box">
          <img src="/img/${product.image}" class="product--image-full" />
        </div>
      </div>
      <div class="product--info-detail">
        <h1 class="product--title">${product.title}</h1>
        <p class="product--price">€${product.price.toFixed(2)}</p>
        <p class="product--description">${product.description}</p>
        <div class="product--quantity">
          <div class="quantity--controls">
            <button class="quantity--btn minus">−</button>
            <input type="number" class="quantity--input" min="1" max="10" value="1">
            <button class="quantity--btn plus">+</button>
          </div>
          <button class="product--buy-button"><i class="fa-solid fa-cart-shopping"></i></button>
        </div>
      </div>
    `;

    const minusBtn = container.querySelector('.quantity--btn.minus');
    const plusBtn = container.querySelector('.quantity--btn.plus');
    const quantityInput = container.querySelector('.quantity--input');
    const cartButton = container.querySelector('.product--buy-button');

    minusBtn.addEventListener('click', e => {
      e.stopPropagation();
      quantityInput.value = Math.max(1, parseInt(quantityInput.value) - 1);
    });

    plusBtn.addEventListener('click', e => {
      e.stopPropagation();
      quantityInput.value = Math.min(10, parseInt(quantityInput.value) + 1);
    });

    cartButton.addEventListener('click', e => {
      e.stopPropagation();
      const quantity = parseInt(quantityInput.value);
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingItem = cart.find(item => item.id === product.id);
      if (existingItem) existingItem.quantity = Math.min(10, existingItem.quantity + quantity);
      else cart.push({ id: product.id, quantity });
      localStorage.setItem('cart', JSON.stringify(cart));
      showAddToCartNotification(product.title);
    });
  }

  function displayRelatedProducts(current, products) {
    const container = document.querySelector('.product--related .product--container');
    if (!container) return;

    const related = products
      .filter(p => p.id !== current.id && p.type.trim().toLowerCase() === current.type.trim().toLowerCase())
      .slice(0, 3);

    container.innerHTML = '';
    related.forEach(p => {
      const tile = document.createElement('div');
      tile.className = 'product--tile';
      tile.innerHTML = `
        <div class="product--image">
          <img src="/img/${p.image}" alt="${p.title}">
        </div>
        <div class="product--info">
          <h3 class="product--title">${p.title}</h3>
          <p class="product--price">€${p.price.toFixed(2)}</p>
          <div class="product--quantity">
            <div class="quantity--controls">
              <button class="quantity--btn minus">−</button>
              <input type="number" class="quantity--input" min="1" max="10" value="1">
              <button class="quantity--btn plus">+</button>
            </div>
            <button class="product--buy-button" data-id="${p.id}"><i class="fa-solid fa-cart-shopping"></i></button>
          </div>
        </div>
      `;

      tile.addEventListener('click', e => {
        if (!e.target.closest('button') && e.target.tagName !== 'INPUT') {
          window.location.href = `product.html?id=${p.id}`;
        }
      });

      const minus = tile.querySelector('.minus');
      const plus = tile.querySelector('.plus');
      const input = tile.querySelector('.quantity--input');
      const buyBtn = tile.querySelector('.product--buy-button');

      minus.addEventListener('click', e => {
        e.stopPropagation();
        input.value = Math.max(1, parseInt(input.value) - 1);
      });

      plus.addEventListener('click', e => {
        e.stopPropagation();
        input.value = Math.min(10, parseInt(input.value) + 1);
      });

      input.addEventListener('click', e => e.stopPropagation());

      buyBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const id = parseInt(buyBtn.getAttribute('data-id'));
        const quantity = parseInt(input.value);
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find(item => item.id === id);
        if (existing) existing.quantity = Math.min(10, existing.quantity + quantity);
        else cart.push({ id, quantity });
        localStorage.setItem('cart', JSON.stringify(cart));
        showAddToCartNotification(p.title);
      });

      container.appendChild(tile);
    });
  }

  function showAddToCartNotification(productName) {
    const existing = document.querySelector('.cart--notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'cart--notification';
    notification.textContent = `${productName} toegevoegd aan je winkelwagen.`;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('visible'), 10);
    setTimeout(() => {
      notification.classList.remove('visible');
      setTimeout(() => notification.remove(), 300);
    }, 2500);
  }

  document.getElementById('footerShoppingcartButton')?.addEventListener('click', () => {
    if (!window.location.pathname.endsWith('winkelwagen.html')) {
      window.location.href = '/winkelwagen.html';
    }
  });

  document.getElementById('shoppingCartButton')?.addEventListener('click', () => {
    if (!window.location.pathname.endsWith('winkelwagen.html')) {
      window.location.href = '/winkelwagen.html';
    }
  });
});
