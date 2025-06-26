document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const toggleBtn = document.getElementById('themeToggleBtn');
    const cartContainer = document.querySelector('.cart--container');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const clearBtn = document.getElementById('clearCartBtn');

    function applyTheme(isDark) {
        body.classList.toggle('dark-mode', isDark);
        if (toggleBtn) toggleBtn.textContent = isDark ? 'LIGHT' : 'DARK';
    }

    const savedTheme = localStorage.getItem('theme');
    applyTheme(savedTheme === 'dark');

    toggleBtn?.addEventListener('click', () => {
        const isDark = !body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        applyTheme(isDark);
    });

    fetch('/data/products.json')
        .then(res => res.json())
        .then(products => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (!cart.length) {
                cartContainer.innerHTML = '<p style="color: white; text-align: center;">Je winkelwagen is leeg.</p>';
                return;
            }

            let total = 0;

            cart.forEach(item => {
                const product = products.find(p => p.id === item.id);
                if (!product) return;

                const subtotal = product.price * item.quantity;
                total += subtotal;

                const cartItem = document.createElement('div');
                cartItem.className = 'cart--item';
                cartItem.innerHTML = `
          <img src="img/${product.image}" alt="${product.title}" class="cart--item-image">
          <div class="cart--item-info">
            <h3 class="cart--item-title">${product.title}</h3>
            <p class="cart--item-price">Prijs: €${product.price.toFixed(2)}</p>
            <p class="cart--item-quantity">Aantal: ${item.quantity}</p>
            <p class="cart--item-subtotal">Subtotaal: €${subtotal.toFixed(2)}</p>
          </div>
        `;
                cartContainer.appendChild(cartItem);
            });

            cartTotal.textContent = total.toFixed(2);
        });

    checkoutBtn?.addEventListener('click', () => alert('ok'));
    clearBtn?.addEventListener('click', () => {
        localStorage.removeItem('cart');
        location.reload();
    });
});