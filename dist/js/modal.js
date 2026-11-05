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

  // Auto-fill details if registered farmer is logged in, or ensure guest isolation
  try {
    const loggedUser = JSON.parse(localStorage.getItem('nutriagro_user') || 'null');
    const nameInput = document.getElementById('checkoutFarmerName');
    const phoneInput = document.getElementById('checkoutPhone');
    const addrInput = document.getElementById('checkoutAddress');

    if (loggedUser) {
      if (nameInput) {
        nameInput.value = loggedUser.fullName || '';
      }
      if (phoneInput) {
        const ph = loggedUser.phone || '';
        phoneInput.value = (ph && ph !== '9876543210') ? ph : '';
      }
      if (addrInput && loggedUser.address) {
        addrInput.value = `${loggedUser.address}, ${loggedUser.state || ''} ${loggedUser.pincode ? '(PIN: ' + loggedUser.pincode + ')' : ''}`.trim();
        const badge = document.getElementById('autoDetectBadge');
        if (badge) {
          badge.textContent = '✓ Saved Farm Profile';
          badge.style.color = '#10b981';
        }
      }
    } else {
      // Guest / Not logged in: Unconditionally clear contact inputs to guarantee complete privacy and zero leakage
      if (nameInput) {
        nameInput.value = '';
      }
      if (phoneInput) {
        phoneInput.value = '';
      }
    }

    // Toggle guest warning banner
    const guestNotice = document.getElementById('checkoutGuestNotice');
    if (guestNotice) {
      guestNotice.style.display = (loggedUser && (loggedUser.email || loggedUser.userId)) ? 'none' : 'flex';
    }
  } catch (e) {}

  // Automatically detect customer delivery address upon opening if still empty
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
    addressInput.readOnly = true;
    addressInput.style.backgroundColor = '#f8fafc';
    addressInput.style.color = '#1e293b';
    addressInput.style.cursor = 'default';
    if (badge) {
      badge.textContent = `🔒 Auto-Detected (${sourceLabel}) · Locked`;
      badge.style.color = '#059669';
    }
    if (status) {
      status.innerHTML = `🔒 <strong>Confirmed Delivery Hub:</strong> ${fullText} <span style="color:#059669; font-weight:600;">(Auto-filled via ${sourceLabel} · Locked)</span>`;
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
  const additionalAddress = (document.getElementById('checkoutAdditionalAddress')?.value || '').trim();
  const fullAddress = additionalAddress ? `${address} | Unloading Point: ${additionalAddress}` : address;
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

  if (!farmerName || !phone || !address) {
    if (window.cart) window.cart.showToast('Please provide your Contact Person, Phone, and Delivery Address', 'error');
    return;
  }

  // 1. Validate 10-digit mobile phone number for freight driver dispatch
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    if (window.cart && window.cart.showToast) {
      window.cart.showToast('Please enter a valid 10-digit phone number for truck driver dispatch', 'error');
    }
    const phoneInput = document.getElementById('checkoutPhone');
    if (phoneInput) phoneInput.focus();
    return;
  }

  // 2. Mandatory Account Verification: Block Guest Order Placement
  let loggedUser = null;
  try {
    loggedUser = JSON.parse(localStorage.getItem('nutriagro_user') || 'null');
  } catch (e) {}

  if (!loggedUser || (!loggedUser.email && !loggedUser.userId)) {
    try {
      sessionStorage.setItem('nutriagro_pending_checkout_order', '1');
    } catch (e) {}

    if (window.cart && window.cart.showToast) {
      window.cart.showToast('🔒 Sign-in required before freight dispatch to confirm your farm destination & unlock 10% OFF.', 'info');
    }

    if (typeof openAccountChooserModal === 'function') {
      openAccountChooserModal(true);
    }
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

    // Detect logged in user to associate order with account
    let loggedUser = null;
    try {
      loggedUser = JSON.parse(localStorage.getItem('nutriagro_user') || 'null');
    } catch (e) {}

    // Immediately sync phone or name update from checkout into user profile and server!
    if (loggedUser) {
      let profileUpdated = false;
      const oldPhone = loggedUser.phone;
      const oldEmail = loggedUser.email;
      if (phone && phone !== loggedUser.phone) {
        loggedUser.phone = phone;
        profileUpdated = true;
      }
      if (farmerName && farmerName !== loggedUser.fullName) {
        loggedUser.fullName = farmerName;
        profileUpdated = true;
      }
      if (profileUpdated) {
        loggedUser.updatedAt = new Date().toISOString();
        localStorage.setItem('nutriagro_user', JSON.stringify(loggedUser));

        let usersList = JSON.parse(localStorage.getItem('nutriagro_users_list') || '[]');
        const uIdx = usersList.findIndex(u => 
          (u.userId && loggedUser.userId && u.userId === loggedUser.userId) || 
          (u.email && loggedUser.email && u.email.toLowerCase() === loggedUser.email.toLowerCase()) ||
          (oldPhone && u.phone && u.phone === oldPhone)
        );
        if (uIdx >= 0) {
          usersList[uIdx] = { ...usersList[uIdx], ...loggedUser };
        } else {
          usersList.unshift(loggedUser);
        }
        localStorage.setItem('nutriagro_users_list', JSON.stringify(usersList));

        // Sync to serverless API
        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update_profile', ...loggedUser, oldPhone, oldEmail })
        }).catch(() => {});

        // Broadcast to admin portal tab
        try {
          if (typeof BroadcastChannel !== 'undefined') {
            const ch = new BroadcastChannel('nutriagro_orders_channel');
            ch.postMessage({ type: 'PROFILE_UPDATED', user: loggedUser });
          }
        } catch (e) {}

        if (typeof updateHeaderUserStatus === 'function') {
          updateHeaderUserStatus();
        }
      }
    }

    const orderUserEmail = (loggedUser && loggedUser.email) ? loggedUser.email : (document.getElementById('checkoutEmail')?.value || '').trim();
    const orderUserId = (loggedUser && loggedUser.userId) ? loggedUser.userId : '';

    // Build order object for tracking
    const orderObj = {
      orderId: orderId,
      userId: orderUserId,
      userEmail: orderUserEmail,
      date: dateStr,
      timestamp: Date.now(),
      farmerName: farmerName,
      phone: phone,
      address: fullAddress,
      gpsAddress: address,
      additionalAddress: additionalAddress,
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
      status: 'Pending Admin Review',
      adminApproval: 'pending',
      rejectionReason: '',
      eta: 'Pending Admin Review',
      driverName: 'Ramesh Singh (Agro Hauler #HR-05-AB-4821)',
      driverPhone: '+91 98123 45678',
      currentStep: 0 // 0: Pending Review, 1: Confirmed & Logged, 2: Milling, 3: Dispatched, 4: Delivered
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
    document.getElementById('confirmDeliveryAddress').textContent = fullAddress;
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

/**
 * Strictly scopes orders to the authenticated customer account.
 * Under no circumstances does this ever return another customer's orders.
 */
function getMyCustomerOrders(allOrders) {
  const orders = Array.isArray(allOrders) ? allOrders : getStoredOrders();
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem('nutriagro_user') || 'null');
  } catch (e) {}

  if (currentUser && (currentUser.email || currentUser.userId || currentUser.phone)) {
    const userEmail = (currentUser.email || '').toLowerCase().trim();
    const userId = (currentUser.userId || '').toLowerCase().trim();
    const userPhone = (currentUser.phone || '').replace(/\D/g, '');

    return orders.filter(o => {
      if (!o || !o.orderId) return false;
      const orderEmail = (o.userEmail || o.email || '').toLowerCase().trim();
      const orderUserId = (o.userId || '').toLowerCase().trim();
      const orderPhone = (o.phone || '').replace(/\D/g, '');

      // 1. Primary match: Email address
      if (userEmail && orderEmail && userEmail === orderEmail) {
        return true;
      }
      // 2. Primary match: Account User ID
      if (userId && orderUserId && userId === orderUserId) {
        return true;
      }
      // 3. Verified Phone Number (10 digits)
      if (userPhone.length >= 10 && orderPhone.length >= 10 && userPhone.slice(-10) === orderPhone.slice(-10)) {
        // Guard against cross-account collisions: if order is linked to a different email, do NOT match
        if (orderEmail && userEmail && orderEmail !== userEmail) {
          return false;
        }
        return true;
      }
      return false;
    });
  }

  // Guest Visitor (Not Signed In): Only orders placed from this browser device
  const guestOrderIds = JSON.parse(localStorage.getItem('nutriagro_my_order_ids') || '[]');
  const latestGuestId = localStorage.getItem('nutriagro_my_latest_order_id');
  if (latestGuestId && !guestOrderIds.includes(latestGuestId)) {
    guestOrderIds.push(latestGuestId);
  }

  if (guestOrderIds.length === 0) {
    return [];
  }

  return orders.filter(o => {
    if (!o || !o.orderId) return false;
    return guestOrderIds.includes(o.orderId);
  });
}

function getUserOrderCount() {
  try {
    const all = getStoredOrders();
    return getMyCustomerOrders(all).length;
  } catch (e) {
    return 0;
  }
}

function updateAllOrderBadges(count) {
  const c = typeof count === 'number' ? count : getUserOrderCount();
  
  const headerBadge = document.getElementById('headerOrdersCountBadge');
  if (headerBadge) {
    headerBadge.textContent = c;
    headerBadge.style.display = c > 0 ? 'inline-block' : 'none';
  }

  const dropdownBadge = document.getElementById('dropdownOrdersCountBadge');
  if (dropdownBadge) {
    dropdownBadge.textContent = c;
    dropdownBadge.style.display = c > 0 ? 'inline-block' : 'none';
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

  const drawerBadge = document.getElementById('mobileDrawerOrdersCountBadge');
  if (drawerBadge) {
    drawerBadge.textContent = c;
    drawerBadge.style.display = c > 0 ? 'inline-block' : 'none';
  }
}

const FIREBASE_RTDB_ORDERS_URL = 'https://nutriagro-feeds-default-rtdb.firebaseio.com/orders';

function integrateOrderIntoLocalStore(orderData) {
  if (!orderData || !orderData.orderId) return;
  const deletedIds = getDeletedOrderIds();
  if (deletedIds.has(String(orderData.orderId).toLowerCase())) return;

  const local = getStoredOrders();
  const existingIdx = local.findIndex(o => o.orderId && o.orderId.toLowerCase() === orderData.orderId.toLowerCase());
  if (existingIdx !== -1) {
    local[existingIdx] = Object.assign({}, local[existingIdx], orderData);
  } else {
    local.unshift(orderData);
  }
  local.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  localStorage.setItem('nutriagro_orders', JSON.stringify(local));

  // If this device placed or tracked this order as guest, ensure ID is recorded
  const myOrderIds = JSON.parse(localStorage.getItem('nutriagro_my_order_ids') || '[]');
  if (!myOrderIds.includes(orderData.orderId)) {
    myOrderIds.unshift(orderData.orderId);
    localStorage.setItem('nutriagro_my_order_ids', JSON.stringify(myOrderIds));
  }

  updateAllOrderBadges();
  checkCustomerOrderStatusChanges(local);
}

async function fetchSingleOrderLive(orderId) {
  if (!orderId) return null;
  const cleanId = orderId.trim();
  const deletedIds = getDeletedOrderIds();
  if (deletedIds.has(cleanId.toLowerCase())) return null;

  // 1. Ultra-fast direct fetch from Firebase Cloud Realtime Database (Single Document)
  try {
    const fbRes = await fetch(`${FIREBASE_RTDB_ORDERS_URL}/${encodeURIComponent(cleanId)}.json?_t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store'
    });
    if (fbRes.ok) {
      const orderData = await fbRes.json();
      if (orderData && orderData.orderId) {
        integrateOrderIntoLocalStore(orderData);
        return orderData;
      }
    }
  } catch (fbErr) {}

  // 2. Fallback fetch from /api/orders?id=...
  try {
    const apiRes = await fetch(`${getOrdersApiEndpoint()}?id=${encodeURIComponent(cleanId)}&_t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store'
    });
    if (apiRes.ok) {
      const apiData = await apiRes.json();
      if (apiData && apiData.orderId) {
        integrateOrderIntoLocalStore(apiData);
        return apiData;
      }
    }
  } catch (apiErr) {}

  return null;
}

async function fetchOrdersFromServer(callback) {
  const deletedIds = getDeletedOrderIds();
  let serverOrders = null;

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
        serverOrders = list.filter(o => 
          o && o.orderId && 
          !o.action && 
          (o.farmerName || o.items || o.finalTotal) && 
          !deletedIds.has(String(o.orderId).toLowerCase())
        );
      }
    }
  } catch (fbErr) {}

  // 2. Fallback to /api/orders endpoint
  if (!serverOrders || serverOrders.length === 0) {
    try {
      const res = await fetch(getOrdersApiEndpoint() + '?_t=' + Date.now(), {
        method: 'GET',
        cache: 'no-store',
        headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache, no-store' }
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) {
          serverOrders = json.filter(o => 
            o && o.orderId && 
            !o.action && 
            (o.farmerName || o.items || o.finalTotal) && 
            !deletedIds.has(String(o.orderId).toLowerCase())
          );
        }
      }
    } catch (err) {}
  }

  if (serverOrders) {
    // Intelligently merge: start with local cache, overlay all server updates
    const local = getStoredOrders();
    const orderMap = new Map();
    local.forEach(o => {
      if (o && o.orderId && !deletedIds.has(String(o.orderId).toLowerCase())) {
        orderMap.set(o.orderId.toLowerCase(), o);
      }
    });
    serverOrders.forEach(so => {
      const key = so.orderId.toLowerCase();
      const existing = orderMap.get(key);
      if (existing) {
        orderMap.set(key, Object.assign({}, existing, so));
      } else {
        orderMap.set(key, so);
      }
    });
    const merged = Array.from(orderMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    localStorage.setItem('nutriagro_orders', JSON.stringify(merged));
    updateAllOrderBadges();
    checkCustomerOrderStatusChanges(merged);
    refreshOpenTrackerModalUI(merged);
    if (typeof callback === 'function') callback(merged);
    return merged;
  }

  const current = getStoredOrders();
  updateAllOrderBadges();
  if (typeof callback === 'function') callback(current);
  return current;
}

async function saveOrder(orderObj) {
  try {
    const local = getStoredOrders();
    local.unshift(orderObj);
    localStorage.setItem('nutriagro_orders', JSON.stringify(local));
    localStorage.setItem('nutriagro_last_order_timestamp', String(Date.now()));

    // Record order ID to user's device history
    const myOrderIds = JSON.parse(localStorage.getItem('nutriagro_my_order_ids') || '[]');
    if (!myOrderIds.includes(orderObj.orderId)) {
      myOrderIds.unshift(orderObj.orderId);
      localStorage.setItem('nutriagro_my_order_ids', JSON.stringify(myOrderIds));
    }

    localStorage.setItem('nutriagro_my_latest_order_id', orderObj.orderId);
    localStorage.setItem('nutriagro_tracked_status_' + orderObj.orderId, JSON.stringify({
      currentStep: orderObj.currentStep !== undefined ? orderObj.currentStep : 0,
      status: orderObj.status || 'Pending Admin Review',
      adminApproval: orderObj.adminApproval || 'pending'
    }));

    updateAllOrderBadges();

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
  if (step >= 1) match.adminApproval = 'accepted';
  if (step === 1) {
    match.status = 'Order confirmed';
    match.eta = (match.eta && match.eta !== 'Pending Admin Review') ? match.eta : 'Tomorrow by 4:00 PM (Farmgate Arrival)';
  } else if (step === 2) {
    match.status = 'Packing';
    match.eta = (match.eta && match.eta !== 'Pending Admin Review') ? match.eta : 'Tomorrow by 4:00 PM (Farmgate Arrival)';
  } else if (step === 3) {
    match.status = 'Dispatch';
    match.eta = 'Out for Farmgate Delivery (Today by 6:00 PM)';
  } else if (step === 4) {
    match.status = 'Delivered';
    match.eta = 'Delivered at Farmgate';
  }
  match.lastUpdated = new Date().toISOString();

  localStorage.setItem('nutriagro_orders', JSON.stringify(orders));

  try {
    fetch(`${FIREBASE_RTDB_ORDERS_URL}/${encodeURIComponent(orderId)}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminApproval: match.adminApproval,
        currentStep: step,
        status: match.status,
        eta: match.eta,
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
        adminApproval: match.adminApproval,
        currentStep: step,
        status: match.status,
        eta: match.eta
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

function getCustomerNotifications() {
  try {
    return JSON.parse(localStorage.getItem('nutri_customer_notifs') || '[]');
  } catch (e) {
    return [];
  }
}

function saveCustomerNotification(notif) {
  try {
    const list = getCustomerNotifications();
    list.unshift(notif);
    // Keep last 15 notifications
    const trimmed = list.slice(0, 15);
    localStorage.setItem('nutri_customer_notifs', JSON.stringify(trimmed));
    renderCustomerNotificationsDropdown();
    updateNotifDot(true);
  } catch (e) {}
}

function updateNotifDot(hasUnread) {
  const dot = document.getElementById('headerNotifGlowDot');
  if (dot) {
    dot.style.display = hasUnread ? 'block' : 'none';
  }
}

function clearCustomerNotifs() {
  localStorage.setItem('nutri_customer_notifs', '[]');
  renderCustomerNotificationsDropdown();
  updateNotifDot(false);
}

function toggleCustomerNotifDropdown() {
  const dd = document.getElementById('customerNotifDropdown');
  if (!dd) return;
  const isOpening = !dd.classList.contains('active');
  dd.classList.toggle('active', isOpening);
  if (isOpening) {
    updateNotifDot(false);
    renderCustomerNotificationsDropdown();
  }
}

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  const wrapper = document.getElementById('headerNotifWrapper');
  const dd = document.getElementById('customerNotifDropdown');
  if (dd && wrapper && !wrapper.contains(e.target)) {
    dd.classList.remove('active');
  }
});

function renderCustomerNotificationsDropdown() {
  const listEl = document.getElementById('customerNotifList');
  if (!listEl) return;
  const notifs = getCustomerNotifications();

  if (notifs.length === 0) {
    listEl.innerHTML = `
      <div class="notif-empty-state">
        <span>🌾</span>
        <p>No new order updates right now. When the mill updates your stage, you'll be alerted here!</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = notifs.map(n => `
    <div class="notif-item-card" onclick="openOrderTrackerModal('${n.orderId}'); toggleCustomerNotifDropdown();">
      <div class="notif-item-title">
        <span>#${n.orderId}</span>
        <span style="font-size: 0.72rem; color: #78350f;">${n.time || 'Just now'}</span>
      </div>
      <div class="notif-item-desc">
        ${n.message || `Order status updated to: ${n.status}`}
      </div>
    </div>
  `).join('');
}

function showCustomerStatusNotificationBanner(order) {
  const isAcceptedNow = order.adminApproval === 'accepted' || (order.currentStep !== undefined && order.currentStep >= 1);
  const isPendingNow = !isAcceptedNow && (order.adminApproval === 'pending' || order.currentStep === 0);
  const isRejectedNow = order.adminApproval === 'rejected' || order.currentStep === -1;

  let bannerIcon = '🔔';
  let bannerTitle = 'Order Status Updated by NutriAgro Mill!';
  let bannerDetail = `Your Order <strong>#${order.orderId}</strong> is now: <span class="status-badge-inline">${order.status || 'Updated'}</span>`;

  if (isAcceptedNow && (order.currentStep === 1 || !order.currentStep)) {
    bannerIcon = '🎉';
    bannerTitle = '🎉 Order Accepted & Confirmed by NutriAgro Mill!';
    bannerDetail = `Great news! Your Order <strong>#${order.orderId}</strong> has been accepted. Automated batching & milling has begun!`;
  } else if (isRejectedNow) {
    bannerIcon = '⚠️';
    bannerTitle = 'Order Review Notice from NutriAgro Mill';
    bannerDetail = `Order <strong>#${order.orderId}</strong> was declined: ${order.rejectionReason || 'Please contact dispatch'}`;
  }

  // Add to notification center history
  saveCustomerNotification({
    orderId: order.orderId,
    status: order.status,
    message: isAcceptedNow && (order.currentStep === 1 || !order.currentStep)
      ? `Order #${order.orderId} accepted by Mill Manager. Automated milling in progress.`
      : `Stage updated to: "${order.status}". Freight hauler: ${order.driverName || 'Ramesh Singh'}.`,
    time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  });

  let banner = document.getElementById('customerStatusNotificationBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'customerStatusNotificationBanner';
    banner.className = 'customer-status-alert-banner';
    document.body.appendChild(banner);
  }

  banner.innerHTML = `
    <div class="status-alert-left">
      <span class="status-alert-icon">${bannerIcon}</span>
      <div>
        <div class="status-alert-title">${bannerTitle}</div>
        <div class="status-alert-detail">${bannerDetail}</div>
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
      new Notification(bannerTitle, {
        body: isAcceptedNow ? `Order #${order.orderId} has been accepted by NutriAgro Mill!` : `Your Order #${order.orderId} status: ${order.status}`,
        icon: 'assets/images/agro-logo.jpg'
      });
    } catch (e) {}
  }
}

function dismissCustomerStatusBanner() {
  const banner = document.getElementById('customerStatusNotificationBanner');
  if (banner) banner.style.display = 'none';
}

function refreshOpenTrackerModalUI(orders) {
  const trackerModal = document.getElementById('orderTrackerModal');
  if (!trackerModal || !trackerModal.classList.contains('active')) return;

  const allOrders = Array.isArray(orders) ? orders : getStoredOrders();
  const myOrders = getMyCustomerOrders(allOrders);

  const listTab = document.getElementById('trackerOrdersListTab');
  const trackingTab = document.getElementById('trackerLiveTrackingTab');

  if (trackingTab && trackingTab.style.display !== 'none') {
    const inputEl = document.getElementById('orderTrackerInput');
    const targetId = (inputEl && inputEl.value.trim()) || localStorage.getItem('nutriagro_my_latest_order_id') || (myOrders[0] && myOrders[0].orderId);
    if (targetId) {
      const match = myOrders.find(o => o.orderId && o.orderId.toLowerCase() === targetId.toLowerCase()) ||
                    allOrders.find(o => o.orderId && o.orderId.toLowerCase() === targetId.toLowerCase());
      if (match) {
        renderOrderTrackingCard(match, myOrders);
      }
    }
  } else if (listTab && listTab.style.display !== 'none') {
    renderOrdersListView(allOrders);
  }
}

function checkCustomerOrderStatusChanges(allOrders) {
  const myOrders = getMyCustomerOrders(allOrders);
  if (!myOrders || myOrders.length === 0) return;

  const myOrderId = localStorage.getItem('nutriagro_my_latest_order_id') || myOrders[0].orderId;
  if (!myOrderId) return;

  // Strictly verify the order belongs to this customer account
  const match = myOrders.find(o => o.orderId && o.orderId.toLowerCase() === myOrderId.toLowerCase());
  if (!match) return;

  const key = 'nutriagro_tracked_status_' + match.orderId;
  let prev = null;
  try {
    const raw = localStorage.getItem(key);
    if (raw) prev = JSON.parse(raw);
  } catch (e) {}

  const currentStep = match.currentStep !== undefined ? match.currentStep : (match.adminApproval === 'accepted' ? 1 : 0);
  const currentStatus = match.status || (match.adminApproval === 'accepted' ? 'Order confirmed' : 'Pending Admin Review');
  const currentApproval = match.adminApproval || (currentStep >= 1 ? 'accepted' : 'pending');

  if (prev) {
    const prevStep = prev.currentStep !== undefined ? prev.currentStep : null;
    const prevStatus = prev.status || null;
    const prevApproval = prev.adminApproval || null;

    const hasChanged = (prevStep !== null && prevStep !== currentStep) ||
                       (prevStatus !== null && prevStatus !== currentStatus) ||
                       (prevApproval !== null && prevApproval !== currentApproval);

    if (hasChanged) {
      localStorage.setItem(key, JSON.stringify({
        currentStep: currentStep,
        status: currentStatus,
        adminApproval: currentApproval
      }));

      playNotificationChime();
      showCustomerStatusNotificationBanner(match);
      refreshOpenTrackerModalUI(allOrders);
    }
  } else {
    // Initial tracking record saved
    localStorage.setItem(key, JSON.stringify({
      currentStep: currentStep,
      status: currentStatus,
      adminApproval: currentApproval
    }));
  }
}

let statusWatcherTimer = null;
let firebaseEventSource = null;
let activeTrackerPollTimer = null;

async function refreshActiveDisplayedOrderLive() {
  const trackerModal = document.getElementById('orderTrackerModal');
  if (!trackerModal || !trackerModal.classList.contains('active')) return;
  const trackingTab = document.getElementById('trackerLiveTrackingTab');
  if (!trackingTab || trackingTab.style.display === 'none') return;

  const inputEl = document.getElementById('orderTrackerInput');
  const targetId = (inputEl && inputEl.value.trim()) || localStorage.getItem('nutriagro_my_latest_order_id');
  if (!targetId) return;

  try {
    const fresh = await fetchSingleOrderLive(targetId);
    if (fresh) {
      const all = getStoredOrders();
      const my = getMyCustomerOrders(all);
      renderOrderTrackingCard(fresh, my, false);
    }
  } catch (e) {}
}

function startActiveTrackerLivePolling() {
  stopActiveTrackerLivePolling();
  activeTrackerPollTimer = setInterval(() => {
    refreshActiveDisplayedOrderLive();
  }, 1800);
}

function stopActiveTrackerLivePolling() {
  if (activeTrackerPollTimer) {
    clearInterval(activeTrackerPollTimer);
    activeTrackerPollTimer = null;
  }
}

function startOrderStatusWatcher() {
  if (statusWatcherTimer) clearInterval(statusWatcherTimer);
  fetchOrdersFromServer();

  // Fast poll fallback (every 2.5s) to guarantee zero missed updates across tabs & mobile
  statusWatcherTimer = setInterval(() => {
    fetchOrdersFromServer();
  }, 2500);

  // Tab visibility & mobile phone wakeup: fetch instantly when customer unminimizes browser
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      fetchOrdersFromServer();
      refreshActiveDisplayedOrderLive();
    }
  });
  window.addEventListener('focus', () => {
    fetchOrdersFromServer();
    refreshActiveDisplayedOrderLive();
  });

  // Cross-tab Instant Sync via BroadcastChannel (Same Device / Browser Tabs)
  try {
    if (typeof BroadcastChannel !== 'undefined' && !window._nutriagroOrdersChannel) {
      window._nutriagroOrdersChannel = new BroadcastChannel('nutriagro_orders_channel');
      window._nutriagroOrdersChannel.onmessage = (event) => {
        const data = event.data;
        if (data && (data.type === 'ORDER_ACCEPTED' || data.type === 'STATUS_UPDATED' || data.type === 'NEW_ORDER' || data.type === 'ORDER_REJECTED')) {
          if (data.orderId) {
            fetchSingleOrderLive(data.orderId).then(() => {
              refreshActiveDisplayedOrderLive();
            });
          }
          fetchOrdersFromServer();
        }
      };
    }
  } catch (bcErr) {}

  // Real-time Firebase Server-Sent Events (SSE) Stream for 0ms Instant Push across Mobile & PC
  try {
    if (typeof EventSource !== 'undefined' && !firebaseEventSource) {
      firebaseEventSource = new EventSource(`${FIREBASE_RTDB_ORDERS_URL}.json`);
      firebaseEventSource.addEventListener('put', (event) => {
        try {
          fetchOrdersFromServer();
          refreshActiveDisplayedOrderLive();
        } catch (e) {}
      });
      firebaseEventSource.addEventListener('patch', (event) => {
        try {
          fetchOrdersFromServer();
          refreshActiveDisplayedOrderLive();
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

  // Background refresh full orders list immediately
  fetchOrdersFromServer();

  const allOrders = getStoredOrders();
  const myOrders = getMyCustomerOrders(allOrders);
  const countBadge = document.getElementById('ordersCountBadge');
  if (countBadge) countBadge.textContent = myOrders.length;

  if (targetOrderId) {
    // If a specific order ID was requested (e.g. from checkout or direct track button)
    switchTrackerTab('tracking');
    const inputEl = document.getElementById('orderTrackerInput');
    if (inputEl) inputEl.value = targetOrderId;
    const match = myOrders.find(o => o.orderId && o.orderId.toLowerCase() === targetOrderId.toLowerCase()) ||
                  allOrders.find(o => o.orderId && o.orderId.toLowerCase() === targetOrderId.toLowerCase());
    if (match) {
      renderOrderTrackingCard(match, myOrders, true);
    } else {
      const container = document.getElementById('orderTrackerResultContainer');
      if (container) {
        container.innerHTML = `
          <div style="background: #ffffff; border: 1.5px solid var(--color-gray-200); border-radius: var(--radius-lg); padding: 32px 20px; text-align: center;">
            <div style="font-size: 2.2rem; margin-bottom: 10px;">🛰️</div>
            <div style="font-size: 1.05rem; font-weight: 800; color: var(--color-primary); margin-bottom: 4px;">Connecting to Mill Satellite Logistics...</div>
            <div style="font-size: 0.82rem; color: var(--color-dark-muted);">Retrieving live mill dispatch for <strong>#${targetOrderId}</strong></div>
          </div>
        `;
      }
    }

    // Direct Real-time Cloud Fetch
    fetchSingleOrderLive(targetOrderId).then(fresh => {
      if (fresh) {
        const upAll = getStoredOrders();
        const upMy = getMyCustomerOrders(upAll);
        renderOrderTrackingCard(fresh, upMy, false);
      } else if (!match) {
        renderOrderNotFoundCard(targetOrderId);
      }
    });
  } else {
    // Default when opening from navigation menu: Open the Customer Orders List!
    switchTrackerTab('list');
  }

  modal.classList.add('active');
  overlay.classList.add('active');
  document.body.classList.add('modal-open');

  startActiveTrackerLivePolling();
}

function closeOrderTrackerModal() {
  const modal = document.getElementById('orderTrackerModal');
  const overlay = document.getElementById('modalOverlay');
  if (modal) modal.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
  document.body.classList.remove('modal-open');
  stopActiveTrackerLivePolling();
}

function switchTrackerTab(tabName) {
  const listTab = document.getElementById('trackerOrdersListTab');
  const trackingTab = document.getElementById('trackerLiveTrackingTab');
  const btnList = document.getElementById('tabBtnOrdersList');
  const btnTracking = document.getElementById('tabBtnLiveTracking');
  const allOrders = getStoredOrders();
  const myOrders = getMyCustomerOrders(allOrders);

  const countBadge = document.getElementById('ordersCountBadge');
  if (countBadge) countBadge.textContent = myOrders.length;

  if (tabName === 'list') {
    stopActiveTrackerLivePolling();
    if (listTab) listTab.style.display = 'block';
    if (trackingTab) trackingTab.style.display = 'none';
    if (btnList) btnList.classList.add('active');
    if (btnTracking) btnTracking.classList.remove('active');
    renderOrdersListView(allOrders);
  } else {
    if (listTab) listTab.style.display = 'none';
    if (trackingTab) trackingTab.style.display = 'block';
    if (btnList) btnList.classList.remove('active');
    if (btnTracking) btnTracking.classList.add('active');
    
    // For live tracking: auto-load this customer's own order
    const container = document.getElementById('orderTrackerResultContainer');
    const inputEl = document.getElementById('orderTrackerInput');
    const currentInputVal = inputEl ? inputEl.value.trim().toLowerCase() : '';
    const activeTarget = currentInputVal || (myOrders[0] ? myOrders[0].orderId : '') || localStorage.getItem('nutriagro_my_latest_order_id');

    if (activeTarget) {
      if (inputEl) inputEl.value = activeTarget;
      const match = myOrders.find(o => o.orderId && o.orderId.toLowerCase() === activeTarget.toLowerCase()) ||
                    allOrders.find(o => o.orderId && o.orderId.toLowerCase() === activeTarget.toLowerCase());
      if (match) {
        renderOrderTrackingCard(match, myOrders, true);
      }
      fetchSingleOrderLive(activeTarget).then(fresh => {
        if (fresh) {
          const upAll = getStoredOrders();
          const upMy = getMyCustomerOrders(upAll);
          renderOrderTrackingCard(fresh, upMy, false);
        }
      });
    } else {
      if (inputEl) inputEl.value = '';
      renderEmptyOrderTrackerState(myOrders);
    }

    startActiveTrackerLivePolling();
  }
}

function renderOrdersListView(orders, searchQuery = '') {
  const listContainer = document.getElementById('trackerOrdersListTab');
  if (!listContainer) return;

  const allOrders = Array.isArray(orders) ? orders : getStoredOrders();
  const accountOrders = getMyCustomerOrders(allOrders);

  // Retrieve active logged in user
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem('nutriagro_user') || 'null');
  } catch (e) {}

  // Active orders strictly scoped to this user only - Never expose other customers' orders!
  const activeOrders = accountOrders;

  // Sync count badges to this user's orders
  const countBadge = document.getElementById('ordersCountBadge');
  if (countBadge) {
    countBadge.textContent = accountOrders.length;
  }
  updateAllOrderBadges(accountOrders.length);
  if (countBadge) {
    countBadge.textContent = accountOrders.length;
  }
  updateAllOrderBadges(accountOrders.length);

  // Filter by search query if provided
  let filteredOrders = activeOrders;
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filteredOrders = activeOrders.filter(o => 
      (o.orderId && o.orderId.toLowerCase().includes(q)) ||
      (o.farmerName && o.farmerName.toLowerCase().includes(q)) ||
      (o.phone && o.phone.toLowerCase().includes(q)) ||
      (o.address && o.address.toLowerCase().includes(q)) ||
      (o.userEmail && o.userEmail.toLowerCase().includes(q))
    );
  }

  // Calculate totals for active list
  const totalBags = filteredOrders.reduce((sum, o) => sum + (o.totalBags || 1), 0);
  const totalAmount = filteredOrders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);

  // 1. Account / Sign-In Status Banner
  let accountBannerHtml = '';
  if (currentUser && currentUser.email) {
    accountBannerHtml = `
      <div style="background: linear-gradient(135deg, rgba(18, 77, 50, 0.08) 0%, rgba(226, 146, 13, 0.08) 100%); border: 1.5px solid rgba(18, 77, 50, 0.22); border-radius: var(--radius-md); padding: 14px 18px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 42px; height: 42px; border-radius: 50%; background: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; flex-shrink: 0; box-shadow: 0 4px 10px rgba(18,77,50,0.25);">
            ${(currentUser.fullName ? currentUser.fullName.charAt(0) : currentUser.email.charAt(0)).toUpperCase()}
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <strong style="font-size: 0.98rem; color: var(--color-dark);">${currentUser.fullName || 'Farmer Account'}</strong>
              <span style="font-size: 0.72rem; font-weight: 800; background: var(--color-primary); color: #fff; padding: 2px 8px; border-radius: 9999px;">✓ Signed In</span>
            </div>
            <div style="font-size: 0.8rem; color: var(--color-dark-muted); margin-top: 2px;">
              <span>✉️ ${currentUser.email}</span>
              ${currentUser.phone ? ` · <span>📞 +91 ${currentUser.phone}</span>` : ''}
              ${currentUser.farmName ? ` · <span>🚜 ${currentUser.farmName}</span>` : ''}
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="background: rgba(18,77,50,0.12); color: var(--color-primary); font-weight: 700; font-size: 0.82rem; padding: 6px 14px; border-radius: var(--radius-full); border: 1px solid rgba(18,77,50,0.2);">
            📦 My Account Orders (${accountOrders.length})
          </span>
        </div>
      </div>
    `;
  } else {
    accountBannerHtml = `
      <div style="background: #fff8eb; border: 1.5px solid var(--color-accent-gold); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.4rem;">🔑</span>
          <div>
            <div style="font-weight: 700; font-size: 0.9rem; color: var(--color-dark);">Sign in to view your orders automatically</div>
            <div style="font-size: 0.78rem; color: var(--color-dark-muted);">All feed shipments placed under your account will be securely tracked in your private portal.</div>
          </div>
        </div>
        <button type="button" onclick="closeOrderTrackerModal(); handleHeaderAccountClick();" class="btn btn-sm btn-primary" style="padding: 7px 16px; font-size: 0.82rem; font-weight: 700;">
          Sign In / Create Account →
        </button>
      </div>
    `;
  }

  // 2. Empty State Handling
  let ordersCardsHtml = '';
  if (accountOrders.length === 0) {
    if (currentUser) {
      ordersCardsHtml = `
        <div style="text-align: center; padding: 42px 20px; background: var(--color-gray-50); border: 1.5px dashed var(--color-gray-300); border-radius: var(--radius-lg);">
          <div style="font-size: 3rem; margin-bottom: 12px;">🌾</div>
          <h3 style="font-size: 1.25rem; margin-bottom: 6px; color: var(--color-dark);">No Orders Placed Yet</h3>
          <p style="font-size: 0.88rem; color: var(--color-dark-muted); max-width: 480px; margin: 0 auto 20px auto; line-height: 1.5;">
            You are signed in as <strong>${currentUser.fullName || currentUser.email}</strong>. Once you checkout an order from the feed catalog, it will automatically appear right here with real-time tracking, automated milling status, and delivery ETA.
          </p>
          <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button type="button" class="btn btn-primary" onclick="closeOrderTrackerModal(); window.location.hash = '#feedCatalogSection';" style="padding: 10px 24px; font-weight: 700;">
              🛒 Explore Feed Catalog
            </button>
          </div>
        </div>
      `;
    } else {
      ordersCardsHtml = `
        <div style="text-align: center; padding: 36px 20px; background: var(--color-gray-50); border: 1.5px dashed var(--color-gray-300); border-radius: var(--radius-lg);">
          <div style="font-size: 2.8rem; margin-bottom: 10px;">📦</div>
          <h3 style="font-size: 1.2rem; margin-bottom: 6px; color: var(--color-dark);">Track Your Livestock Feed Order</h3>
          <p style="font-size: 0.86rem; color: var(--color-dark-muted); max-width: 460px; margin: 0 auto 16px auto; line-height: 1.5;">
            Sign in to view your orders automatically, or enter your Order ID or registered phone number below to track a single order:
          </p>
          <div style="display: flex; gap: 8px; max-width: 420px; margin: 0 auto 16px auto;">
            <input type="text" id="guestTrackInput" class="calc-input" placeholder="e.g. NUTRI-152932 or 10-digit Phone..." style="margin: 0; padding: 10px 14px; font-size: 0.9rem;" onkeydown="if(event.key==='Enter') lookupSingleOrderAsGuest()" />
            <button type="button" class="btn btn-primary" onclick="lookupSingleOrderAsGuest()" style="white-space: nowrap; padding: 0 20px; font-weight: 700;">
              Track
            </button>
          </div>
          <div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="closeOrderTrackerModal(); handleHeaderAccountClick();" style="padding: 6px 16px; font-size: 0.82rem;">
              🔑 Sign In to Your Account
            </button>
          </div>
        </div>
      `;
    }
  } else if (filteredOrders.length === 0) {
    ordersCardsHtml = `
      <div style="text-align:center; padding:32px 20px; color:var(--color-dark-muted); background:#f8fafc; border-radius:var(--radius-md); border:1.5px dashed var(--color-gray-300);">
        <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
        <p>No orders in your account match "<strong>${searchQuery}</strong>".</p>
        <button type="button" onclick="renderOrdersListView(getStoredOrders(), '')" style="background:none; border:none; color:var(--color-primary); font-weight:700; cursor:pointer; text-decoration:underline; margin-top: 6px;">Clear search filter</button>
      </div>
    `;
  } else {
    ordersCardsHtml = filteredOrders.map(order => {
      const isRejected = order.adminApproval === 'rejected' || order.currentStep === -1;
      const isAccepted = !isRejected && (order.adminApproval === 'accepted' || (order.currentStep !== undefined && order.currentStep >= 1));
      const isPending = !isRejected && !isAccepted;
      const step = isPending ? 0 : (isRejected ? -1 : (order.currentStep || 1));
      let statusBadge = '';
      if (isPending) {
        statusBadge = '<span style="background:rgba(245,158,11,0.15); color:#d97706; border:1px solid rgba(245,158,11,0.35); padding:4px 10px; border-radius:14px; font-size:0.76rem; font-weight:800;">⏳ Awaiting Mill Acceptance</span>';
      } else if (isRejected) {
        statusBadge = '<span style="background:rgba(239,68,68,0.15); color:#dc2626; border:1px solid rgba(239,68,68,0.35); padding:4px 10px; border-radius:14px; font-size:0.76rem; font-weight:800;">✕ Order Rejected</span>';
      } else {
        statusBadge = step === 1 
          ? '<span style="background:rgba(59,130,246,0.15); color:#2563eb; border:1px solid rgba(59,130,246,0.3); padding:4px 10px; border-radius:14px; font-size:0.76rem; font-weight:700;">🌾 1. Order confirmed</span>'
          : (step === 2 
            ? '<span style="background:rgba(245,158,11,0.15); color:#d97706; border:1px solid rgba(245,158,11,0.3); padding:4px 10px; border-radius:14px; font-size:0.76rem; font-weight:700;">📦 2. Packing</span>'
            : (step === 3 
              ? '<span style="background:rgba(16,185,129,0.15); color:#059669; border:1px solid rgba(16,185,129,0.3); padding:4px 10px; border-radius:14px; font-size:0.76rem; font-weight:700;">🚚 3. Dispatch</span>'
              : '<span style="background:rgba(16,185,129,0.25); color:#047857; border:1px solid rgba(16,185,129,0.4); padding:4px 10px; border-radius:14px; font-size:0.76rem; font-weight:800;">🏡 4. Delivered</span>'
            )
          );
      }

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
                ${order.userEmail ? `<span style="font-size: 0.72rem; color: #047857; background: rgba(4,120,87,0.1); padding: 1px 6px; border-radius: 4px;">Linked Account</span>` : ''}
              </div>
            </div>
            <div>
              ${statusBadge}
            </div>
          </div>

          <!-- Customer & Destination Details -->
          <div class="order-card-2col" style="font-size: 0.84rem; margin-bottom: 14px;">
            <div>
              <span style="color: var(--color-dark-muted); font-size: 0.75rem; display: block; font-weight: 700;">CUSTOMER & FARMGATE:</span>
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
                <span>📲</span> WhatsApp Dispatch
              </a>
            </div>

            <div style="font-size: 0.78rem; color: var(--color-dark-muted);">
              <span>🚚 ETA: <strong>${order.eta || 'Tomorrow by 4:00 PM'}</strong></span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  const statsStripHtml = accountOrders.length > 0 ? `
    <!-- Statistics Strip -->
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: var(--radius-md); padding: 12px 18px; margin-bottom: 16px;">
      <div style="display: flex; gap: 18px; flex-wrap: wrap; font-size: 0.85rem;">
        <div>📦 Showing: <strong style="color: var(--color-primary);">${filteredOrders.length} Order${filteredOrders.length === 1 ? '' : 's'}</strong></div>
        <div>🌾 Total Volume: <strong>${totalBags} Bags</strong></div>
        <div>💰 Total Amount: <strong style="color: var(--color-primary);">₹${Math.round(totalAmount).toLocaleString('en-IN')}</strong></div>
      </div>
      <div>
        <button type="button" class="btn btn-sm btn-secondary" onclick="manualRefreshOrders()" id="manualRefreshBtn" style="padding: 4px 10px; font-size: 0.75rem;">
          🔄 Refresh
        </button>
      </div>
    </div>

    <!-- Search Bar -->
    <div style="margin-bottom: 16px;">
      <input type="text" class="calc-input" placeholder="🔍 Search your account orders by Order ID, Feed Name..." value="${searchQuery}" oninput="renderOrdersListView(getStoredOrders(), this.value)" style="margin: 0; padding: 10px 14px; font-size: 0.85rem;" />
    </div>
  ` : '';

  listContainer.innerHTML = `
    <!-- Top Account Banner -->
    ${accountBannerHtml}

    ${statsStripHtml}

    <!-- Cards List -->
    <div style="max-height: 480px; overflow-y: auto; padding-right: 4px;">
      ${ordersCardsHtml}
    </div>
  `;
}

function lookupSingleOrderAsGuest() {
  const input = document.getElementById('guestTrackInput');
  const val = (input ? input.value : '').trim();
  if (!val) {
    if (window.cart && window.cart.showToast) window.cart.showToast('Please enter an Order ID or Phone number', 'error');
    return;
  }
  switchTrackerTab('tracking');
  const trackerInput = document.getElementById('orderTrackerInput');
  if (trackerInput) trackerInput.value = val;
  trackOrderSubmit();
}

async function trackOrderSubmit() {
  const input = document.getElementById('orderTrackerInput');
  const query = input ? input.value.trim() : '';

  if (!query) {
    if (window.cart && window.cart.showToast) window.cart.showToast('Please enter an Order ID or Phone number', 'info');
    return;
  }

  const allOrders = getStoredOrders();
  const myOrders = getMyCustomerOrders(allOrders);

  // 1. Optimistic check in customer's own orders first
  const ownMatch = myOrders.find(o => 
    (o.orderId && o.orderId.toLowerCase() === query.toLowerCase()) || 
    (o.phone && o.phone.replace(/\D/g, '').endsWith(query.replace(/\D/g, '')))
  );

  const exactMatch = ownMatch || allOrders.find(o => o.orderId && o.orderId.toLowerCase() === query.toLowerCase());

  if (exactMatch) {
    // Show instantly from cache with cloud syncing badge
    renderOrderTrackingCard(exactMatch, myOrders, true);
  } else {
    // Display searching state while fetching from cloud
    const container = document.getElementById('orderTrackerResultContainer');
    if (container) {
      container.innerHTML = `
        <div style="background: #ffffff; border: 1.5px solid var(--color-gray-200); border-radius: var(--radius-lg); padding: 32px 20px; text-align: center;">
          <div style="font-size: 2.2rem; margin-bottom: 10px;">🛰️</div>
          <div style="font-size: 1.05rem; font-weight: 800; color: var(--color-primary); margin-bottom: 4px;">Contacting Mill Cloud Logistics...</div>
          <div style="font-size: 0.82rem; color: var(--color-dark-muted);">Locating batch records and live status for <strong>#${query}</strong>...</div>
        </div>
      `;
    }
  }

  // 2. Fetch fresh order directly from Firebase Realtime Database
  let freshOrder = null;
  if (query.toUpperCase().startsWith('NUTRI-') || query.includes('-')) {
    freshOrder = await fetchSingleOrderLive(query);
  }

  // 3. If not found or if query might be phone number, fetch full list from server
  if (!freshOrder) {
    const freshAll = await fetchOrdersFromServer();
    const freshMy = getMyCustomerOrders(freshAll);
    freshOrder = freshMy.find(o => 
      (o.orderId && o.orderId.toLowerCase() === query.toLowerCase()) || 
      (o.phone && o.phone.replace(/\D/g, '').endsWith(query.replace(/\D/g, '')))
    ) || freshAll.find(o => o.orderId && o.orderId.toLowerCase() === query.toLowerCase());
  }

  if (freshOrder) {
    const finalAll = getStoredOrders();
    const finalMy = getMyCustomerOrders(finalAll);
    renderOrderTrackingCard(freshOrder, finalMy, false);
  } else if (!exactMatch) {
    renderOrderNotFoundCard(query);
  }
}

function renderOrderTrackingCard(order, allOrders, isSyncing = false) {
  const container = document.getElementById('orderTrackerResultContainer');
  if (!container) return;

  const isRejected = order.adminApproval === 'rejected' || order.currentStep === -1;
  const isAccepted = !isRejected && (order.adminApproval === 'accepted' || (order.currentStep !== undefined && order.currentStep >= 1));
  const isPending = !isRejected && !isAccepted;
  const currentStep = isPending ? 0 : (isRejected ? -1 : (order.currentStep || 1));
  const statusColor = isRejected ? '#dc2626' : (isPending ? '#d97706' : (currentStep >= 3 ? '#10b981' : '#059669'));
  const statusBadgeText = isPending
    ? '⏳ Awaiting Mill Acceptance'
    : (isRejected
      ? '✕ Order Rejected'
      : (currentStep === 1 
        ? '🌾 1. Order confirmed' 
        : (currentStep === 2 
          ? '📦 2. Packing' 
          : (currentStep === 3 
            ? '🚚 3. Dispatch' 
            : '🏡 4. Delivered'))));

  const displayEta = (!isPending && !isRejected && (!order.eta || order.eta === 'Pending Admin Review'))
    ? (currentStep >= 3 ? 'Out for Delivery (Today by 6:00 PM)' : (currentStep === 4 ? 'Delivered at Farmgate' : 'Tomorrow by 4:00 PM (Farmgate Arrival)'))
    : (order.eta || 'Tomorrow by 4:00 PM');

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

  let stepperHtml = '';
  if (isRejected) {
    stepperHtml = `
      <div style="background: #fef2f2; border: 1.5px solid #fecaca; border-radius: var(--radius-md); padding: 18px; margin-bottom: 22px; color: #991b1b;">
        <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 1rem; margin-bottom: 6px;">
          <span>🚫</span> Order Cancelled / Rejected by Mill
        </div>
        <div style="font-size: 0.88rem; color: #b91c1c; margin-bottom: 8px;">
          <strong>Reason:</strong> ${order.rejectionReason || 'Delivery could not be scheduled for this location or batch.'}
        </div>
        <div style="font-size: 0.8rem; color: #7f1d1d;">
          If you have questions or wish to place a revised order, please contact our toll-free hotline: <a href="tel:18008904567" style="color: #991b1b; font-weight: 700; text-decoration: underline;">1800-890-4567</a>.
        </div>
      </div>
    `;
  } else if (isPending) {
    stepperHtml = `
      <div style="background: #fffbeb; border: 1.5px solid #fef3c7; border-radius: var(--radius-md); padding: 16px 18px; margin-bottom: 22px; color: #92400e;">
        <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 0.95rem; margin-bottom: 4px;">
          <span>⏳</span> Order Under Plant Review
        </div>
        <div style="font-size: 0.84rem; color: #b45309;">
          Your order has been logged and queued for mill plant manager approval. Once verified for inventory and delivery logistics, milling begins immediately.
        </div>
      </div>
      <div class="order-track-stepper-wrap" style="margin-bottom: 22px;">
        <div class="order-track-stepper">
          <div class="track-step active">
            <div class="track-step-circle">⏳</div>
            <div class="track-step-info">
              <strong>1. Reviewing Order</strong>
            </div>
          </div>
          <div class="track-step">
            <div class="track-step-circle">📦</div>
            <div class="track-step-info">
              <strong>2. Packing</strong>
            </div>
          </div>
          <div class="track-step">
            <div class="track-step-circle">🚚</div>
            <div class="track-step-info">
              <strong>3. Dispatch</strong>
            </div>
          </div>
          <div class="track-step">
            <div class="track-step-circle">🏡</div>
            <div class="track-step-info">
              <strong>4. Delivered</strong>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    stepperHtml = `
      <div style="background: rgba(16, 185, 129, 0.08); border: 1.5px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 1.3rem;">🎉</span>
        <div>
          <div style="font-weight: 800; font-size: 0.92rem; color: #047857;">Order Accepted by Mill & Confirmed</div>
          <div style="font-size: 0.8rem; color: #065f46;">Your livestock feed batch has been approved and entered the production queue.</div>
        </div>
      </div>
      <!-- 4-Stage Visual Progress Stepper -->
      <div class="order-track-stepper-wrap" style="margin-bottom: 22px;">
        <div class="order-track-stepper">
          <div class="track-step completed">
            <div class="track-step-circle">✓</div>
            <div class="track-step-info">
              <strong>1. Order confirmed</strong>
            </div>
          </div>
          <div class="track-step ${currentStep >= 2 ? (currentStep === 2 ? 'active' : 'completed') : ''}">
            <div class="track-step-circle">${currentStep > 2 ? '✓' : '📦'}</div>
            <div class="track-step-info">
              <strong>2. Packing</strong>
            </div>
          </div>
          <div class="track-step ${currentStep >= 3 ? (currentStep === 3 ? 'active' : 'completed') : ''}">
            <div class="track-step-circle">${currentStep > 3 ? '✓' : '🚚'}</div>
            <div class="track-step-info">
              <strong>3. Dispatch</strong>
            </div>
          </div>
          <div class="track-step ${currentStep >= 4 ? 'completed' : ''}">
            <div class="track-step-circle">${currentStep >= 4 ? '✓' : '🏡'}</div>
            <div class="track-step-info">
              <strong>4. Delivered</strong>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <!-- Top Back to Orders List Button -->
    <div style="margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
      <button type="button" class="btn btn-sm btn-secondary" onclick="switchTrackerTab('list')" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; padding: 6px 14px;">
        ← Back to My Orders
      </button>
      <span style="font-size: 0.78rem; color: var(--color-dark-muted);">Live Freight Tracking</span>
    </div>

    <!-- Active Order Card -->
    <div style="background: #ffffff; border: 1.5px solid var(--color-gray-200); border-radius: var(--radius-lg); box-shadow: var(--shadow-md); padding: 22px; overflow: hidden;">
      
      <!-- Card Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--color-gray-200); padding-bottom: 14px; margin-bottom: 18px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; color: var(--color-dark-muted);">Order Reference</span>
            ${isSyncing ? `
              <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.7rem; color: #2563eb; font-weight: 700; background: rgba(37,99,235,0.08); padding: 1px 7px; border-radius: 9999px;">
                <span style="font-size: 0.65rem;">🔄</span> Syncing Cloud...
              </span>
            ` : `
              <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.7rem; color: #047857; font-weight: 700; background: rgba(16,185,129,0.1); padding: 1px 7px; border-radius: 9999px;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981; display: inline-block;"></span> Live Cloud Tracked
              </span>
            `}
          </div>
          <div style="font-size: 1.35rem; font-weight: 800; color: var(--color-primary);">${order.orderId}</div>
          <div style="font-size: 0.78rem; color: var(--color-dark-muted);">Placed on: ${order.date || 'Today'}</div>
        </div>
        <div style="text-align: right;">
          <span style="display: inline-block; background: rgba(245, 158, 11, 0.15); color: ${statusColor}; font-weight: 700; font-size: 0.8rem; padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(245, 158, 11, 0.3);">
            ${statusBadgeText}
          </span>
          <div style="font-size: 0.76rem; color: #059669; font-weight: 600; margin-top: 4px;">ETA: ${displayEta}</div>
        </div>
      </div>

      ${stepperHtml}

      <!-- Logistics Driver & Destination Box -->
      <div style="background: var(--color-gray-50); border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); padding: 14px; margin-bottom: 18px;">
        <div class="order-card-2col" style="font-size: 0.84rem;">
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

function renderOrderNotFoundCard(searchedId) {
  const container = document.getElementById('orderTrackerResultContainer');
  if (!container) return;

  const displayId = searchedId || 'your order';
  container.innerHTML = `
    <!-- Top Back to Orders List Button -->
    <div style="margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
      <button type="button" class="btn btn-sm btn-secondary" onclick="switchTrackerTab('list')" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; padding: 6px 14px;">
        ← Back to My Orders
      </button>
      <span style="font-size: 0.78rem; color: var(--color-dark-muted);">Live Freight Tracking</span>
    </div>

    <div style="text-align: center; padding: 36px 20px; background: #fff8f8; border: 1.5px dashed #fca5a5; border-radius: var(--radius-lg);">
      <div style="font-size: 2.8rem; margin-bottom: 10px;">🔍</div>
      <h3 style="font-size: 1.2rem; margin-bottom: 6px; color: #b91c1c;">Order Not Found</h3>
      <p style="font-size: 0.88rem; color: var(--color-dark-muted); max-width: 480px; margin: 0 auto 16px auto; line-height: 1.5;">
        No active feed order was found matching "<strong>${displayId}</strong>". If you recently placed an order, please verify the Order ID or phone number from your receipt.
      </p>
      <button type="button" class="btn btn-primary btn-sm" onclick="switchTrackerTab('list')" style="padding: 8px 20px; font-weight: 700;">
        📋 View My Orders List
      </button>
    </div>
  `;
}

function renderEmptyOrderTrackerState(myOrders) {
  const container = document.getElementById('orderTrackerResultContainer');
  if (!container) return;

  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem('nutriagro_user') || 'null');
  } catch (e) {}

  if (currentUser) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; background: var(--color-gray-50); border: 1.5px dashed var(--color-gray-300); border-radius: var(--radius-lg);">
        <div style="font-size: 2.8rem; margin-bottom: 12px;">🌾</div>
        <h3 style="font-size: 1.25rem; margin-bottom: 6px; color: var(--color-dark);">No Active Orders to Track</h3>
        <p style="font-size: 0.88rem; color: var(--color-dark-muted); max-width: 480px; margin: 0 auto 18px auto; line-height: 1.5;">
          You are signed in as <strong>${currentUser.fullName || currentUser.email}</strong>. Once you checkout an order from the feed catalog, it will automatically appear right here with real-time milling and truck dispatch tracking.
        </p>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button type="button" class="btn btn-primary" onclick="closeOrderTrackerModal(); window.location.hash = '#feedCatalogSection';" style="padding: 10px 22px; font-weight: 700;">
            🛒 Place a Feed Order
          </button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="switchTrackerTab('list')" style="padding: 8px 18px; font-weight: 700;">
            📋 View My Orders (0)
          </button>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div style="text-align: center; padding: 36px 20px; background: var(--color-gray-50); border: 1.5px dashed var(--color-gray-300); border-radius: var(--radius-lg);">
        <div style="font-size: 2.6rem; margin-bottom: 10px;">📦</div>
        <h3 style="font-size: 1.2rem; margin-bottom: 6px; color: var(--color-dark);">Track Your Feed Shipment</h3>
        <p style="font-size: 0.86rem; color: var(--color-dark-muted); max-width: 460px; margin: 0 auto 18px auto; line-height: 1.5;">
          Enter your specific Order ID in the search box above to track dispatch, or sign in to your farmer account to track orders automatically.
        </p>
        <button type="button" class="btn btn-primary btn-sm" onclick="closeOrderTrackerModal(); handleHeaderAccountClick();" style="padding: 8px 20px; font-weight: 700;">
          🔑 Sign In to View Your Orders
        </button>
      </div>
    `;
  }
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
window.toggleCustomerNotifDropdown = toggleCustomerNotifDropdown;
window.clearCustomerNotifs = clearCustomerNotifs;
window.renderCustomerNotificationsDropdown = renderCustomerNotificationsDropdown;
window.getMyCustomerOrders = getMyCustomerOrders;
window.renderOrderNotFoundCard = renderOrderNotFoundCard;
window.fetchSingleOrderLive = fetchSingleOrderLive;
window.refreshActiveDisplayedOrderLive = refreshActiveDisplayedOrderLive;

// Start order sync & customer watcher immediately
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startOrderStatusWatcher);
} else {
  startOrderStatusWatcher();
}


