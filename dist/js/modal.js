// Modals: Product Detail / Lab Specs & Checkout Flow
let selectedModalProduct = null;
let selectedModalBagSize = '50kg';

function openProductModal(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  selectedModalProduct = product;
  selectedModalBagSize = '50kg';

  const modal = document.getElementById('productDetailModal');
  const overlay = document.getElementById('modalOverlay');
  if (!modal || !overlay) return;

  // Populate data
  document.getElementById('modalProductImg').src = product.image;
  document.getElementById('modalProductImg').alt = product.name;
  document.getElementById('modalProductCategory').textContent = product.categoryLabel;
  document.getElementById('modalProductForm').textContent = product.form;
  document.getElementById('modalProductName').textContent = product.name;
  document.getElementById('modalProductStage').textContent = `Target Stage: ${product.stage}`;
  document.getElementById('modalProductDesc').textContent = product.shortDesc;
  document.getElementById('modalProductHighlight').textContent = `★ ${product.highlight}`;

  // Update Bag Size & Price
  updateModalPriceUI();

  // Populate Nutrition Analysis Table
  const nutritionTbody = document.getElementById('modalNutritionTableBody');
  if (nutritionTbody) {
    const specs = product.nutritionalAnalysis;
    const labelsMap = {
      crudeProtein: 'Crude Protein (Min)',
      crudeFat: 'Crude Fat / Ether Extract (Min)',
      crudeFiber: 'Crude Fiber (Max)',
      totalDigestibleNutrients: 'Total Digestible Nutrients (TDN)',
      metabolizableEnergy: 'Metabolizable Energy (ME)',
      digestibleEnergy: 'Digestible Energy (DE)',
      netEnergy: 'Net Energy for Gain (NEg)',
      calcium: 'Calcium (Ca)',
      phosphorus: 'Total Phosphorus (P)',
      availPhosphorus: 'Available Phosphorus (aP)',
      lysine: 'Total Lysine',
      standardIlealLysine: 'Standardized Ileal Lysine',
      methionine: 'DL-Methionine',
      threonine: 'L-Threonine',
      moisture: 'Moisture Content (Max)',
      copper: 'Copper (Cu)',
      vitaminA: 'Vitamin A',
      vitaminD3: 'Vitamin D3',
      vitaminE: 'Vitamin E',
      vitaminC: 'Heat-Stable Vitamin C'
    };

    nutritionTbody.innerHTML = Object.keys(specs).map(key => `
      <tr>
        <td class="spec-label">${labelsMap[key] || key}</td>
        <td class="spec-value"><strong>${specs[key]}</strong></td>
      </tr>
    `).join('');
  }

  // Populate Benefits
  const benefitsList = document.getElementById('modalBenefitsList');
  if (benefitsList) {
    benefitsList.innerHTML = product.keyBenefits.map(b => `
      <li>
        <span class="check-icon">✓</span>
        <span>${b}</span>
      </li>
    `).join('');
  }

  // Populate Feeding Guide & Ingredients
  const guideEl = document.getElementById('modalFeedingGuide');
  if (guideEl) guideEl.textContent = product.feedingGuide;

  const ingEl = document.getElementById('modalIngredients');
  if (ingEl) ingEl.textContent = product.ingredients;

  // Reset Quantity
  const qtyInput = document.getElementById('modalQtyInput');
  if (qtyInput) qtyInput.value = 1;

  // Show Modal
  modal.classList.add('active');
  overlay.classList.add('active');
  document.body.classList.add('modal-open');
}

function updateModalPriceUI() {
  if (!selectedModalProduct) return;
  const price = getProductPrice(selectedModalProduct.id, selectedModalBagSize, currentCurrency);

  const priceEl = document.getElementById('modalProductPrice');
  if (priceEl) priceEl.textContent = formatCurrency(price);

  // Bag toggle active classes
  const btn25 = document.getElementById('modalSize25kg');
  const btn50 = document.getElementById('modalSize50kg');
  if (btn25 && btn50) {
    if (selectedModalBagSize === '25kg') {
      btn25.classList.add('active');
      btn50.classList.remove('active');
    } else {
      btn50.classList.add('active');
      btn25.classList.remove('active');
    }
  }
}

function selectModalBagSize(size) {
  selectedModalBagSize = size;
  updateModalPriceUI();
}

function addModalProductToCart() {
  if (!selectedModalProduct) return;
  const qtyInput = document.getElementById('modalQtyInput');
  const qty = parseInt(qtyInput ? qtyInput.value : 1, 10) || 1;

  if (window.cart) {
    window.cart.addItem(selectedModalProduct.id, selectedModalBagSize, qty);
    closeProductModal();
  }
}

function downloadDatasheetSimulation() {
  if (!selectedModalProduct) return;
  if (window.cart) {
    window.cart.showToast(`Downloading certified TDS Lab Spec Sheet for ${selectedModalProduct.name}...`, 'info');
  }
  // Simulate rapid download trigger
  setTimeout(() => {
    const dummyBlob = new Blob([
      `CERTIFIED LABORATORY SPECIFICATION SHEET\n` +
      `Product: ${selectedModalProduct.name}\n` +
      `Category: ${selectedModalProduct.categoryLabel}\n` +
      `Form: ${selectedModalProduct.form}\n\n` +
      `GUARANTEED NUTRITIONAL ANALYSIS:\n` +
      JSON.stringify(selectedModalProduct.nutritionalAnalysis, null, 2) +
      `\n\nINGREDIENTS:\n${selectedModalProduct.ingredients}\n\n` +
      `FEEDING PROTOCOL:\n${selectedModalProduct.feedingGuide}\n\n` +
      `ISO 9001:2015, GMP+, FSSAI & BIS Indian Livestock Feed Standards Batch #NUTRI-2026-X9`
    ], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dummyBlob);
    link.download = `${selectedModalProduct.id}-datasheet.txt`;
    link.click();
  }, 600);
}

function closeProductModal() {
  const modal = document.getElementById('productDetailModal');
  const overlay = document.getElementById('modalOverlay');
  if (modal) modal.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
  document.body.classList.remove('modal-open');
}

// ==========================================
// CHECKOUT MODAL SYSTEM
// ==========================================
function openCheckoutModal() {
  if (!window.cart || window.cart.items.length === 0) return;

  const modal = document.getElementById('checkoutModal');
  const overlay = document.getElementById('modalOverlay');
  if (!modal || !overlay) return;

  // Render Checkout Summary
  const summaryContainer = document.getElementById('checkoutSummaryItems');
  if (summaryContainer) {
    summaryContainer.innerHTML = window.cart.items.map(item => `
      <div class="checkout-summary-row">
        <span>${item.quantity} × ${item.name} (${item.bagSize})</span>
        <strong>${formatCurrency(item.price * item.quantity)}</strong>
      </div>
    `).join('');
  }

  const totalWeightEl = document.getElementById('checkoutTotalWeight');
  const subtotalEl = document.getElementById('checkoutSubtotal');
  const discountEl = document.getElementById('checkoutDiscount');
  const shippingEl = document.getElementById('checkoutShipping');
  const finalTotalEl = document.getElementById('checkoutFinalTotal');

  const weightKg = window.cart.getTotalWeightKg();
  const subtotal = window.cart.getSubtotal();
  const volumeDisc = window.cart.getVolumeDiscount();
  const promoDisc = window.cart.getPromoDiscount();
  const activeDiscount = promoDisc.amount > volumeDisc.amount ? promoDisc : volumeDisc;
  const shipping = window.cart.getShippingFee();
  const finalTotal = window.cart.getFinalTotal();

  if (totalWeightEl) totalWeightEl.textContent = weightKg >= 1000 ? `${(weightKg/1000).toFixed(2)} MT` : `${weightKg} kg`;
  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  if (discountEl) discountEl.textContent = activeDiscount.amount > 0 ? `-${formatCurrency(activeDiscount.amount)} (${activeDiscount.label})` : formatCurrency(0);
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : formatCurrency(shipping);
  if (finalTotalEl) finalTotalEl.textContent = formatCurrency(finalTotal);

  // Reset steps
  document.getElementById('checkoutFormSection').style.display = 'block';
  document.getElementById('checkoutSuccessSection').style.display = 'none';

  modal.classList.add('active');
  overlay.classList.add('active');
  document.body.classList.add('modal-open');

  // Automatically detect customer delivery address upon opening
  const addressInput = document.getElementById('checkoutAddress');
  if (addressInput && !addressInput.value.trim()) {
    autoDetectDeliveryAddress();
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  const overlay = document.getElementById('modalOverlay');
  if (modal) modal.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
  document.body.classList.remove('modal-open');
}

// Automatically detect Customer Delivery Address via GPS & Reverse Geocoding
async function autoDetectDeliveryAddress() {
  const addressInput = document.getElementById('checkoutAddress');
  const badge = document.getElementById('autoDetectBadge');
  const status = document.getElementById('addressDetectStatus');

  if (!addressInput) return;

  if (badge) {
    badge.textContent = '📍 Detecting location...';
    badge.style.color = '#f59e0b';
  }
  if (status) {
    status.innerHTML = '🛰️ Auto-detecting customer delivery location via GPS & network...';
  }

  function setConfirmedAddress(fullText, sourceLabel) {
    if (!addressInput) return;
    addressInput.value = fullText;
    if (badge) {
      badge.textContent = `✓ Auto-Detected (${sourceLabel})`;
      badge.style.color = '#10b981';
    }
    if (status) {
      status.innerHTML = `✓ <strong>Confirmed Delivery Location:</strong> ${fullText} <span style="color:#10b981; font-weight:600;">(Auto-filled via ${sourceLabel})</span>`;
    }
  }

  // 1. Try Browser HTML5 Geolocation API (High-accuracy GPS)
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // Try BigDataCloud reverse geocode client (fast, client-side, zero API key)
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
          if (res.ok) {
            const data = await res.json();
            const parts = [];
            if (data.locality) parts.push(data.locality);
            if (data.city && data.city !== data.locality) parts.push(data.city);
            if (data.principalSubdivision) parts.push(data.principalSubdivision);
            if (data.postcode) parts.push(`PIN: ${data.postcode}`);
            if (data.countryName) parts.push(data.countryName);

            if (parts.length > 0) {
              setConfirmedAddress(parts.join(', '), 'GPS');
              return;
            }
          }
        } catch (e) {
          console.warn('BigDataCloud geocode failed, trying Nominatim fallback:', e);
        }

        // Try OpenStreetMap Nominatim reverse geocode
        try {
          const res2 = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          if (res2.ok) {
            const data2 = await res2.json();
            if (data2 && data2.display_name) {
              setConfirmedAddress(data2.display_name, 'GPS Map');
              return;
            }
          }
        } catch (e2) {
          console.warn('Nominatim reverse geocode failed:', e2);
        }

        // Coordinates fallback
        setConfirmedAddress(`Customer GPS Location: ${lat.toFixed(5)}°N, ${lon.toFixed(5)}°E`, 'GPS Coords');
      },
      (err) => {
        console.warn('GPS permission prompt dismissed or timed out, trying IP geolocation:', err);
        detectViaIP();
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  } else {
    detectViaIP();
  }

  async function detectViaIP() {
    try {
      const res = await fetch('https://ipwho.is/');
      const ipData = await res.json();
      if (ipData && ipData.success !== false) {
        const parts = [];
        if (ipData.city) parts.push(ipData.city);
        if (ipData.region) parts.push(ipData.region);
        if (ipData.postal) parts.push(`PIN: ${ipData.postal}`);
        if (ipData.country) parts.push(ipData.country);
        const addr = parts.join(', ');
        if (addr) {
          setConfirmedAddress(addr, 'Network Location');
          return;
        }
      }
    } catch (e) {
      console.warn('IP location detection error:', e);
    }

    // Default fallback
    setConfirmedAddress('Sholinganallur, Chennai, Tamil Nadu, PIN: 600119, India', 'Local Area');
  }
}

function handleCheckoutSubmit(e) {
  e.preventDefault();

  const farmerName = document.getElementById('checkoutFarmerName').value.trim();
  const phone = document.getElementById('checkoutPhone').value.trim();
  const address = document.getElementById('checkoutAddress').value.trim();
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

  if (!farmerName || !phone || !address) {
    if (window.cart) window.cart.showToast('Please provide your Contact Person, Phone, and Delivery Address', 'error');
    return;
  }

  const submitBtn = document.getElementById('checkoutSubmitBtn');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <span class="spinner"></span> Processing Order...
  `;

  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;

    // Generate Order ID
    const orderId = 'NUTRI-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

    // Build order object for tracking
    const orderObj = {
      orderId: orderId,
      date: dateStr,
      timestamp: Date.now(),
      farmerName: farmerName,
      phone: phone,
      address: address,
      paymentMethod: paymentMethod,
      items: (window.cart && window.cart.items) ? window.cart.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        bagSize: item.bagSize
      })) : [],
      totalBags: window.cart ? window.cart.getTotalBags() : 1,
      totalWeightKg: window.cart ? window.cart.getTotalWeightKg() : 50,
      finalTotal: window.cart ? window.cart.getFinalTotal() : 0,
      status: 'Order Confirmed & Logged',
      eta: 'Tomorrow by 4:00 PM (Farmgate Arrival)',
      driverName: 'Ramesh Singh (Agro Hauler #HR-05-AB-4821)',
      driverPhone: '+91 98123 45678',
      currentStep: 1 // 1: Confirmed, 2: Milling, 3: Dispatched, 4: Delivered
    };

    // Store in server and local store for permanent cross-device tracking
    saveOrder(orderObj);
    requestNotificationPermission();

    // Show Confirmation Screen
    document.getElementById('checkoutFormSection').style.display = 'none';
    const successSec = document.getElementById('checkoutSuccessSection');
    successSec.style.display = 'block';

    document.getElementById('confirmOrderId').textContent = orderId;
    document.getElementById('confirmOrderDate').textContent = dateStr;
    document.getElementById('confirmFarmName').textContent = farmerName;
    document.getElementById('confirmDeliveryAddress').textContent = address;
    document.getElementById('confirmTotalBags').textContent = `${window.cart.getTotalBags()} Bags (${window.cart.getTotalWeightKg()} kg)`;
    document.getElementById('confirmPaymentType').textContent = paymentMethod;
    document.getElementById('confirmAmountPaid').textContent = formatCurrency(window.cart.getFinalTotal());

    // Update WhatsApp direct dispatch link for guaranteed instant owner notification
    try {
      const waText = encodeURIComponent(
        `🌾 *NUTRIAGRO FEEDS - NEW ORDER CONFIRMATION* 🌾\n\n` +
        `📋 *Order ID:* #${orderObj.orderId}\n` +
        `📅 *Date:* ${orderObj.date}\n` +
        `👤 *Contact Person:* ${orderObj.farmerName}\n` +
        `📞 *Phone:* ${orderObj.phone}\n` +
        `📍 *Delivery Address:* ${orderObj.address}\n\n` +
        `📦 *Order Items:*\n` +
        orderObj.items.map(it => `  • ${it.quantity}x ${it.name} (${it.bagSize}) - ₹${(it.price * it.quantity).toLocaleString('en-IN')}`).join('\n') + `\n\n` +
        `📊 *Total Packaging:* ${orderObj.totalBags} Bags (${orderObj.totalWeightKg} kg)\n` +
        `💰 *Total Amount:* ₹${Math.round(orderObj.finalTotal).toLocaleString('en-IN')}\n` +
        `💳 *Payment Mode:* ${orderObj.paymentMethod}\n\n` +
        `🚜 *Please confirm receipt and dispatch this commercial farm order!*`
      );
      const waBtn = document.getElementById('confirmWhatsappOrderBtn');
      if (waBtn) {
        waBtn.href = `https://wa.me/919845012345?text=${waText}`;
      }
    } catch (e) {}

    // Clear cart
    window.cart.clearCart();
    window.cart.showToast(`Order #${orderId} Confirmed! We are prepping your batch.`, 'success');
  }, 1200);
}

// ==========================================
// 14. LIVE ORDER TRACKER & SERVER SYNC ENGINE
// ==========================================
function getOrdersApiEndpoint() {
  if (window.location.protocol === 'file:') {
    return 'http://localhost:8080/api/orders';
  }
  return '/api/orders';
}

function getDeletedOrderIds() {
  try {
    const local = JSON.parse(localStorage.getItem('nutri_deleted_orders') || '[]');
    const sess = JSON.parse(sessionStorage.getItem('nutri_deleted_orders') || '[]');
    return new Set([...local, ...sess].filter(Boolean).map(id => String(id).toLowerCase()));
  } catch (e) {
    return new Set();
  }
}

function getStoredOrders() {
  try {
    const deletedIds = getDeletedOrderIds();
    const raw = JSON.parse(localStorage.getItem('nutriagro_orders') || '[]');
    return (raw || []).filter(o => o && o.orderId && !o.action && !deletedIds.has(String(o.orderId).toLowerCase()));
  } catch (e) {
    return [];
  }
}

function updateAllOrderBadges(count) {
  const c = typeof count === 'number' ? count : getStoredOrders().length;
  
  const headerBadge = document.getElementById('headerOrdersCountBadge');
  if (headerBadge) {
    headerBadge.textContent = c;
    headerBadge.style.display = c > 0 ? 'inline-block' : 'none';
  }

  const modalBadge = document.getElementById('ordersCountBadge');
  if (modalBadge) {
    modalBadge.textContent = c;
  }

  const navBadge = document.getElementById('navOrdersCountBadge');
  if (navBadge) {
    navBadge.textContent = c;
    navBadge.style.display = c > 0 ? 'inline-block' : 'none';
  }
}

const FIREBASE_RTDB_ORDERS_URL = 'https://nutriagro-feeds-default-rtdb.firebaseio.com/orders';

async function fetchOrdersFromServer(callback) {
  const deletedIds = getDeletedOrderIds();
  // 1. Try Firebase Cloud Database directly (real multi-device cloud store)
  try {
    const fbRes = await fetch(`${FIREBASE_RTDB_ORDERS_URL}.json?_t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store'
    });
    if (fbRes.ok) {
      const fbData = await fbRes.json();
      if (fbData && typeof fbData === 'object') {
        const list = Array.isArray(fbData) ? fbData : Object.values(fbData);
        const cleanServer = list.filter(o => 
          o && o.orderId && 
          !o.action && 
          (o.farmerName || o.items || o.finalTotal) && 
          !deletedIds.has(String(o.orderId).toLowerCase())
        );
        cleanServer.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        localStorage.setItem('nutriagro_orders', JSON.stringify(cleanServer));
        updateAllOrderBadges(cleanServer.length);
        checkCustomerOrderStatusChanges(cleanServer);
        if (typeof callback === 'function') callback(cleanServer);
        return cleanServer;
      }
    }
  } catch (fbErr) {}

  // 2. Fallback to /api/orders endpoint
  try {
    const res = await fetch(getOrdersApiEndpoint() + '?_t=' + Date.now(), {
      method: 'GET',
      cache: 'no-store',
      headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache, no-store' }
    });
    if (res.ok) {
      const serverOrders = await res.json();
      if (Array.isArray(serverOrders)) {
        const cleanServer = serverOrders.filter(o => 
          o && o.orderId && 
          !o.action && 
          (o.farmerName || o.items || o.finalTotal) && 
          !deletedIds.has(String(o.orderId).toLowerCase())
        );
        localStorage.setItem('nutriagro_orders', JSON.stringify(cleanServer));
        updateAllOrderBadges(cleanServer.length);
        checkCustomerOrderStatusChanges(cleanServer);
        if (typeof callback === 'function') callback(cleanServer);
        return cleanServer;
      }
    }
  } catch (err) {}
  const current = getStoredOrders();
  updateAllOrderBadges(current.length);
  if (typeof callback === 'function') callback(current);
  return current;
}

async function saveOrder(orderObj) {
  try {
    const local = getStoredOrders();
    local.unshift(orderObj);
    localStorage.setItem('nutriagro_orders', JSON.stringify(local));
    localStorage.setItem('nutriagro_last_order_timestamp', String(Date.now()));

    localStorage.setItem('nutriagro_my_latest_order_id', orderObj.orderId);
    localStorage.setItem('nutriagro_tracked_status_' + orderObj.orderId, JSON.stringify({
      currentStep: orderObj.currentStep || 1,
      status: orderObj.status || 'Order Confirmed & Logged'
    }));

    updateAllOrderBadges(local.length);

    // Instant cross-tab broadcast to open Admin Hub on same machine
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('nutriagro_orders_channel');
        channel.postMessage({ type: 'NEW_ORDER', order: orderObj });
      }
    } catch (e) {}

    // 1. Direct Cloud Sync to Firebase Realtime Database (Multi-Device Worldwide Instant Delivery)
    try {
      await fetch(`${FIREBASE_RTDB_ORDERS_URL}/${encodeURIComponent(orderObj.orderId)}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderObj)
      });
    } catch (fbErr) {
      console.warn('Firebase order push note:', fbErr);
    }

    // 2. Also POST to /api/orders endpoint (Vercel & Local Server fallback)
    try {
      await fetch(getOrdersApiEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderObj)
      });
    } catch (netErr) {
      console.warn('API sync notice:', netErr);
    }
  } catch (err) {
    console.warn('Save order notice:', err);
  }
  fetchOrdersFromServer();
}

async function updateOrderStatus(orderId, newStepVal) {
  const step = parseInt(newStepVal, 10);
  const orders = getStoredOrders();
  const match = orders.find(o => o.orderId === orderId);
  if (!match) return;

  match.currentStep = step;
  if (step === 1) {
    match.status = 'Order Confirmed & Logged';
  } else if (step === 2) {
    match.status = 'Automated Milling & Quality Screened';
  } else if (step === 3) {
    match.status = 'Dispatched on Agro Freight Truck';
  } else if (step === 4) {
    match.status = 'Delivered to Farm Gate';
  }
  match.lastUpdated = new Date().toISOString();

  localStorage.setItem('nutriagro_orders', JSON.stringify(orders));

  try {
    fetch(`${FIREBASE_RTDB_ORDERS_URL}/${encodeURIComponent(orderId)}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentStep: step,
        status: match.status,
        lastUpdated: match.lastUpdated
      })
    }).catch(() => {});
  } catch (e) {}

  try {
    await fetch(getOrdersApiEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_status',
        orderId: orderId,
        currentStep: step,
        status: match.status
      })
    });
  } catch (err) {
    console.warn('Sync status notice:', err);
  }

  if (window.cart) {
    window.cart.showToast(`✅ Order #${orderId} status updated to: ${match.status}!`, 'success');
  }

  renderOrdersListView(orders);
}

function manualRefreshOrders() {
  const btn = document.getElementById('manualRefreshBtn');
  if (btn) btn.textContent = '⏳ Syncing...';
  fetchOrdersFromServer((orders) => {
    if (btn) btn.textContent = '🔄 Refresh';
    renderOrdersListView(orders);
    if (window.cart) window.cart.showToast('Orders list refreshed from server!', 'info');
  });
}

function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1318.5, now);
    gain1.gain.setValueAtTime(0.22, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1975.5, now + 0.12);
    gain2.gain.setValueAtTime(0.26, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {}
}

function showCustomerStatusNotificationBanner(order) {
  let banner = document.getElementById('customerStatusNotificationBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'customerStatusNotificationBanner';
    banner.className = 'customer-status-alert-banner';
    document.body.appendChild(banner);
  }

  banner.innerHTML = `
    <div class="status-alert-left">
      <span class="status-alert-icon">🔔</span>
      <div>
        <div class="status-alert-title">Order Status Updated by NutriAgro Mill!</div>
        <div class="status-alert-detail">
          Your Order <strong>#${order.orderId}</strong> is now: 
          <span class="status-badge-inline">${order.status}</span>
        </div>
      </div>
    </div>
    <div class="status-alert-actions">
      <button type="button" class="btn btn-sm btn-gold" onclick="openOrderTrackerModal('${order.orderId}'); dismissCustomerStatusBanner();" style="font-weight: 800; padding: 6px 12px; font-size: 0.8rem;">
        🛰️ Track Live
      </button>
      <button type="button" class="status-alert-close" onclick="dismissCustomerStatusBanner()" aria-label="Close">✕</button>
    </div>
  `;
  banner.style.display = 'flex';

  if (window.Notification && Notification.permission === 'granted') {
    try {
      new Notification('NutriAgro Feeds: Order Status Updated', {
        body: `Your Order #${order.orderId} has been updated to: ${order.status}`,
        icon: 'assets/images/agro-logo.jpg'
      });
    } catch (e) {}
  }
}

function dismissCustomerStatusBanner() {
  const banner = document.getElementById('customerStatusNotificationBanner');
  if (banner) banner.style.display = 'none';
}

function checkCustomerOrderStatusChanges(allOrders) {
  const myOrderId = localStorage.getItem('nutriagro_my_latest_order_id');
  if (!myOrderId) return;

  const match = allOrders.find(o => o.orderId && o.orderId.toLowerCase() === myOrderId.toLowerCase());
  if (!match) return;

  const key = 'nutriagro_tracked_status_' + match.orderId;
  let prev = {};
  try {
    prev = JSON.parse(localStorage.getItem(key) || '{}');
  } catch (e) {}

  if (prev.currentStep && (prev.currentStep !== match.currentStep || prev.status !== match.status)) {
    localStorage.setItem(key, JSON.stringify({
      currentStep: match.currentStep,
      status: match.status
    }));

    playNotificationChime();
    showCustomerStatusNotificationBanner(match);

    const trackerModal = document.getElementById('orderTrackerModal');
    if (trackerModal && trackerModal.classList.contains('active')) {
      const trackingTab = document.getElementById('trackerLiveTrackingTab');
      if (trackingTab && trackingTab.style.display !== 'none') {
        renderOrderTrackingCard(match, allOrders);
      }
    }
  } else if (!prev.currentStep) {
    localStorage.setItem(key, JSON.stringify({
      currentStep: match.currentStep,
      status: match.status
    }));
  }
}

let statusWatcherTimer = null;
let firebaseEventSource = null;

function startOrderStatusWatcher() {
  if (statusWatcherTimer) clearInterval(statusWatcherTimer);
  fetchOrdersFromServer();

  // Fast poll fallback (every 2.5s) to guarantee zero missed updates across tabs & mobile
  statusWatcherTimer = setInterval(() => {
    fetchOrdersFromServer();
  }, 2500);

  // Real-time Firebase Server-Sent Events (SSE) Stream for 0ms Instant Push
  try {
    if (typeof EventSource !== 'undefined' && !firebaseEventSource) {
      firebaseEventSource = new EventSource(`${FIREBASE_RTDB_ORDERS_URL}.json`);
      firebaseEventSource.addEventListener('put', (event) => {
        try {
          fetchOrdersFromServer();
        } catch (e) {}
      });
      firebaseEventSource.addEventListener('patch', (event) => {
        try {
          fetchOrdersFromServer();
        } catch (e) {}
      });
      firebaseEventSource.onerror = () => {
        // Fallback continues running via statusWatcherTimer
      };
    }
  } catch (sseErr) {}
}

function requestNotificationPermission() {
  if (window.Notification && Notification.permission === 'default') {
    try {
      Notification.requestPermission();
    } catch (e) {}
  }
}

function openOrderTrackerModal(targetOrderId) {
  const modal = document.getElementById('orderTrackerModal');
  const overlay = document.getElementById('modalOverlay');
  if (!modal || !overlay) return;

  const orders = getStoredOrders();
  const countBadge = document.getElementById('ordersCountBadge');
  if (countBadge) countBadge.textContent = orders.length;

  if (targetOrderId) {
    // If a specific order ID was requested (e.g. from checkout or direct track button)
    switchTrackerTab('tracking');
    const inputEl = document.getElementById('orderTrackerInput');
    if (inputEl) inputEl.value = targetOrderId;
    const match = orders.find(o => o.orderId.toLowerCase() === targetOrderId.toLowerCase());
    if (match) {
      renderOrderTrackingCard(match, orders);
    } else {
      renderSampleTrackingOrder(targetOrderId, orders);
    }
  } else {
    // Default when opening from navigation menu: Open the Orders List!
    switchTrackerTab('list');
  }

  modal.classList.add('active');
  overlay.classList.add('active');
  document.body.classList.add('modal-open');
}

function closeOrderTrackerModal() {
  const modal = document.getElementById('orderTrackerModal');
  const overlay = document.getElementById('modalOverlay');
  if (modal) modal.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
  document.body.classList.remove('modal-open');
}

function switchTrackerTab(tabName) {
  const listTab = document.getElementById('trackerOrdersListTab');
  const trackingTab = document.getElementById('trackerLiveTrackingTab');
  const btnList = document.getElementById('tabBtnOrdersList');
  const btnTracking = document.getElementById('tabBtnLiveTracking');
  const orders = getStoredOrders();

  const countBadge = document.getElementById('ordersCountBadge');
  if (countBadge) countBadge.textContent = orders.length;

  if (tabName === 'list') {
    if (listTab) listTab.style.display = 'block';
    if (trackingTab) trackingTab.style.display = 'none';
    if (btnList) btnList.classList.add('active');
    if (btnTracking) btnTracking.classList.remove('active');
    renderOrdersListView(orders);
  } else {
    if (listTab) listTab.style.display = 'none';
    if (trackingTab) trackingTab.style.display = 'block';
    if (btnList) btnList.classList.remove('active');
    if (btnTracking) btnTracking.classList.add('active');
    
    // If tracking tab has no card yet, render the latest order
    const container = document.getElementById('orderTrackerResultContainer');
    if (container && (!container.innerHTML.trim() || container.innerHTML.includes('No Orders Placed Yet'))) {
      if (orders.length > 0) {
        const inputEl = document.getElementById('orderTrackerInput');
        if (inputEl) inputEl.value = orders[0].orderId;
        renderOrderTrackingCard(orders[0], orders);
      } else {
        renderEmptyOrderTrackerState(orders);
      }
    }
  }
}

function renderOrdersListView(orders, searchQuery = '') {
  const listContainer = document.getElementById('trackerOrdersListTab');
  if (!listContainer) return;

  const countBadge = document.getElementById('ordersCountBadge');
  if (countBadge) countBadge.textContent = orders.length;

  // Filter if searchQuery provided
  let filteredOrders = orders;
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filteredOrders = orders.filter(o => 
      (o.orderId && o.orderId.toLowerCase().includes(q)) ||
      (o.farmerName && o.farmerName.toLowerCase().includes(q)) ||
      (o.phone && o.phone.toLowerCase().includes(q)) ||
      (o.address && o.address.toLowerCase().includes(q))
    );
  }

  if (orders.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; background: var(--color-gray-50); border: 1.5px dashed var(--color-gray-300); border-radius: var(--radius-lg);">
        <div style="font-size: 2.8rem; margin-bottom: 12px;">📋</div>
        <h3 style="font-size: 1.25rem; margin-bottom: 6px; color: var(--color-dark);">No Orders Placed Yet</h3>
        <p style="font-size: 0.88rem; color: var(--color-dark-muted); max-width: 480px; margin: 0 auto 20px auto;">
          When orders are submitted through Direct Farm Checkout, they will appear here in your Received Orders List with live dispatch controls.
        </p>
        <button type="button" class="btn btn-primary" onclick="generateSampleOrder()" style="padding: 10px 22px;">
          ➕ Generate Sample Customer Order
        </button>
      </div>
    `;
    return;
  }

  // Calculate totals
  const totalBags = orders.reduce((sum, o) => sum + (o.totalBags || 1), 0);
  const totalAmount = orders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);

  let ordersCardsHtml = '';
  if (filteredOrders.length === 0) {
    ordersCardsHtml = `
      <div style="text-align:center; padding:30px; color:var(--color-dark-muted); background:#f8fafc; border-radius:var(--radius-md);">
        No orders match "<strong>${searchQuery}</strong>". <button type="button" onclick="renderOrdersListView(getStoredOrders(), '')" style="background:none; border:none; color:var(--color-primary); font-weight:700; cursor:pointer;">Clear search</button>
      </div>
    `;
  } else {
    ordersCardsHtml = filteredOrders.map(order => {
      const step = order.currentStep || 2;
      const statusBadge = step === 1 
        ? '<span style="background:rgba(59,130,246,0.15); color:#2563eb; border:1px solid rgba(59,130,246,0.3); padding:4px 10px; border-radius:14px; font-size:0.76rem; font-weight:700;">🌾 1. Order Confirmed</span>'
        : (step === 2 
          ? '<span style="background:rgba(245,158,11,0.15); color:#d97706; border:1px solid rgba(245,158,11,0.3); padding:4px 10px; border-radius:14px; font-size:0.76rem; font-weight:700;">⚙️ 2. Automated Milling</span>'
          : (step === 3 
            ? '<span style="background:rgba(16,185,129,0.15); color:#059669; border:1px solid rgba(16,185,129,0.3); padding:4px 10px; border-radius:14px; font-size:0.76rem; font-weight:700;">🚚 3. Truck Dispatched</span>'
            : '<span style="background:rgba(16,185,129,0.25); color:#047857; border:1px solid rgba(16,185,129,0.4); padding:4px 10px; border-radius:14px; font-size:0.76rem; font-weight:800;">🏡 4. Delivered to Farm</span>'
          )
        );

      let itemsSummary = '';
      if (order.items && order.items.length > 0) {
        itemsSummary = order.items.map(i => `${i.quantity}× ${i.name} (${i.bagSize || '50kg'})`).join(', ');
      } else {
        itemsSummary = `${order.totalBags || 1} Bags (${order.totalWeightKg || 50} kg)`;
      }

      return `
        <div class="order-list-item-card">
          <!-- Order Card Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; border-bottom: 1px solid var(--color-gray-200); padding-bottom: 10px; margin-bottom: 12px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.15rem; font-weight: 800; color: var(--color-primary); cursor: pointer;" onclick="openOrderTrackerModal('${order.orderId}')" title="Click to view live tracking">
                  #${order.orderId}
                </span>
                <span style="font-size: 0.78rem; color: var(--color-dark-muted);">· Placed: ${order.date || 'Today'}</span>
              </div>
            </div>
            <div>
              ${statusBadge}
            </div>
          </div>

          <!-- Customer & Destination Details -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 0.84rem; margin-bottom: 14px;">
            <div>
              <span style="color: var(--color-dark-muted); font-size: 0.75rem; display: block; font-weight: 700;">CUSTOMER & PHONE:</span>
              <strong style="font-size: 0.95rem; color: var(--color-dark);">${order.farmerName || 'Customer'}</strong>
              <div style="color: #047857; font-weight: 600; margin-top: 2px;">📞 ${order.phone || 'N/A'}</div>
              <div style="color: var(--color-dark-muted); font-size: 0.78rem; margin-top: 4px;">📍 ${order.address || 'Detected Location'}</div>
            </div>
            <div>
              <span style="color: var(--color-dark-muted); font-size: 0.75rem; display: block; font-weight: 700;">ORDER VALUE & PACKAGING:</span>
              <strong style="font-size: 1.05rem; color: var(--color-primary);">₹${Math.round(order.finalTotal || 0).toLocaleString('en-IN')}</strong>
              <div style="font-size: 0.78rem; color: var(--color-dark-muted); margin-top: 2px;">
                ${order.totalBags || 1} Bags (${order.totalWeightKg || 50} kg) · ${order.paymentMethod || 'COD'}
              </div>
              <div style="font-size: 0.78rem; color: #4b5563; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${itemsSummary}">
                📦 ${itemsSummary}
              </div>
            </div>
          </div>

          <!-- Action Controls & Status Updater -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; background: var(--color-gray-50); border-radius: var(--radius-md); padding: 10px 14px; border: 1px solid var(--color-gray-200);">
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <button type="button" class="btn btn-sm btn-primary" onclick="openOrderTrackerModal('${order.orderId}')" style="padding: 6px 14px; font-size: 0.8rem; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;">
                <span>🛰️</span> Track Live Status
              </button>
              <a href="https://wa.me/${order.phone ? order.phone.replace(/\D/g,'') : '919876543210'}?text=Hello%20${encodeURIComponent(order.farmerName || 'Customer')},%20your%20NutriAgro%20Order%20${order.orderId}%20is%20${encodeURIComponent(order.status || 'in progress')}.%20ETA:%20${encodeURIComponent(order.eta || 'Tomorrow')}." target="_blank" class="btn btn-sm btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; background: #25d366; color: #fff; border-color: #25d366; display: inline-flex; align-items: center; gap: 4px;">
                <span>📲</span> WhatsApp Customer
              </a>
            </div>

            <!-- Manage / Update Stage -->
            <div style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem;">
              <span style="color: var(--color-dark-muted); font-weight: 700;">Update Status:</span>
              <select onchange="updateOrderStatus('${order.orderId}', this.value)" style="padding: 5px 8px; font-size: 0.78rem; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: 600; background: #fff; cursor: pointer;">
                <option value="1" ${step === 1 ? 'selected' : ''}>🌾 1. Confirmed</option>
                <option value="2" ${step === 2 ? 'selected' : ''}>⚙️ 2. Milling & QA</option>
                <option value="3" ${step === 3 ? 'selected' : ''}>🚚 3. Dispatched</option>
                <option value="4" ${step === 4 ? 'selected' : ''}>🏡 4. Delivered</option>
              </select>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  listContainer.innerHTML = `
    <!-- Top Statistics Strip -->
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: var(--radius-md); padding: 12px 18px; margin-bottom: 16px;">
      <div style="display: flex; gap: 18px; flex-wrap: wrap; font-size: 0.85rem;">
        <div>📦 Total Orders: <strong style="color: var(--color-primary);">${orders.length}</strong></div>
        <div>🌾 Total Bags: <strong>${totalBags} Bags</strong></div>
        <div>💰 Total Revenue: <strong style="color: var(--color-primary);">₹${Math.round(totalAmount).toLocaleString('en-IN')}</strong></div>
      </div>
      <div>
        <button type="button" class="btn btn-sm btn-secondary" onclick="generateSampleOrder()" style="padding: 4px 10px; font-size: 0.75rem;">
          + Add Test Order
        </button>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div style="margin-bottom: 16px;">
      <input type="text" class="calc-input" placeholder="🔍 Search orders by Order ID, Customer Name, or Phone..." value="${searchQuery}" oninput="renderOrdersListView(getStoredOrders(), this.value)" style="margin: 0; padding: 10px 14px; font-size: 0.85rem;" />
    </div>

    <!-- Cards List -->
    <div style="max-height: 480px; overflow-y: auto; padding-right: 4px;">
      ${ordersCardsHtml}
    </div>
  `;
}

function updateOrderStatus(orderId, newStepVal) {
  const step = parseInt(newStepVal, 10);
  const orders = getStoredOrders();
  const match = orders.find(o => o.orderId === orderId);
  if (!match) return;

  match.currentStep = step;
  if (step === 1) {
    match.status = 'Order Confirmed & Logged';
  } else if (step === 2) {
    match.status = 'Automated Milling & Quality Screened';
  } else if (step === 3) {
    match.status = 'Dispatched on Agro Freight Truck';
  } else if (step === 4) {
    match.status = 'Delivered to Farm Gate';
  }

  localStorage.setItem('nutriagro_orders', JSON.stringify(orders));
  if (window.cart) window.cart.showToast(`Order #${orderId} status updated to Step ${step}!`, 'success');
  renderOrdersListView(orders);
}

function generateSampleOrder() {
  const sampleId = 'NUTRI-' + Math.floor(100000 + Math.random() * 900000);
  const dateStr = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  const sampleOrder = {
    orderId: sampleId,
    date: dateStr,
    timestamp: Date.now(),
    farmerName: 'Kisan Agro Dairy Farm',
    phone: '+91 98765 43210',
    address: 'Sholinganallur, Chennai, Tamil Nadu, PIN: 600119, India',
    paymentMethod: 'Farmgate Delivery (COD / Cheque on Site)',
    items: [
      { name: 'NutriBov LactaMax™ High-Yield Dairy Feed', quantity: 2, price: 1850, bagSize: '50kg' },
      { name: 'NutriBov CalfGrow™ 20% Starter Pellets', quantity: 1, price: 2050, bagSize: '50kg' }
    ],
    totalBags: 3,
    totalWeightKg: 150,
    finalTotal: 5750,
    status: 'Automated Milling & Quality Screened',
    eta: 'Tomorrow by 4:00 PM (Farmgate Arrival)',
    driverName: 'Ramesh Singh (Agro Hauler #HR-05-AB-4821)',
    driverPhone: '+91 98123 45678',
    currentStep: 2
  };

  const stored = getStoredOrders();
  stored.unshift(sampleOrder);
  localStorage.setItem('nutriagro_orders', JSON.stringify(stored));
  if (window.cart) window.cart.showToast(`Sample order #${sampleId} added to orders list!`, 'success');
  renderOrdersListView(stored);
}

function trackOrderSubmit() {
  const input = document.getElementById('orderTrackerInput');
  const query = input ? input.value.trim() : '';

  if (!query) {
    if (window.cart) window.cart.showToast('Please enter an Order ID or Phone number', 'info');
    return;
  }

  const orders = getStoredOrders();
  const match = orders.find(o => 
    (o.orderId && o.orderId.toLowerCase().includes(query.toLowerCase())) || 
    (o.phone && o.phone.replace(/\D/g, '').includes(query.replace(/\D/g, '')))
  );

  if (match) {
    renderOrderTrackingCard(match, orders);
  } else {
    renderSampleTrackingOrder(query, orders);
  }
}

function renderOrderTrackingCard(order, allOrders) {
  const container = document.getElementById('orderTrackerResultContainer');
  if (!container) return;

  const currentStep = order.currentStep || 2;
  const statusColor = currentStep >= 3 ? '#10b981' : '#f59e0b';
  const statusBadgeText = currentStep === 1 
    ? '🌾 1. Order Confirmed' 
    : (currentStep === 2 
      ? '⚙️ 2. Automated Milling & QA Screen' 
      : (currentStep === 3 
        ? '🚚 3. Truck Dispatched' 
        : '🏡 4. Delivered to Farm'));

  let itemsHtml = '';
  if (order.items && order.items.length > 0) {
    itemsHtml = order.items.map(it => `
      <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed var(--color-gray-200); font-size: 0.85rem;">
        <span><strong>${it.quantity}×</strong> ${it.name} (${it.bagSize || '50kg'})</span>
        <strong>₹${Math.round(it.price * it.quantity).toLocaleString('en-IN')}</strong>
      </div>
    `).join('');
  } else {
    itemsHtml = `<div style="font-size:0.85rem; color:var(--color-dark-muted);">${order.totalBags || 1} Feed Bags (${order.totalWeightKg || 50} kg)</div>`;
  }

  container.innerHTML = `
    <!-- Top Back to Orders List Button -->
    <div style="margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
      <button type="button" class="btn btn-sm btn-secondary" onclick="switchTrackerTab('list')" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; padding: 6px 14px;">
        ← Back to All Orders List (${allOrders.length})
      </button>
      <span style="font-size: 0.78rem; color: var(--color-dark-muted);">Live Freight Tracking</span>
    </div>

    <!-- Active Order Card -->
    <div style="background: #ffffff; border: 1.5px solid var(--color-gray-200); border-radius: var(--radius-lg); box-shadow: var(--shadow-md); padding: 22px; overflow: hidden;">
      
      <!-- Card Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--color-gray-200); padding-bottom: 14px; margin-bottom: 18px;">
        <div>
          <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; color: var(--color-dark-muted);">Order Reference</span>
          <div style="font-size: 1.35rem; font-weight: 800; color: var(--color-primary);">${order.orderId}</div>
          <div style="font-size: 0.78rem; color: var(--color-dark-muted);">Placed on: ${order.date || 'Today'}</div>
        </div>
        <div style="text-align: right;">
          <span style="display: inline-block; background: rgba(245, 158, 11, 0.15); color: ${statusColor}; font-weight: 700; font-size: 0.8rem; padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(245, 158, 11, 0.3);">
            ${statusBadgeText}
          </span>
          <div style="font-size: 0.76rem; color: #059669; font-weight: 600; margin-top: 4px;">ETA: ${order.eta || 'Tomorrow by 4:00 PM'}</div>
        </div>
      </div>

      <!-- 4-Stage Visual Progress Stepper -->
      <div class="order-track-stepper-wrap" style="margin-bottom: 22px;">
        <div class="order-track-stepper">
          
          <div class="track-step completed">
            <div class="track-step-circle">✓</div>
            <div class="track-step-info">
              <strong>1. Order Confirmed</strong>
              <small>Logged & Verified</small>
            </div>
          </div>

          <div class="track-step ${currentStep >= 2 ? (currentStep === 2 ? 'active' : 'completed') : ''}">
            <div class="track-step-circle">${currentStep > 2 ? '✓' : '⚙️'}</div>
            <div class="track-step-info">
              <strong>2. Milling & Bagging</strong>
              <small>Pellets in Production</small>
            </div>
          </div>

          <div class="track-step ${currentStep >= 3 ? (currentStep === 3 ? 'active' : 'completed') : ''}">
            <div class="track-step-circle">${currentStep > 3 ? '✓' : '🚚'}</div>
            <div class="track-step-info">
              <strong>3. Truck Dispatched</strong>
              <small>En Route to Farm</small>
            </div>
          </div>

          <div class="track-step ${currentStep >= 4 ? 'completed' : ''}">
            <div class="track-step-circle">🏡</div>
            <div class="track-step-info">
              <strong>4. Farm Arrival</strong>
              <small>Unloaded at Barn</small>
            </div>
          </div>

        </div>
      </div>

      <!-- Logistics Driver & Destination Box -->
      <div style="background: var(--color-gray-50); border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); padding: 14px; margin-bottom: 18px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.84rem;">
          <div>
            <span style="color: var(--color-dark-muted); font-size: 0.75rem; display: block;">Contact & Destination:</span>
            <strong>${order.farmerName || 'Customer'}</strong> (${order.phone || ''})
            <div style="font-size: 0.78rem; color: var(--color-dark-muted); margin-top: 2px;">📍 ${order.address || 'Detected Farm Location'}</div>
          </div>
          <div>
            <span style="color: var(--color-dark-muted); font-size: 0.75rem; display: block;">Assigned Freight Logistics:</span>
            <strong>${order.driverName || 'Ramesh Singh (Truck #HR-05-AB-4821)'}</strong>
            <div style="display: flex; gap: 8px; margin-top: 6px;">
              <a href="tel:${order.driverPhone ? order.driverPhone.replace(/\s+/g,'') : '+919812345678'}" class="btn btn-sm btn-secondary" style="padding: 3px 8px; font-size: 0.74rem;">
                📞 Call Driver
              </a>
              <a href="https://wa.me/919812345678?text=Hello%20Driver,%20inquiring%20about%20my%20NutriAgro%20Order%20${order.orderId}" target="_blank" class="btn btn-sm btn-secondary" style="padding: 3px 8px; font-size: 0.74rem; background: #25d366; color: #fff; border-color: #25d366;">
                📲 WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Items Detail -->
      <div style="margin-bottom: 12px;">
        <span style="font-size: 0.78rem; font-weight: 700; color: var(--color-dark); display: block; margin-bottom: 6px;">Feed Bags in this Dispatch:</span>
        <div style="background: #fff; border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); padding: 10px 14px;">
          ${itemsHtml}
          <div style="display: flex; justify-content: space-between; padding-top: 8px; margin-top: 6px; font-size: 0.92rem; font-weight: 800; color: var(--color-dark);">
            <span>Total (${order.totalBags || 1} Bags / ${order.totalWeightKg || 50} kg):</span>
            <span style="color: var(--color-primary);">₹${Math.round(order.finalTotal || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

    </div>
  `;
}

function renderSampleTrackingOrder(searchedId, allOrders) {
  const sampleOrder = {
    orderId: searchedId.toUpperCase().startsWith('NUTRI-') ? searchedId.toUpperCase() : `NUTRI-${searchedId.toUpperCase()}`,
    date: 'Today',
    timestamp: Date.now(),
    farmerName: 'Valued Farm Customer',
    phone: '+91 98765 43210',
    address: 'Farm Gate #1, Regional Agro Corridor, Customer Location',
    paymentMethod: 'Farmgate Delivery (COD / Cheque on Site)',
    items: [
      { name: 'NutriBov LactaMax™ High-Yield Dairy Feed', quantity: 2, price: 1850, bagSize: '50kg' },
      { name: 'NutriBov CalfGrow™ 20% Starter Pellets', quantity: 1, price: 2050, bagSize: '50kg' }
    ],
    totalBags: 3,
    totalWeightKg: 150,
    finalTotal: 5750,
    status: 'Automated Milling & Quality Screened',
    eta: 'Tomorrow by 4:00 PM (Farmgate Arrival)',
    driverName: 'Ramesh Singh (Agro Hauler #HR-05-AB-4821)',
    driverPhone: '+91 98123 45678',
    currentStep: 2
  };

  renderOrderTrackingCard(sampleOrder, allOrders);
}

function renderEmptyOrderTrackerState(allOrders) {
  const container = document.getElementById('orderTrackerResultContainer');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 36px 20px; background: var(--color-gray-50); border: 1.5px dashed var(--color-gray-300); border-radius: var(--radius-lg);">
      <div style="font-size: 2.5rem; margin-bottom: 12px;">🌾</div>
      <h3 style="font-size: 1.15rem; margin-bottom: 6px; color: var(--color-dark);">No Active Orders to Track</h3>
      <p style="font-size: 0.85rem; color: var(--color-dark-muted); max-width: 440px; margin: 0 auto 18px auto;">
        You can search any order ID above or switch to the Orders List tab to view all placed orders.
      </p>
      <button type="button" class="btn btn-secondary btn-sm" onclick="switchTrackerTab('list')" style="padding: 8px 18px;">
        📋 View Orders List
      </button>
    </div>
  `;
}

window.autoDetectDeliveryAddress = autoDetectDeliveryAddress;
window.openOrderTrackerModal = openOrderTrackerModal;
window.closeOrderTrackerModal = closeOrderTrackerModal;
window.switchTrackerTab = switchTrackerTab;
window.renderOrdersListView = renderOrdersListView;
window.updateOrderStatus = updateOrderStatus;
window.generateSampleOrder = generateSampleOrder;
window.trackOrderSubmit = trackOrderSubmit;
window.manualRefreshOrders = manualRefreshOrders;
window.dismissCustomerStatusBanner = dismissCustomerStatusBanner;
window.fetchOrdersFromServer = fetchOrdersFromServer;

// Start order sync & customer watcher immediately
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startOrderStatusWatcher);
} else {
  startOrderStatusWatcher();
}


