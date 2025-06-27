let allProducts = [];
let selectedCategory = 'alle';

document.addEventListener('DOMContentLoaded', () => {
  const isProductPage = window.location.pathname.endsWith('/product.html') || window.location.pathname.includes('/product.html');
  const searchInput = document.querySelector('.catalog--search__input');
  const toggleBtn = document.getElementById('themeToggleBtn');
  const background = document.querySelector('.web--background');

  function applyTheme(isDark) {
    background?.classList.toggle('dark-mode', isDark);
    if (toggleBtn) toggleBtn.textContent = isDark ? 'LIGHT' : 'DARK';
  }

  const storedTheme = localStorage.getItem('theme');
  applyTheme(storedTheme === 'dark');

  toggleBtn?.addEventListener('click', () => {
    const currentlyDark = background?.classList.contains('dark-mode');
    const newTheme = !currentlyDark;
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    applyTheme(newTheme);
  });

  function createProductTile(product) {
    const tile = document.createElement('div');
    tile.className = 'product--tile';
    tile.setAttribute('data-type', product.type);
    tile.setAttribute('data-id', product.id);
    tile.innerHTML = `
      <div class="product--image">
        <img src="/M4BO/img/${product.image}" alt="${product.title}">
      </div>
      <div class="product--info">
        <h3 class="product--title">${product.title}</h3>
        <p class="product--price">€${product.price.toFixed(2)}</p>
        <div class="product--quantity">
          <div class="quantity--controls">
            <button class="quantity--btn minus">−</button>
            <input type="number" class="quantity--input" min="1" value="1">
            <button class="quantity--btn plus">+</button>
          </div>
          <button class="product--buy-button"><i class="fa-solid fa-cart-shopping"></i></button>
        </div>
      </div>
    `;
    tile.addEventListener('click', e => {
      if (!e.target.closest('button') && e.target.tagName !== 'INPUT') {
        window.location.href = `product.html?id=${product.id}`;
      }
    });
    return tile;
  }

  function displayFilteredProducts() {
    const query = searchInput?.value.toLowerCase() || '';
    const maxPrice = parseFloat(document.getElementById('priceSlider')?.value || 200);
    const sortToggle = document.getElementById('sortToggle');
    const sortAsc = sortToggle?.classList.contains('active');
    let filtered = allProducts.filter(p =>
      p.title.toLowerCase().includes(query) &&
      p.price <= maxPrice &&
      (selectedCategory === 'alle' || p.type.toLowerCase() === selectedCategory)
    );
    filtered.sort((a, b) => sortAsc ? b.price - a.price : a.price - b.price);
    const container = document.querySelector('.product--container');
    if (!container) return;
    container.innerHTML = '';
    filtered.forEach(product => container.appendChild(createProductTile(product)));
    setupQuantityControls();
    document.querySelectorAll('.product--buy-button').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const tile = btn.closest('.product--tile');
        const id = parseInt(tile.getAttribute('data-id'));
        const qty = parseInt(tile.querySelector('.quantity--input').value);
        const title = tile.querySelector('.product--title').textContent;
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find(item => item.id === id);
        if (existing) existing.quantity = Math.min(10, existing.quantity + qty);
        else cart.push({ id, quantity: qty });
        localStorage.setItem('cart', JSON.stringify(cart));
        showAddToCartNotification(title);
      });
    });
  }

  function setupQuantityControls() {
    document.querySelectorAll('.product--tile').forEach(tile => {
      const minusBtn = tile.querySelector('.quantity--btn.minus');
      const plusBtn = tile.querySelector('.quantity--btn.plus');
      const input = tile.querySelector('.quantity--input');
      const productId = tile.getAttribute('data-id');
      if (!minusBtn || !plusBtn || !input || !productId) return;
      const storedQty = localStorage.getItem(`productQty_${productId}`);
      if (storedQty) input.value = storedQty;
      const updateQty = val => {
        const clamped = Math.max(1, Math.min(10, val));
        input.value = clamped;
        localStorage.setItem(`productQty_${productId}`, clamped);
      };
      minusBtn.addEventListener('click', e => { e.stopPropagation(); updateQty(parseInt(input.value) - 1); });
      plusBtn.addEventListener('click', e => { e.stopPropagation(); updateQty(parseInt(input.value) + 1); });
      input.addEventListener('input', () => updateQty(parseInt(input.value)));
      input.addEventListener('click', e => e.stopPropagation());
    });
  }

  function setupCategoryFilter() {
    document.querySelectorAll('.sidebar--button').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.sidebar--button').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        selectedCategory = button.textContent.trim().toLowerCase();
        displayFilteredProducts();
      });
    });
  }

  function setupSearch() {
    if (!searchInput) return;
    searchInput.addEventListener('input', displayFilteredProducts);
    searchInput.addEventListener('keydown', e => {
      if (e.key === "Enter") {
        e.preventDefault();
        searchInput.blur();
      }
    });
  }

  function setupPriceFilter() {
    const slider = document.getElementById('priceSlider');
    const value = document.getElementById('priceValue');
    if (!slider || !value) return;
    slider.addEventListener('input', () => { value.value = slider.value; displayFilteredProducts(); });
    value.addEventListener('input', () => {
      const val = Math.min(200, Math.max(0, parseFloat(value.value) || 0));
      slider.value = val;
      value.value = val;
      displayFilteredProducts();
    });
    value.addEventListener('keydown', e => { if (e.key === 'Enter') value.blur(); });
  }

  function scrollToCatalog() {
    const catalog = document.querySelector('.web--catalog');
    if (catalog) {
      const offset = -50;
      const top = catalog.getBoundingClientRect().top + window.pageYOffset + offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
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

  document.getElementById('footerProductButton')?.addEventListener('click', () => {
    const path = location.pathname;
    const isHome = path.endsWith('/M4BO/') || path.endsWith('/M4BO/index.html');
    if (isHome) scrollToCatalog();
    else window.location.href = '/M4BO/index.html#scrollToCatalog';
  });

  document.getElementById('footerShoppingcartButton')?.addEventListener('click', () => {
    if (!window.location.pathname.endsWith('/M4BO/winkelwagen.html')) {
      window.location.href = '/M4BO/winkelwagen.html';
    }
  });

  document.getElementById('footerHomeButton')?.addEventListener('click', () => {
    const path = window.location.pathname;
    const isHome = path.endsWith('/M4BO/') || path.endsWith('/M4BO/index.html');
    if (!isHome) window.location.href = '/M4BO/index.html';
  });

  document.getElementById("sortToggle")?.addEventListener("click", () => {
    const btn = document.getElementById("sortToggle");
    btn.classList.toggle("active");
    localStorage.setItem("sortActive", btn.classList.contains("active"));
    displayFilteredProducts();
  });

  const sortButton = document.getElementById("sortToggle");
  if (sortButton && localStorage.getItem("sortActive") === "true") sortButton.classList.add("active");

  document.getElementById('productButton')?.addEventListener('click', () => {
    const isHome = location.pathname.endsWith('/M4BO/') || location.pathname.endsWith('/M4BO/index.html');
    if (isHome) scrollToCatalog();
    else window.location.href = '/M4BO/index.html#scrollToCatalog';
  });

  document.getElementById('shoppingCartButton')?.addEventListener('click', () => {
    const isHome = location.pathname.endsWith('/M4BO/') || location.pathname.endsWith('/M4BO/winkelwagen.html');
    if (isHome) return;
    else window.location.href = '/M4BO/winkelwagen.html';
  });

  if (window.location.hash === '#scrollToCatalog') setTimeout(scrollToCatalog, 200);

  const sidebarToggle = document.querySelector('.sidebar--title--button');
  const sidebar = document.querySelector('.sidebar');
  if (sidebarToggle && sidebar) {
    if (localStorage.getItem('sidebarExpanded') === 'true') {
      sidebarToggle.classList.add('active');
      sidebar.classList.add('expanded');
    }
    sidebarToggle.addEventListener('click', () => {
      const expanded = sidebar.classList.toggle('expanded');
      sidebarToggle.classList.toggle('active', expanded);
      localStorage.setItem('sidebarExpanded', expanded);
    });
  }

  fetch('/M4BO/data/products.json')
    .then(res => res.json())
    .then(data => {
      allProducts = data;
      displayFilteredProducts();
      setupSearch();
      setupPriceFilter();
      setupCategoryFilter();
    });
});

document.addEventListener('scroll', () => {
  const container = document.querySelector('.static--image-container');
  const image = container?.querySelector('.static--image');
  if (!image) return;
  const rect = container.getBoundingClientRect();
  const progress = Math.min(Math.max(0, -rect.top / 150), 1);
  image.style.transform = `translateY(-${progress * 49}px)`;
});
