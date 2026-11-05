// E-Commerce Cart Engine for NutriAgro Feeds (Exclusively Indian Rupee ₹ INR)
// Features Strict Account-Scoped Cart Isolation: Each customer and guest gets an isolated cart session.
class CartManager {
  constructor() {
    this.legacyStorageKey = 'nutriagro_livestock_cart_v1';
    this.promoCodes = {
      'NUTRI10': { discountPercent: 10, label: '10% NutriAgro Welcome Promo' },
      'FARMFRESH10': { discountPercent: 10, label: '10% Farmgate Harvest Promo' },
      'BULKHERD15': { discountPercent: 15, label: '15% Commercial Herd Discount (Min 20 Bags)' },
      'AGROVIP': { discountPercent: 12, label: '12% Verified Farmer Loyalty' }
    };
    this.appliedPromo = null;

    // Exclusively Indian Rupee (INR)
    try {
      localStorage.removeItem('nutriagro_currency');
    } catch (e) {}

    // 1. One-time clean-slate migration: Purge all legacy contaminated cart keys so all accounts start 100% clean
    this.cleanSlateMigrationIfNeeded();

    this.currency = '₹';
    this.activeStorageKey = this.getUserStorageKey();
    this.items = this.loadCart();
    this.initEventListeners();
    this.updateUI();
    this.checkAndNotifyRestoredCart();
  }

  // Purge any old cross-contaminated cart keys left behind by older versions
  cleanSlateMigrationIfNeeded() {
    try {
      const cleanSlateKey = 'nutriagro_cart_isolated_v4';
      if (!localStorage.getItem(cleanSlateKey)) {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('nutriagro_cart_') || k === this.legacyStorageKey)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        localStorage.setItem(cleanSlateKey, '1');
      }
    } catch (e) {}
  }

  // Subtle Cart Expiration & Restoration Notification
  checkAndNotifyRestoredCart(user = null) {
    const u = user || this.getCurrentUser();
    if (!u || !this.items || this.items.length === 0) return;

    const sessionKey = `nutriagro_cart_restored_${this.activeStorageKey}`;
    try {
      if (sessionStorage.getItem(sessionKey)) return;
      sessionStorage.setItem(sessionKey, '1');
    } catch (e) {}

    const rawName = u.fullName || u.name || (u.email ? u.email.split('@')[0] : 'Farmer');
    const firstName = rawName.trim().split(' ')[0] || 'Farmer';
    const count = this.items.length;
    const totalBags = this.getTotalBags();

    setTimeout(() => {
      this.showToast(
        `<span>Welcome back, <strong>${firstName}</strong>! We restored ${count} item${count > 1 ? 's' : ''} from your previous cart.</span>` +
        `<button type="button" class="toast-view-cart-btn" onclick="cart.openDrawer()">View Cart (${totalBags})</button>`,
        'success'
      );
    }, 700);
  }

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('nutriagro_user') || 'null');
    } catch (e) {
      return null;
    }
  }

  // Stable, permanent storage key:
  // Email is the immutable anchor of customer identity. It never changes across logins/logouts!
  getUserStorageKey(user = undefined) {
    const u = user !== undefined ? user : this.getCurrentUser();
    if (u) {
      // 1. Primary: Immutable Normalized Email
      if (u.email && typeof u.email === 'string' && u.email.trim()) {
        const cleanEmail = u.email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
        return `nutriagro_cart_email_${cleanEmail}`;
      }
      // 2. Secondary: Normalized 10-digit Phone
      if (u.phone && typeof u.phone === 'string' && u.phone.trim()) {
        const cleanPhone = u.phone.replace(/\D/g, '');
        if (cleanPhone.length >= 10) {
          return `nutriagro_cart_phone_${cleanPhone.slice(-10)}`;
        }
      }
      // 3. Tertiary: Fixed User ID
      if (u.userId) {
        return `nutriagro_cart_uid_${u.userId.toString().replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      }
    }
    return 'nutriagro_cart_guest';
  }

  loadCart(user = undefined) {
    try {
      const key = this.getUserStorageKey(user);
      const data = localStorage.getItem(key);
      let loaded = data ? JSON.parse(data) : null;

      // If local storage is empty, check if cloud user has a saved cart
      if ((!loaded || !Array.isArray(loaded) || loaded.length === 0) && user && user.cart && Array.isArray(user.cart)) {
        loaded = user.cart;
        try {
          localStorage.setItem(key, JSON.stringify(loaded));
        } catch (e) {}
      }

      if (!loaded || !Array.isArray(loaded)) {
        return [];
      }

      // Synchronize price with standard INR price
      loaded.forEach(item => {
        if (typeof getProductPrice === 'function') {
          item.price = getProductPrice(item.productId, item.bagSize);
        }
      });
      return loaded;
    } catch (e) {
      console.error('Error loading cart:', e);
      return [];
    }
  }

  saveCart() {
    try {
      const key = this.activeStorageKey || this.getUserStorageKey();
      localStorage.setItem(key, JSON.stringify(this.items));

      // Asynchronously sync cart to cloud profile for authenticated users
      const u = this.getCurrentUser();
      if (u && (u.email || u.userId || u.phone)) {
        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_cart',
            email: u.email,
            userId: u.userId,
            phone: u.phone,
            cart: this.items
          })
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Error saving cart:', e);
    }
    this.updateUI();
  }

  switchUser(newUser, options = { mergeGuestCart: false }) {
    const previousKey = this.activeStorageKey || 'nutriagro_cart_guest';
    const nextKey = this.getUserStorageKey(newUser);

    // Only merge guest cart IF explicitly requested AND guest explicitly added items in this session
    const hasExplicitGuestItems = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('nutriagro_guest_explicit_cart') === '1';
    if (options && options.mergeGuestCart && hasExplicitGuestItems && previousKey === 'nutriagro_cart_guest' && nextKey !== 'nutriagro_cart_guest') {
      try {
        const guestData = localStorage.getItem('nutriagro_cart_guest');
        const guestItems = guestData ? JSON.parse(guestData) : [];
        if (Array.isArray(guestItems) && guestItems.length > 0) {
          const targetData = localStorage.getItem(nextKey);
          let targetItems = targetData ? JSON.parse(targetData) : [];
          if (!Array.isArray(targetItems)) targetItems = [];

          guestItems.forEach(gItem => {
            const existIdx = targetItems.findIndex(t => t.itemKey === gItem.itemKey);
            if (existIdx > -1) {
              targetItems[existIdx].quantity += (gItem.quantity || 1);
            } else {
              targetItems.push(gItem);
            }
          });

          localStorage.setItem(nextKey, JSON.stringify(targetItems));
          localStorage.removeItem('nutriagro_cart_guest');
          sessionStorage.removeItem('nutriagro_guest_explicit_cart');
        }
      } catch (e) {
        console.warn('Cart merge notice:', e);
      }
    }

    // Update active storage key
    this.activeStorageKey = nextKey;

    if (!newUser) {
      // Signed out: Immediately unload screen cart to empty
      this.items = [];
    } else {
      // Load active items for the authenticated account
      this.items = this.loadCart(newUser);
    }

    this.appliedPromo = null; // Reset promo for new session
    this.updateUI();

    // Subtle Cart Restoration Notice when account logs in with existing items
    if (newUser && this.items.length > 0) {
      try {
        sessionStorage.removeItem(`nutriagro_cart_restored_${this.activeStorageKey}`);
      } catch (e) {}
      this.checkAndNotifyRestoredCart(newUser);
    }
  }

  switchCurrency(newCurrency) {
    // Exclusively INR
    this.currency = '₹';
    this.updateUI();
  }

  addItem(productId, bagSize = '50kg', quantity = 1) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return false;

    // Explicit user action: record that items were added in this session
    if (!this.getCurrentUser() && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('nutriagro_guest_explicit_cart', '1');
    }

    quantity = parseInt(quantity, 10);
    if (isNaN(quantity) || quantity < 1) quantity = 1;

    const price = getProductPrice(productId, bagSize, currentCurrency);
    const itemKey = `${productId}_${bagSize}`;
    
    const existingIndex = this.items.findIndex(item => item.itemKey === itemKey);

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        itemKey,
        productId,
        name: product.name,
        category: product.category,
        categoryLabel: product.categoryLabel,
        image: product.image,
        bagSize,
        price,
        weightKg: bagSize === '25kg' ? 25 : 50,
        quantity
      });
    }

    this.saveCart();

    // Trigger bounce animation on Cart header button
    this.triggerCartBounce();

    // Show sleek toast with quick View Cart button
    const totalBags = this.getTotalBags();
    this.showToast(
      `<span>✓ Added ${quantity} × <strong>${product.name}</strong> (${bagSize})</span>` +
      `<button type="button" class="toast-view-cart-btn" onclick="cart.openDrawer()">View Cart (${totalBags})</button>`,
      'success'
    );

    // Keep drawer closed so user shopping is uninterrupted
    return true;
  }

  triggerCartBounce() {
    const cartBtns = document.querySelectorAll('#headerCartBtn, .header-cart-btn');
    cartBtns.forEach(btn => {
      btn.classList.remove('cart-bounce-animate');
      void btn.offsetWidth; // Reflow
      btn.classList.add('cart-bounce-animate');
    });
  }

  updateQuantity(itemKey, newQuantity) {
    const item = this.items.find(i => i.itemKey === itemKey);
    if (!item) return;

    newQuantity = parseInt(newQuantity, 10);
    if (newQuantity <= 0) {
      this.removeItem(itemKey);
    } else {
      item.quantity = newQuantity;
      this.saveCart();
    }
  }

  removeItem(itemKey) {
    const item = this.items.find(i => i.itemKey === itemKey);
    this.items = this.items.filter(i => i.itemKey !== itemKey);
    this.saveCart();
    if (item) {
      this.showToast(`Removed ${item.name} from cart`, 'info');
    }
  }

  clearCart() {
    this.items = [];
    this.appliedPromo = null;
    this.saveCart();
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('nutriagro_guest_explicit_cart');
    }
    this.showToast('Your cart has been cleared.', 'info');
  }

  getTotalBags() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotalWeightKg() {
    return this.items.reduce((sum, item) => sum + (item.weightKg * item.quantity), 0);
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getVolumeDiscount() {
    const totalBags = this.getTotalBags();
    const subtotal = this.getSubtotal();
    
    // Tiered bulk commercial discount:
    // 10+ bags = 5% off
    // 25+ bags = 10% off
    // 50+ bags = 15% off (Tonnage bulk order)
    if (totalBags >= 50) return { percent: 15, amount: subtotal * 0.15, label: '15% Commercial Tonnage Rate' };
    if (totalBags >= 25) return { percent: 10, amount: subtotal * 0.10, label: '10% Large Herd Farmgate Rate' };
    if (totalBags >= 10) return { percent: 5, amount: subtotal * 0.05, label: '5% Multi-Bag Discount' };
    return { percent: 0, amount: 0, label: 'No volume discount yet' };
  }

  getPromoDiscount() {
    if (!this.appliedPromo) return { percent: 0, amount: 0, label: '' };
    const subtotal = this.getSubtotal();
    return {
      percent: this.appliedPromo.discountPercent,
      amount: subtotal * (this.appliedPromo.discountPercent / 100),
      label: this.appliedPromo.label
    };
  }

  getShippingFee() {
    const totalBags = this.getTotalBags();
    const subtotal = this.getSubtotal();
    const conf = CURRENCY_CONFIG[currentCurrency];

    if (totalBags === 0) return 0;
    // Free freight on orders over threshold or over 15 bags
    if (subtotal >= conf.freeShippingThreshold || totalBags >= conf.freeShippingBags) {
      return 0; // Free Freight
    }
    return conf.shippingFee;
  }

  getFinalTotal() {
    const subtotal = this.getSubtotal();
    const volumeDisc = this.getVolumeDiscount().amount;
    const promoDisc = this.getPromoDiscount().amount;
    const shipping = this.getShippingFee();
    
    const bestDiscount = Math.max(volumeDisc, promoDisc);
    const finalTotal = Math.max(0, subtotal - bestDiscount + shipping);
    return finalTotal;
  }

  applyPromoCode(code) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) return { success: false, message: 'Please enter a promo code' };

    const promo = this.promoCodes[cleanCode];
    if (!promo) {
      return { success: false, message: 'Invalid or expired promo coupon' };
    }

    if (cleanCode === 'BULKHERD15' && this.getTotalBags() < 20) {
      return { success: false, message: 'BULKHERD15 requires a minimum of 20 feed bags' };
    }

    this.appliedPromo = promo;
    this.updateUI();
    return { success: true, message: `Promo applied: ${promo.label}` };
  }

  removePromo() {
    this.appliedPromo = null;
    this.updateUI();
  }

  openDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer && overlay) {
      drawer.classList.add('active');
      overlay.classList.add('active');
      document.body.classList.add('modal-open');
    }
  }

  closeDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer && overlay) {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
      document.body.classList.remove('modal-open');
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-text">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  updateUI() {
    this.currency = '₹';

    // 1. Update Cart Badge Count
    const totalBags = this.getTotalBags();
    const countBadges = document.querySelectorAll('.cart-count-badge');
    countBadges.forEach(b => {
      b.textContent = totalBags;
      b.style.display = totalBags > 0 ? 'inline-flex' : 'none';
    });

    // Toggle 1-Tap "Clear All" button in drawer header
    const clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) {
      clearBtn.style.display = this.items.length > 0 ? 'inline-block' : 'none';
    }

    // 2. Update Header Subtotal Preview
    const headerTotals = document.querySelectorAll('.cart-header-total');
    headerTotals.forEach(el => {
      el.textContent = formatCurrency(this.getFinalTotal());
    });

    // 3. Render Cart Drawer Items
    const itemsContainer = document.getElementById('cartItemsList');
    const emptyState = document.getElementById('cartEmptyState');
    const footerContainer = document.getElementById('cartFooter');
    
    if (itemsContainer) {
      if (this.items.length === 0) {
        itemsContainer.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
        if (footerContainer) footerContainer.style.display = 'none';
      } else {
        if (emptyState) emptyState.style.display = 'none';
        if (footerContainer) footerContainer.style.display = 'block';

        itemsContainer.innerHTML = this.items.map(item => `
          <div class="cart-item" data-key="${item.itemKey}">
            <div class="cart-item-img-wrap">
              <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
              <span class="cart-item-size-tag">${item.bagSize}</span>
            </div>
            <div class="cart-item-info">
              <h4 class="cart-item-title">${item.name}</h4>
              <div class="cart-item-meta">
                <span class="cart-item-price">${formatCurrency(item.price)} / bag</span>
                <span class="cart-item-subtotal">${formatCurrency(item.price * item.quantity)}</span>
              </div>
              <div class="cart-item-actions">
                <div class="qty-stepper">
                  <button type="button" class="qty-btn" onclick="cart.updateQuantity('${item.itemKey}', ${item.quantity - 1})">−</button>
                  <input type="number" class="qty-input" value="${item.quantity}" min="1" max="500" 
                    onchange="cart.updateQuantity('${item.itemKey}', this.value)" />
                  <button type="button" class="qty-btn" onclick="cart.updateQuantity('${item.itemKey}', ${item.quantity + 1})">+</button>
                </div>
                <button type="button" class="cart-item-remove-btn" onclick="cart.removeItem('${item.itemKey}')" title="Remove item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                </button>
              </div>
            </div>
          </div>
        `).join('');
      }
    }

    // 4. Update Discount Progress Bar & Summary
    const progressFill = document.getElementById('freightProgressFill');
    const progressText = document.getElementById('freightProgressText');
    if (progressFill && progressText) {
      const freeShippingThreshold = CURRENCY_CONFIG[currentCurrency].freeShippingBags;
      const pct = Math.min(100, Math.round((totalBags / freeShippingThreshold) * 100));
      progressFill.style.width = `${pct}%`;
      if (totalBags >= freeShippingThreshold) {
        progressText.innerHTML = `🎉 <strong>Eligible for Free Farmgate Freight Delivery!</strong>`;
      } else {
        const remaining = freeShippingThreshold - totalBags;
        progressText.innerHTML = `Add <strong>${remaining} more bag${remaining > 1 ? 's' : ''}</strong> for <strong>Free Farmgate Freight</strong>`;
      }
    }

    // 5. Update Financial Figures
    const subtotalEl = document.getElementById('cartSubtotalAmount');
    const discountEl = document.getElementById('cartDiscountAmount');
    const discountRow = document.getElementById('cartDiscountRow');
    const discountLabel = document.getElementById('cartDiscountLabel');
    const shippingEl = document.getElementById('cartShippingAmount');
    const totalWeightEl = document.getElementById('cartTotalWeight');
    const totalEl = document.getElementById('cartTotalAmount');

    const subtotal = this.getSubtotal();
    const volumeDisc = this.getVolumeDiscount();
    const promoDisc = this.getPromoDiscount();
    const activeDiscount = promoDisc.amount > volumeDisc.amount ? promoDisc : volumeDisc;
    const shipping = this.getShippingFee();
    const weightKg = this.getTotalWeightKg();
    const finalTotal = this.getFinalTotal();

    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
    if (totalWeightEl) {
      const weightText = weightKg >= 1000 ? `${(weightKg / 1000).toFixed(2)} MT (${weightKg} kg)` : `${weightKg} kg`;
      totalWeightEl.textContent = weightText;
    }

    if (discountRow) {
      if (activeDiscount.amount > 0) {
        discountRow.style.display = 'flex';
        if (discountLabel) discountLabel.textContent = activeDiscount.label;
        if (discountEl) discountEl.textContent = `-${formatCurrency(activeDiscount.amount)}`;
      } else {
        discountRow.style.display = 'none';
      }
    }

    if (shippingEl) {
      shippingEl.textContent = shipping === 0 ? 'FREE' : formatCurrency(shipping);
      if (shipping === 0) shippingEl.classList.add('text-success');
      else shippingEl.classList.remove('text-success');
    }

    if (totalEl) totalEl.textContent = formatCurrency(finalTotal);
  }

  initEventListeners() {
    // Cart open button
    document.querySelectorAll('[data-action="open-cart"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer();
      });
    });

    // Cart close button & overlay
    const closeBtn = document.getElementById('closeCartBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeDrawer());

    const overlay = document.getElementById('cartOverlay');
    if (overlay) overlay.addEventListener('click', () => this.closeDrawer());

    // Promo code apply
    const promoForm = document.getElementById('cartPromoForm');
    if (promoForm) {
      promoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('cartPromoInput');
        if (!input) return;
        const res = this.applyPromoCode(input.value);
        this.showToast(res.message, res.success ? 'success' : 'error');
        if (res.success) input.value = '';
      });
    }

    // Checkout modal trigger
    const checkoutBtn = document.getElementById('proceedToCheckoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (this.items.length === 0) {
          this.showToast('Your cart is empty', 'error');
          return;
        }
        this.closeDrawer();
        openCheckoutModal();
      });
    }
  }
}

// Global instance
let cart;
document.addEventListener('DOMContentLoaded', () => {
  cart = new CartManager();
  window.cart = cart;
});
