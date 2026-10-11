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
      status: 'Automated Milling & Quality Screened',
      eta: 'Tomorrow by 4:00 PM (Farmgate Arrival)',
      driverName: 'Ramesh Singh (Agro Hauler #HR-05-AB-4821)',
      driverPhone: '+91 98123 45678',
      currentStep: 2 // 1: Confirmed, 2: Milling, 3: Dispatched, 4: Delivered
    };

    // Store in localStorage for permanent tracking
    try {
      const stored = JSON.parse(localStorage.getItem('nutriagro_orders') || '[]');
      stored.unshift(orderObj);
      localStorage.setItem('nutriagro_orders', JSON.stringify(stored));
    } catch (err) {
      console.warn('Failed saving order to localStorage:', err);
    }

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

    // Clear cart
    window.cart.clearCart();
    window.cart.showToast(`Order #${orderId} Confirmed! We are prepping your batch.`, 'success');
  }, 1200);
}

// ==========================================
// 14. LIVE ORDER TRACKER SYSTEM
// ==========================================
function openOrderTrackerModal(targetOrderId) {
  const modal = document.getElementById('orderTrackerModal');
  const overlay = document.getElementById('modalOverlay');
  if (!modal || !overlay) return;

  // Retrieve stored orders
  let orders = [];
  try {
    orders = JSON.parse(localStorage.getItem('nutriagro_orders') || '[]');
  } catch (e) {
    orders = [];
  }

  const container = document.getElementById('orderTrackerResultContainer');
  const inputEl = document.getElementById('orderTrackerInput');

  if (targetOrderId) {
    if (inputEl) inputEl.value = targetOrderId;
    const match = orders.find(o => o.orderId.toLowerCase() === targetOrderId.toLowerCase());
    if (match) {
      renderOrderTrackingCard(match, orders);
    } else {
      renderSampleTrackingOrder(targetOrderId, orders);
    }
  } else if (orders.length > 0) {
    if (inputEl) inputEl.value = orders[0].orderId;
    renderOrderTrackingCard(orders[0], orders);
  } else {
    renderEmptyOrderTrackerState(orders);
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

function trackOrderSubmit() {
  const input = document.getElementById('orderTrackerInput');
  const query = input ? input.value.trim() : '';

  if (!query) {
    if (window.cart) window.cart.showToast('Please enter an Order ID or Phone number', 'info');
    return;
  }

  let orders = [];
  try {
    orders = JSON.parse(localStorage.getItem('nutriagro_orders') || '[]');
  } catch (e) {
    orders = [];
  }

  const match = orders.find(o => 
    o.orderId.toLowerCase().includes(query.toLowerCase()) || 
    (o.phone && o.phone.replace(/\D/g, '').includes(query.replace(/\D/g, '')))
  );

  if (match) {
    renderOrderTrackingCard(match, orders);
  } else {
    // Render dynamic simulated tracking for valid looking IDs
    renderSampleTrackingOrder(query, orders);
  }
}

function renderOrderTrackingCard(order, allOrders) {
  const container = document.getElementById('orderTrackerResultContainer');
  if (!container) return;

  const currentStep = order.currentStep || 2;
  const statusColor = currentStep >= 3 ? '#10b981' : '#f59e0b';
  const statusBadgeText = currentStep === 1 ? 'Batch Registered' : (currentStep === 2 ? '⚙️ Automated Milling & QA Screen' : (currentStep === 3 ? '🚚 Dispatched on Freight Truck' : '🏡 Delivered to Farm'));

  let itemsHtml = '';
  if (order.items && order.items.length > 0) {
    itemsHtml = order.items.map(it => `
      <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed var(--color-gray-200); font-size: 0.85rem;">
        <span><strong>${it.quantity}×</strong> ${it.name} (${it.bagSize || '50kg'})</span>
        <strong>₹${Math.round(it.price * it.quantity).toLocaleString('en-IN')}</strong>
      </div>
    `).join('');
  } else {
    itemsHtml = `<div style="font-size:0.85rem; color:var(--color-dark-muted);">${order.totalBags} Feed Bags (${order.totalWeightKg} kg)</div>`;
  }

  let historyHtml = '';
  if (allOrders && allOrders.length > 1) {
    historyHtml = `
      <div style="margin-top: 24px; border-top: 1px solid var(--color-gray-200); padding-top: 18px;">
        <h4 style="font-size: 0.95rem; margin-bottom: 12px; color: var(--color-dark);">Your Other Farm Orders:</h4>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${allOrders.filter(o => o.orderId !== order.orderId).map(o => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: #fff; border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); padding: 10px 14px; font-size: 0.84rem;">
              <div>
                <strong>${o.orderId}</strong> · <span style="color:var(--color-dark-muted);">${o.date}</span>
                <div style="font-size: 0.76rem; color: #047857;">${o.totalBags} Bags (₹${Math.round(o.finalTotal).toLocaleString('en-IN')})</div>
              </div>
              <button type="button" class="btn btn-sm btn-secondary" onclick="openOrderTrackerModal('${o.orderId}')" style="padding: 4px 12px; font-size: 0.78rem;">
                Track
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <!-- Active Order Card -->
    <div style="background: #ffffff; border: 1.5px solid var(--color-gray-200); border-radius: var(--radius-lg); box-shadow: var(--shadow-md); padding: 22px; overflow: hidden;">
      
      <!-- Card Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--color-gray-200); padding-bottom: 14px; margin-bottom: 18px;">
        <div>
          <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; color: var(--color-dark-muted);">Order Reference</span>
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--color-primary);">${order.orderId}</div>
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

      <!-- Order Items Detail Accordion -->
      <div style="margin-bottom: 12px;">
        <span style="font-size: 0.78rem; font-weight: 700; color: var(--color-dark); display: block; margin-bottom: 6px;">Feed Bags in this Dispatch:</span>
        <div style="background: #fff; border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); padding: 10px 14px;">
          ${itemsHtml}
          <div style="display: flex; justify-content: space-between; padding-top: 8px; margin-top: 6px; font-size: 0.92rem; font-weight: 800; color: var(--color-dark);">
            <span>Total (${order.totalBags} Bags / ${order.totalWeightKg} kg):</span>
            <span style="color: var(--color-primary);">₹${Math.round(order.finalTotal).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <!-- History of other orders -->
      ${historyHtml}
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
      <h3 style="font-size: 1.15rem; margin-bottom: 6px; color: var(--color-dark);">No Orders Placed Yet on This Browser</h3>
      <p style="font-size: 0.85rem; color: var(--color-dark-muted); max-width: 440px; margin: 0 auto 18px auto;">
        When you place an order in the checkout, your batch will automatically appear here with live GPS freight tracking and milling updates.
      </p>
      <button type="button" class="btn btn-primary btn-sm" onclick="renderSampleTrackingOrder('NUTRI-839201', [])" style="padding: 8px 18px;">
        👁️ View Sample Live Order Tracking
      </button>
    </div>
  `;
}

window.autoDetectDeliveryAddress = autoDetectDeliveryAddress;
window.openOrderTrackerModal = openOrderTrackerModal;
window.closeOrderTrackerModal = closeOrderTrackerModal;
window.trackOrderSubmit = trackOrderSubmit;

