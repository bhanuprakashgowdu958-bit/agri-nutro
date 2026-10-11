// Main Application Controller: Catalog Filtering, Search, Micro-Interactions, Comparison & Dealer Locator
let currentCategory = 'all';
let searchQuery = '';
let currentSort = 'featured';

// Store card bag size selections
const cardSelectedSizes = {};

// Feed Comparison State
let selectedCompareProducts = [];

function initCatalog() {
  renderCatalog();
  setupFilterTabs();
  setupSearch();
  setupSort();
  setupFAQAccordion();
  setupGlobalModals();
  renderDealers();
  setupDealerSearch();
  setupWhatsAppWidget();
}

function renderCatalog() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  // Filter
  let filtered = PRODUCTS_DATA.filter(product => {
    const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery) ||
      product.categoryLabel.toLowerCase().includes(searchQuery) ||
      product.shortDesc.toLowerCase().includes(searchQuery) ||
      product.highlight.toLowerCase().includes(searchQuery);

    return matchesCategory && matchesSearch;
  });

  // Sort
  if (currentSort === 'protein-desc') {
    filtered.sort((a, b) => {
      const pA = parseFloat(a.nutritionalAnalysis.crudeProtein) || 0;
      const pB = parseFloat(b.nutritionalAnalysis.crudeProtein) || 0;
      return pB - pA;
    });
  } else if (currentSort === 'price-asc') {
    filtered.sort((a, b) => getProductPrice(a.id, '50kg', currentCurrency) - getProductPrice(b.id, '50kg', currentCurrency));
  } else if (currentSort === 'price-desc') {
    filtered.sort((a, b) => getProductPrice(b.id, '50kg', currentCurrency) - getProductPrice(a.id, '50kg', currentCurrency));
  } else if (currentSort === 'rating-desc') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  // Update results counter
  const counterEl = document.getElementById('catalogResultsCount');
  if (counterEl) {
    counterEl.textContent = `Showing ${filtered.length} commercial feed formula${filtered.length === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-catalog-state">
        <div class="empty-icon">🌾</div>
        <h3>No feed formulas found</h3>
        <p>No products matched your search "${searchQuery}". Try selecting another category or resetting filters.</p>
        <button class="btn btn-outline" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(product => {
    // Current selected bag size on this card
    const selectedSize = cardSelectedSizes[product.id] || '50kg';
    const currentPrice = getProductPrice(product.id, selectedSize, currentCurrency);
    const isComparing = selectedCompareProducts.includes(product.id);
    const formattedPrice = currentCurrency === 'INR' ? Math.round(currentPrice).toLocaleString('en-IN') : currentPrice.toFixed(2);

    return `
      <article class="product-card" data-id="${product.id}" data-category="${product.category}">
        <div class="product-card-badge-wrap">
          <span class="badge badge-brand">${product.badge}</span>
          <span class="badge badge-protein">${product.nutritionalAnalysis.crudeProtein} Protein</span>
        </div>

        <div class="product-card-img-wrap" onclick="openProductModal('${product.id}')" title="Click to view lab specs">
          <img src="${product.image}" alt="${product.name}" class="product-card-img" loading="lazy" />
          <div class="product-card-overlay-hint">
            <span>🔬 View Lab Specs</span>
          </div>
        </div>

        <div class="product-card-body">
          <div class="product-card-meta">
            <span class="category-pill">${product.categoryLabel}</span>
            <span class="form-tag">${product.form}</span>
            <button type="button" class="btn-compare-pill ${isComparing ? 'active' : ''}" 
              onclick="toggleCompareProduct('${product.id}')" title="Compare formulation">
              ${isComparing ? '✓ Comparing' : '+ Compare'}
            </button>
          </div>

          <h3 class="product-card-title" onclick="openProductModal('${product.id}')">${product.name}</h3>
          
          <div class="product-rating-row">
            <div class="stars-wrap">
              <span class="stars">★★★★★</span>
              <strong class="rating-val">${product.rating}</strong>
            </div>
            <span class="reviews-count">(${product.reviewsCount} verified farms)</span>
          </div>

          <p class="product-card-desc">${product.shortDesc}</p>

          <div class="product-card-bullets">
            <div class="bullet-item">
              <span class="bullet-dot"></span>
              <span><strong>Stage:</strong> ${product.stage}</span>
            </div>
            <div class="bullet-item">
              <span class="bullet-dot"></span>
              <span><strong>Key:</strong> ${product.highlight}</span>
            </div>
          </div>

          <!-- Bag Size Selector -->
          <div class="card-size-selector">
            <span class="size-label">Packaging:</span>
            <div class="size-options">
              <button type="button" class="size-btn ${selectedSize === '25kg' ? 'active' : ''}" 
                onclick="changeCardBagSize('${product.id}', '25kg')">25 kg Bag</button>
              <button type="button" class="size-btn ${selectedSize === '50kg' ? 'active' : ''}" 
                onclick="changeCardBagSize('${product.id}', '50kg')">50 kg Bag</button>
            </div>
          </div>

          <div class="product-card-footer">
            <div class="price-container">
              <span class="price-currency">${CURRENCY_CONFIG[currentCurrency].symbol}</span>
              <span class="price-number" id="cardPrice_${product.id}">${formattedPrice}</span>
              <span class="price-unit">/ bag</span>
            </div>

            <div class="card-cta-group">
              <button type="button" class="btn btn-primary btn-add-cart" 
                onclick="handleCardAddToCart('${product.id}', this)" title="Add to Order Cart">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
                <span>Add</span>
              </button>
              <button type="button" class="btn btn-subtle" onclick="openProductModal('${product.id}')" title="Nutritional Specs">
                Specs
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function changeCardBagSize(productId, size) {
  cardSelectedSizes[productId] = size;
  const priceEl = document.getElementById(`cardPrice_${productId}`);
  if (priceEl) {
    const newPrice = getProductPrice(productId, size, currentCurrency);
    priceEl.textContent = currentCurrency === 'INR' ? Math.round(newPrice).toLocaleString('en-IN') : newPrice.toFixed(2);
  }

  // Update button active state
  const card = document.querySelector(`.product-card[data-id="${productId}"]`);
  if (card) {
    const btns = card.querySelectorAll('.size-btn');
    btns.forEach(btn => {
      if (btn.textContent.includes(size)) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }
}

function handleCardAddToCart(productId, btnElement) {
  const size = cardSelectedSizes[productId] || '50kg';
  if (window.cart) {
    window.cart.addItem(productId, size, 1);
  }

  // Visual button feedback
  if (btnElement) {
    const originalContent = btnElement.innerHTML;
    btnElement.innerHTML = `<span>✓ Added!</span>`;
    btnElement.style.backgroundColor = '#10b981';
    btnElement.style.borderColor = '#10b981';
    btnElement.style.color = '#ffffff';
    btnElement.disabled = true;

    setTimeout(() => {
      btnElement.innerHTML = originalContent;
      btnElement.style.backgroundColor = '';
      btnElement.style.borderColor = '';
      btnElement.style.color = '';
      btnElement.disabled = false;
    }, 1100);
  }
}

function setupFilterTabs() {
  const tabs = document.querySelectorAll('.category-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.getAttribute('data-category');
      renderCatalog();
    });
  });
}

function setupSearch() {
  const searchInput = document.getElementById('catalogSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderCatalog();
    });
  }
}

function setupSort() {
  const sortSelect = document.getElementById('catalogSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderCatalog();
    });
  }
}

function resetFilters() {
  currentCategory = 'all';
  searchQuery = '';
  currentSort = 'featured';

  const searchInput = document.getElementById('catalogSearchInput');
  if (searchInput) searchInput.value = '';

  const sortSelect = document.getElementById('catalogSortSelect');
  if (sortSelect) sortSelect.value = 'featured';

  const tabs = document.querySelectorAll('.category-tab-btn');
  tabs.forEach(t => {
    if (t.getAttribute('data-category') === 'all') t.classList.add('active');
    else t.classList.remove('active');
  });

  renderCatalog();
}

function filterFromHero(category) {
  currentCategory = category;
  const tabs = document.querySelectorAll('.category-tab-btn');
  tabs.forEach(t => {
    if (t.getAttribute('data-category') === category) t.classList.add('active');
    else t.classList.remove('active');
  });

  const catalogSec = document.getElementById('productsSection');
  if (catalogSec) {
    catalogSec.scrollIntoView({ behavior: 'smooth' });
  }
  renderCatalog();
}

// ==========================================
// FEED COMPARISON SYSTEM
// ==========================================
function toggleCompareProduct(productId) {
  const idx = selectedCompareProducts.indexOf(productId);
  if (idx > -1) {
    selectedCompareProducts.splice(idx, 1);
  } else {
    if (selectedCompareProducts.length >= 3) {
      if (window.cart) window.cart.showToast('You can compare a maximum of 3 feeds at a time.', 'info');
      return;
    }
    selectedCompareProducts.push(productId);
  }

  updateCompareFloatingBar();
  renderCatalog();
}

function updateCompareFloatingBar() {
  const bar = document.getElementById('compareFloatingBar');
  const countEl = document.getElementById('compareCountText');
  if (!bar) return;

  if (selectedCompareProducts.length > 0) {
    bar.classList.add('active');
    if (countEl) countEl.textContent = `${selectedCompareProducts.length} feed${selectedCompareProducts.length > 1 ? 's' : ''} selected for comparison`;
  } else {
    bar.classList.remove('active');
  }
}

function clearCompareSelection() {
  selectedCompareProducts = [];
  updateCompareFloatingBar();
  renderCatalog();
}

function openCompareModal() {
  if (selectedCompareProducts.length < 2) {
    if (window.cart) window.cart.showToast('Please select at least 2 feeds to compare.', 'info');
    return;
  }

  const modal = document.getElementById('compareModal');
  const overlay = document.getElementById('modalOverlay');
  const tableContainer = document.getElementById('compareTableContent');
  if (!modal || !overlay || !tableContainer) return;

  const products = selectedCompareProducts.map(id => PRODUCTS_DATA.find(p => p.id === id)).filter(Boolean);

  tableContainer.innerHTML = `
    <table class="compare-table">
      <thead>
        <tr>
          <th>Nutritional Attribute</th>
          ${products.map(p => `
            <th>
              <div class="compare-th-card">
                <img src="${p.image}" alt="${p.name}" class="compare-th-img" />
                <h5>${p.name}</h5>
                <span class="compare-price-tag">${formatCurrency(getProductPrice(p.id, '50kg', currentCurrency))} (50kg)</span>
                <button type="button" class="btn btn-primary btn-sm" onclick="handleCardAddToCart('${p.id}'); closeCompareModal();">
                  Add to Cart
                </button>
              </div>
            </th>
          `).join('')}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="compare-feature-label">Species & Category</td>
          ${products.map(p => `<td><strong>${p.categoryLabel}</strong></td>`).join('')}
        </tr>
        <tr>
          <td class="compare-feature-label">Growth Stage</td>
          ${products.map(p => `<td>${p.stage}</td>`).join('')}
        </tr>
        <tr>
          <td class="compare-feature-label">Feed Form Factor</td>
          ${products.map(p => `<td><span class="form-tag">${p.form}</span></td>`).join('')}
        </tr>
        <tr class="highlight-row">
          <td class="compare-feature-label">Crude Protein (Min)</td>
          ${products.map(p => `<td><strong class="text-primary">${p.nutritionalAnalysis.crudeProtein}</strong></td>`).join('')}
        </tr>
        <tr>
          <td class="compare-feature-label">Crude Fat (Min)</td>
          ${products.map(p => `<td>${p.nutritionalAnalysis.crudeFat || 'N/A'}</td>`).join('')}
        </tr>
        <tr>
          <td class="compare-feature-label">Crude Fiber (Max)</td>
          ${products.map(p => `<td>${p.nutritionalAnalysis.crudeFiber || 'N/A'}</td>`).join('')}
        </tr>
        <tr>
          <td class="compare-feature-label">Energy Level</td>
          ${products.map(p => `<td>${p.nutritionalAnalysis.metabolizableEnergy || p.nutritionalAnalysis.digestibleEnergy || p.nutritionalAnalysis.totalDigestibleNutrients || 'Balanced'}</td>`).join('')}
        </tr>
        <tr>
          <td class="compare-feature-label">Calcium (Ca)</td>
          ${products.map(p => `<td>${p.nutritionalAnalysis.calcium || 'N/A'}</td>`).join('')}
        </tr>
        <tr>
          <td class="compare-feature-label">Phosphorus (P)</td>
          ${products.map(p => `<td>${p.nutritionalAnalysis.phosphorus || p.nutritionalAnalysis.availPhosphorus || 'N/A'}</td>`).join('')}
        </tr>
        <tr>
          <td class="compare-feature-label">Key Farm Impact</td>
          ${products.map(p => `<td><span class="badge badge-protein">${p.highlight}</span></td>`).join('')}
        </tr>
      </tbody>
    </table>
  `;

  modal.classList.add('active');
  overlay.classList.add('active');
  document.body.classList.add('modal-open');
}

function closeCompareModal() {
  const modal = document.getElementById('compareModal');
  const overlay = document.getElementById('modalOverlay');
  if (modal) modal.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
  document.body.classList.remove('modal-open');
}

// ==========================================
// DEALER LOCATOR SYSTEM
// ==========================================
function renderDealers(query = '') {
  const container = document.getElementById('dealerListContainer');
  if (!container || typeof DEALER_LOCATIONS === 'undefined') return;

  const cleanQuery = query.toLowerCase().trim();
  const matched = DEALER_LOCATIONS.filter(dealer => {
    if (!cleanQuery) return true;
    return dealer.name.toLowerCase().includes(cleanQuery) ||
           dealer.city.toLowerCase().includes(cleanQuery) ||
           dealer.state.toLowerCase().includes(cleanQuery) ||
           dealer.pincode.includes(cleanQuery) ||
           dealer.inStockCategories.some(c => c.toLowerCase().includes(cleanQuery));
  });

  if (matched.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 30px; background: #fff; border-radius: var(--radius-md); border: 1px dashed var(--color-gray-300);">
        <p>No regional stockist found matching "${query}". Contact our Farm Logistics hotline for direct truck dispatch.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = matched.map(dealer => `
    <div class="dealer-card">
      <div class="dealer-card-header">
        <div>
          <span class="dealer-badge ${dealer.isMill ? 'badge-mill' : 'badge-depot'}">
            ${dealer.isMill ? '🏭 Primary Mill & Silo' : '📦 Regional Stockist'}
          </span>
          <h4 class="dealer-title">${dealer.name}</h4>
          <span class="dealer-city">${dealer.city}, ${dealer.state} (PIN: ${dealer.pincode})</span>
        </div>
      </div>
      <div class="dealer-card-body">
        <p class="dealer-address">📍 ${dealer.address}</p>
        <p class="dealer-hours">⏰ ${dealer.openingHours}</p>
        <div class="dealer-stocks">
          <span class="dealer-stocks-label">Available Stocks:</span>
          <div class="dealer-stock-tags">
            ${dealer.inStockCategories.map(cat => `<span class="stock-tag">${cat}</span>`).join('')}
          </div>
        </div>
      </div>
      <div class="dealer-card-footer">
        <a href="tel:${dealer.phone.replace(/[^0-9+]/g, '')}" class="btn btn-secondary btn-sm">
          📞 Call Depot
        </a>
        <button type="button" class="btn btn-primary btn-sm" onclick="requestLocalDepotPickup('${dealer.name}')">
          Request Pickup
        </button>
      </div>
    </div>
  `).join('');
}

function setupDealerSearch() {
  const searchInput = document.getElementById('dealerSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderDealers(e.target.value);
    });
  }
}

function requestLocalDepotPickup(dealerName) {
  if (window.cart) {
    window.cart.showToast(`Selected ${dealerName} for farm pickup!`, 'success');
  }
}

// ==========================================
// WHATSAPP DIRECT ORDER & CONSULTATION
// ==========================================
function setupWhatsAppWidget() {
  const toggleBtn = document.getElementById('whatsappFloatingBtn');
  const popup = document.getElementById('whatsappChatPopup');
  const closeBtn = document.getElementById('closeWhatsappPopup');

  if (toggleBtn && popup) {
    toggleBtn.addEventListener('click', () => {
      popup.classList.toggle('active');
    });
  }

  if (closeBtn && popup) {
    closeBtn.addEventListener('click', () => {
      popup.classList.remove('active');
    });
  }
}

function sendCartViaWhatsApp() {
  if (!window.cart || window.cart.items.length === 0) {
    if (window.cart) window.cart.showToast('Your cart is empty. Add feed bags first!', 'info');
    return;
  }

  const items = window.cart.items;
  const totalBags = window.cart.getTotalBags();
  const weightKg = window.cart.getTotalWeightKg();
  const finalTotal = window.cart.getFinalTotal().toFixed(2);

  let message = `🌾 *NutriAgro Feeds Commercial Livestock Order*\n\n`;
  message += `Hello NutriAgro Team! I would like to confirm my farm feed order:\n\n`;
  
  items.forEach(item => {
    message += `• *${item.name}* (${item.bagSize})\n   Qty: ${item.quantity} bags | Subtotal: ₹${Math.round(item.price * item.quantity).toLocaleString('en-IN')}\n`;
  });

  message += `\n📦 *Total Bags:* ${totalBags} bags (${weightKg} kg)\n`;
  message += `💰 *Final Total Amount:* ₹${Math.round(window.cart.getFinalTotal()).toLocaleString('en-IN')}\n`;
  message += `\nPlease confirm freight availability and payment mode for my farm!`;

  const phone = '919876543210'; // Indian Farm Logistics & WhatsApp Helpline (+91)
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  
  if (window.cart) window.cart.showToast('Formatting WhatsApp order draft...', 'success');
  window.open(url, '_blank');
}

function askAgronomistWhatsApp() {
  const queryInput = document.getElementById('whatsappAgronomistQuery');
  const text = queryInput ? queryInput.value.trim() : '';
  if (typeof openGeminiChat === 'function') {
    openGeminiChat(text);
  } else if (window.geminiAI) {
    window.geminiAI.openChat(text);
  }
  if (queryInput) queryInput.value = '';
}

// ==========================================
// BULK TONNAGE / TANKER MODAL
// ==========================================
function openBulkTonnageModal() {
  const modal = document.getElementById('bulkTonnageModal');
  const overlay = document.getElementById('modalOverlay');
  if (modal && overlay) {
    modal.classList.add('active');
    overlay.classList.add('active');
    document.body.classList.add('modal-open');
  }
}

function closeBulkTonnageModal() {
  const modal = document.getElementById('bulkTonnageModal');
  const overlay = document.getElementById('modalOverlay');
  if (modal && overlay) {
    modal.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
}

function handleBulkTonnageSubmit(e) {
  e.preventDefault();
  const farm = document.getElementById('bulkFarmName').value;
  const tons = document.getElementById('bulkTonnageVal').value;
  const type = document.getElementById('bulkSpecies').value;
  const phone = document.getElementById('bulkContactPhone').value;

  if (window.cart) {
    window.cart.showToast(`Bulk Inquiry for ${tons} Metric Tons (${farm}) received! An Agronomist will call ${phone} within 2 business hours.`, 'success');
  }
  closeBulkTonnageModal();
}

function setupFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        // Close other items
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isOpen) {
          item.classList.add('active');
        }
      });
    }
  });
}

function setupGlobalModals() {
  // ESC key to close any active modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      closeCheckoutModal();
      closeCompareModal();
      closeBulkTonnageModal();
      if (window.cart) window.cart.closeDrawer();
    }
  });

  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      closeProductModal();
      closeCheckoutModal();
      closeCompareModal();
      closeBulkTonnageModal();
      if (typeof closeGeminiChat === 'function') closeGeminiChat();
    });
  }

  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  }

  const bulkForm = document.getElementById('bulkTonnageForm');
  if (bulkForm) {
    bulkForm.addEventListener('submit', handleBulkTonnageSubmit);
  }

  // Close mobile nav when clicking nav links
  document.querySelectorAll('.main-nav .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const nav = document.querySelector('.main-nav');
      if (nav) nav.classList.remove('active');
    });
  });
}

function toggleMobileNav() {
  const nav = document.querySelector('.main-nav');
  if (nav) nav.classList.toggle('active');
}

// Kickoff
document.addEventListener('DOMContentLoaded', () => {
  initCatalog();
});
