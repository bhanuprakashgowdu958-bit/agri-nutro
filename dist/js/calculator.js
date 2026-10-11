// Interactive Commercial Livestock Feed & Herd Ration Calculator
class FeedCalculator {
  constructor() {
    this.speciesSelect = document.getElementById('calcSpecies');
    this.animalCountInput = document.getElementById('calcAnimalCount');
    this.durationSelect = document.getElementById('calcDuration');
    this.sliderCount = document.getElementById('calcSliderCount');
    
    // Outputs
    this.totalKgOutput = document.getElementById('calcTotalKg');
    this.totalBagsOutput = document.getElementById('calcTotalBags');
    this.dailyIntakeOutput = document.getElementById('calcDailyIntake');
    this.recProductName = document.getElementById('calcRecProductName');
    this.recProductImg = document.getElementById('calcRecProductImg');
    this.recProductProtein = document.getElementById('calcRecProductProtein');
    this.recProductPrice = document.getElementById('calcRecProductPrice');
    this.recFcrBadge = document.getElementById('calcRecFcrBadge');
    this.calcEstimatedCost = document.getElementById('calcEstimatedCost');
    this.addRationBtn = document.getElementById('calcAddRationBtn');

    this.currentRecommendation = null;
    this.calculatedBags = 0;

    this.init();
  }

  init() {
    if (!this.speciesSelect || !this.animalCountInput) return;

    // Populate species options
    this.speciesSelect.innerHTML = Object.keys(CALCULATOR_PRESETS).map(key => {
      const preset = CALCULATOR_PRESETS[key];
      return `<option value="${key}">${preset.speciesName}</option>`;
    }).join('');

    // Set initial preset
    this.onSpeciesChange();

    // Listeners
    this.speciesSelect.addEventListener('change', () => this.onSpeciesChange());
    
    this.animalCountInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) || 1;
      if (this.sliderCount) this.sliderCount.value = Math.min(val, 5000);
      this.recalculate();
    });

    if (this.sliderCount) {
      this.sliderCount.addEventListener('input', (e) => {
        this.animalCountInput.value = e.target.value;
        this.recalculate();
      });
    }

    if (this.durationSelect) {
      this.durationSelect.addEventListener('change', () => this.recalculate());
    }

    if (this.addRationBtn) {
      this.addRationBtn.addEventListener('click', () => this.addCalculatedRationToCart());
    }

    this.recalculate();
  }

  onSpeciesChange() {
    const key = this.speciesSelect.value;
    const preset = CALCULATOR_PRESETS[key];
    if (!preset) return;

    // Set default animal count
    this.animalCountInput.value = preset.defaultCount;
    if (this.sliderCount) {
      // Set slider max according to species
      if (key.includes('poultry') || key === 'aqua') {
        this.sliderCount.max = 5000;
        this.sliderCount.step = 50;
      } else {
        this.sliderCount.max = 200;
        this.sliderCount.step = 5;
      }
      this.sliderCount.value = preset.defaultCount;
    }

    if (this.durationSelect) {
      this.durationSelect.value = preset.defaultDurationDays;
    }

    // Update unit label
    const unitLabel = document.getElementById('calcUnitLabel');
    if (unitLabel) unitLabel.textContent = preset.unit;

    this.recalculate();
  }

  recalculate() {
    const key = this.speciesSelect.value;
    const preset = CALCULATOR_PRESETS[key];
    if (!preset) return;

    const count = Math.max(1, parseInt(this.animalCountInput.value, 10) || 1);
    const days = parseInt(this.durationSelect ? this.durationSelect.value : 30, 10) || 30;

    // Daily total requirement
    const dailyTotalKg = count * preset.avgDailyPerHeadKg;
    const totalRequirementKg = Math.round(dailyTotalKg * days);

    // Standard commercial packaging is 50kg bag
    const bags50kg = Math.ceil(totalRequirementKg / 50);
    this.calculatedBags = Math.max(1, bags50kg);

    // Find recommended product
    const product = PRODUCTS_DATA.find(p => p.id === preset.recommendedProduct) || PRODUCTS_DATA[0];
    this.currentRecommendation = product;

    // Estimated cost
    const bagPrice = getProductPrice(product.id, '50kg', currentCurrency);
    let rawTotalCost = this.calculatedBags * bagPrice;

    // Volume discount approximation
    let discountPct = 0;
    if (this.calculatedBags >= 50) discountPct = 15;
    else if (this.calculatedBags >= 25) discountPct = 10;
    else if (this.calculatedBags >= 10) discountPct = 5;

    const finalEstimatedCost = rawTotalCost * (1 - (discountPct / 100));

    // Update UI elements
    if (this.totalKgOutput) {
      this.totalKgOutput.textContent = `${totalRequirementKg.toLocaleString()} kg`;
    }
    if (this.totalBagsOutput) {
      this.totalBagsOutput.textContent = `${this.calculatedBags} Bags (50kg)`;
    }
    if (this.dailyIntakeOutput) {
      const formattedDaily = preset.avgDailyPerHeadKg >= 1 
        ? `${preset.avgDailyPerHeadKg.toFixed(1)} kg/day` 
        : `${(preset.avgDailyPerHeadKg * 1000).toFixed(0)} g/day`;
      this.dailyIntakeOutput.textContent = `${formattedDaily} per ${preset.unit.slice(0, -1) || 'head'}`;
    }

    if (this.recProductName) this.recProductName.textContent = product.name;
    if (this.recProductImg) this.recProductImg.src = product.image;
    if (this.recProductProtein) this.recProductProtein.textContent = product.nutritionalAnalysis.crudeProtein + ' Crude Protein';
    if (this.recProductPrice) this.recProductPrice.textContent = `${formatCurrency(bagPrice)} / 50kg bag`;
    if (this.recFcrBadge) this.recFcrBadge.textContent = preset.fcrDesc;

    if (this.calcEstimatedCost) {
      this.calcEstimatedCost.innerHTML = `
        <strong>${formatCurrency(finalEstimatedCost)}</strong> 
        ${discountPct > 0 ? `<span class="calc-discount-tag">Includes ${discountPct}% Bulk Tier Discount!</span>` : ''}
      `;
    }

    if (this.addRationBtn) {
      this.addRationBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
        <span>Add ${this.calculatedBags} Bags to Order Cart</span>
      `;
    }
  }

  addCalculatedRationToCart() {
    if (!this.currentRecommendation || this.calculatedBags <= 0) return;
    if (window.cart) {
      window.cart.addItem(this.currentRecommendation.id, '50kg', this.calculatedBags);
    }
  }
}

// Initialize on DOM load and assign global reference
document.addEventListener('DOMContentLoaded', () => {
  window.feedCalculator = new FeedCalculator();
});
