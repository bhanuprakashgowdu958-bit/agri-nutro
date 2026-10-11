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
    <span class="spinner"></span> Processing Farm Order...
  `;

  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;

    // Generate Order ID
    const orderId = 'NUTRI-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

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

window.autoDetectDeliveryAddress = autoDetectDeliveryAddress;
