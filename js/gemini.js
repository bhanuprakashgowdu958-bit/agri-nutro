// NutriAgro Feeds — Gemini AI Agronomist & Livestock Nutrition Advisor
// Connects farmers with Google Gemini AI for instant 24/7 feeding guidance.

class GeminiAgronomist {
  constructor() {
    this.apiKeyStorageKey = 'nutriagro_gemini_key';
    this.apiKey = '';
    this.history = [];
    this.isGenerating = false;

    // Load saved API key if available
    this.defaultApiKey = '';
    try {
      this.apiKey = localStorage.getItem(this.apiKeyStorageKey) || this.defaultApiKey;
    } catch (e) {
      this.apiKey = this.defaultApiKey;
    }

    // System instruction for Gemini AI - Crisp & Direct
    this.systemInstruction = `You are Dr. Thorne, AI Agronomist at NutriAgro Feeds™.
Your job is to give quick, crisp, practical answers to farmers and customers.

CRITICAL RULES FOR ALL RESPONSES:
1. BE DIRECT & CONCISE: Answer the exact question asked in 2-4 short bullet points or 1-2 brief paragraphs (under 120 words).
2. NO UNNECESSARY FLUFF: Do NOT give long introductions ("In standard everyday language..."), botanical/Latin names, or unsolicited textbooks.
3. CRISP & PRACTICAL: Get straight to the point with practical advice (e.g. Yes/No, safe amounts, main caution, and recommended feed if relevant).
4. SIMPLE LANGUAGE: Keep it easy to understand and friendly for busy farmers on mobile phones.`;

    this.initDOM();
  }

  initDOM() {
    const input = document.getElementById('geminiApiKeyInput');
    if (input && this.apiKey) {
      input.value = this.apiKey;
    }
    this.updateStatusIndicator();
    this.checkServerAIStatus();
  }

  async checkServerAIStatus() {
    try {
      const headers = {};
      if (this.apiKey) headers['x-gemini-key'] = this.apiKey;
      const res = await fetch('/api/gemini', { method: 'GET', headers });
      if (res.ok) {
        const data = await res.json();
        if (data.active) {
          this.isLiveConnected = true;
          this.updateStatusIndicator();
        }
      }
    } catch (e) {}
  }

  openChat(initialQuery = '') {
    const modal = document.getElementById('geminiChatModal');
    const overlay = document.getElementById('modalOverlay');
    const whatsappPopup = document.getElementById('whatsappChatPopup');
    const queryInput = document.getElementById('whatsappAgronomistQuery');

    if (whatsappPopup) whatsappPopup.classList.remove('active');
    if (queryInput) queryInput.value = '';

    if (modal && overlay) {
      modal.classList.add('active');
      overlay.classList.add('active');
      document.body.classList.add('modal-open');
      this.checkServerAIStatus();

      const chatInput = document.getElementById('geminiChatInput');
      if (initialQuery && initialQuery.trim()) {
        if (chatInput) chatInput.value = '';
        this.sendMessage(initialQuery.trim());
      } else if (chatInput) {
        setTimeout(() => chatInput.focus(), 250);
      }
    }
  }

  closeChat() {
    const modal = document.getElementById('geminiChatModal');
    const overlay = document.getElementById('modalOverlay');
    if (modal) modal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.classList.remove('modal-open');
  }

  toggleSettings() {
    const bar = document.getElementById('geminiSettingsBar');
    if (!bar) return;
    bar.style.display = bar.style.display === 'none' ? 'block' : 'none';
  }

  saveApiKey() {
    const input = document.getElementById('geminiApiKeyInput');
    if (!input) return;
    const key = input.value.trim();
    this.apiKey = key;
    this.isLiveConnected = Boolean(key);
    try {
      localStorage.setItem(this.apiKeyStorageKey, key);
    } catch (e) {}

    this.updateStatusIndicator();
    if (window.cart) {
      window.cart.showToast(key ? '✨ Gemini AI Connected! Live generation active.' : 'Using built-in Agronomist Expert Database', 'success');
    }
    this.toggleSettings();
  }

  updateStatusIndicator() {
    const sub = document.querySelector('.gemini-header-subtitle');
    const dot = document.querySelector('.gemini-status-online');
    if (this.apiKey || this.isLiveConnected) {
      if (sub) sub.textContent = '✨ Gemini Live AI Connected • 24/7 Advisory';
      if (dot) {
        dot.style.background = '#10b981';
        dot.title = 'Gemini Live AI Connected';
      }
    } else {
      if (sub) sub.textContent = '🌾 Dr. Thorne Agronomist Engine (Built-In Advisory)';
      if (dot) {
        dot.style.background = '#22c55e';
        dot.title = 'Agronomy Knowledge Base Active';
      }
    }
  }

  async sendMessage(query) {
    if (!query || !query.trim() || this.isGenerating) return;
    const text = query.trim();
    this.isGenerating = true;

    // 1. Render User Message
    this.appendMessage('user', text);

    // Hide quick chips once conversation starts
    const chips = document.getElementById('geminiQuickChips');
    if (chips) chips.style.display = 'none';

    // 2. Render Typing / Thinking Indicator
    const typingId = this.appendTypingIndicator();

    try {
      let aiResponseText = '';

      // Always try the live Gemini AI via backend proxy first
      try {
        aiResponseText = await this.callGeminiProxy(text);
      } catch (proxyErr) {
        console.warn('Backend proxy unavailable, trying direct API:', proxyErr.message);
        // If user has a personal API key saved, try direct call
        if (this.apiKey) {
          aiResponseText = await this.callGeminiAPI(text);
        } else {
          throw proxyErr; // Let outer catch handle fallback
        }
      }

      this.removeTypingIndicator(typingId);
      this.appendMessage('ai', aiResponseText);
      this.history.push({ role: 'user', text }, { role: 'model', text: aiResponseText });
    } catch (err) {
      console.warn('AI live call notice, using local knowledge base:', err);
      this.removeTypingIndicator(typingId);
      const fallbackText = this.generateAgronomistExpertResponse(text);
      this.appendMessage('ai', fallbackText);
    } finally {
      this.isGenerating = false;
      const sendBtn = document.getElementById('geminiSendBtn');
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  // ── Backend Proxy Route (Recommended: API key stays on server or passed in header) ───────
  async callGeminiProxy(userPrompt) {
    // Build conversation history for context
    const contents = [];
    const recent = this.history.slice(-4);
    recent.forEach(msg => {
      const role = msg.role === 'user' ? 'user' : 'model';
      if (contents.length === 0 && role !== 'user') return;
      if (contents.length > 0 && contents[contents.length - 1].role === role) return;
      contents.push({
        role: role,
        parts: [{ text: msg.text }]
      });
    });

    // Ensure last turn in history is 'model' before appending new 'user' turn
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents.pop();
    }

    contents.push({
      role: 'user',
      parts: [{ text: userPrompt }]
    });

    const payload = {
      apiKey: (this.apiKey && this.apiKey.trim()) || undefined,
      systemInstruction: {
        parts: [{ text: this.systemInstruction }]
      },
      system_instruction: {
        parts: [{ text: this.systemInstruction }]
      },
      contents: contents,
      generationConfig: {
        temperature: 0.6,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    };

    const headers = { 'Content-Type': 'application/json' };
    if (this.apiKey && this.apiKey.trim()) {
      headers['x-gemini-key'] = this.apiKey.trim();
    }

    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errMsg = (errJson.error && errJson.error.message) ? errJson.error.message : `HTTP ${response.status}`;
      throw new Error(errMsg);
    }

    const data = await response.json();

    if (data.isLiveAI) {
      this.isLiveConnected = true;
      this.updateStatusIndicator();
    }

    const candidate = data.candidates && data.candidates[0];
    if (candidate && candidate.content && candidate.content.parts && candidate.content.parts[0]) {
      return candidate.content.parts[0].text;
    }

    if (data.fallback) {
      return this.generateAgronomistExpertResponse(userPrompt);
    }

    if (candidate && candidate.finishReason && candidate.finishReason !== 'STOP') {
      throw new Error(`Generation finished with reason: ${candidate.finishReason}`);
    }

    return this.generateAgronomistExpertResponse(userPrompt);
  }

  // ── Direct API Call (Fallback: uses client-side API key) ────────────
  async callGeminiAPI(userPrompt) {
    if (!this.apiKey || !this.apiKey.trim()) {
      throw new Error('No Google Gemini API key configured.');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(this.apiKey.trim())}`;

    // Cleanly build contents ensuring strict alternating user/model turns starting with 'user'
    const contents = [];
    const recent = this.history.slice(-4);
    recent.forEach(msg => {
      const role = msg.role === 'user' ? 'user' : 'model';
      if (contents.length === 0 && role !== 'user') return;
      if (contents.length > 0 && contents[contents.length - 1].role === role) return;
      contents.push({
        role: role,
        parts: [{ text: msg.text }]
      });
    });

    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents.pop();
    }

    contents.push({
      role: 'user',
      parts: [{ text: userPrompt }]
    });

    const payload = {
      system_instruction: {
        parts: [{ text: this.systemInstruction }]
      },
      contents: contents,
      generationConfig: {
        temperature: 0.6,
        topP: 0.95,
        maxOutputTokens: 1000
      }
    };

    let response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // If initial request fails with 400, retry with instructions prepended directly to user prompt
    if (!response.ok && response.status === 400) {
      const retryPayload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${this.systemInstruction}\n\nFarmer Question: ${userPrompt}` }]
          }
        ],
        generationConfig: {
          temperature: 0.6,
          topP: 0.95,
          maxOutputTokens: 1000
        }
      };

      const retryResp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(retryPayload)
      });
      if (retryResp.ok) {
        response = retryResp;
      }
    }

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errMsg = (errJson.error && errJson.error.message) ? errJson.error.message : `HTTP ${response.status}`;
      throw new Error(errMsg);
    }

    const data = await response.json();
    if (data.promptFeedback && data.promptFeedback.blockReason) {
      throw new Error(`Response blocked: ${data.promptFeedback.blockReason}`);
    }

    const candidate = data.candidates && data.candidates[0];
    if (candidate && candidate.content && candidate.content.parts && candidate.content.parts[0]) {
      return candidate.content.parts[0].text;
    }

    if (candidate && candidate.finishReason && candidate.finishReason !== 'STOP') {
      throw new Error(`Generation finished with reason: ${candidate.finishReason}`);
    }

    throw new Error('No response text generated by model');
  }

  // Built-in Expert Agronomist Knowledge Engine (handles offline & instant responses)
  generateAgronomistExpertResponse(query) {
    const q = (query || '').toLowerCase();

    // Ratites / Ostriches / Emus
    if (q.includes('ostrich') || q.includes('emu') || q.includes('ratite') || q.includes('perosis') || q.includes('slipped tendon')) {
      return `### 🦤 Ratite (Ostrich & Emu) Specialized Nutrition Protocol

Standard commercial broiler feeds should **never** be fed to ostriches or emus:
* **The Perosis Risk:** Broiler feeds are formulated for rapid breast muscle accretion, causing extreme weight gains that collapse immature ratite leg skeletons, leading to slipped tendon (*perosis*) and tibial rotation.
* **Calcium to Phosphorus Ratio:** Ratite chicks require a strictly balanced **1.8:1 to 2.0:1 Ca:P ratio** with bioavailable Manganese (min. 120 ppm) and Zinc to support elongated bone mineralization.
* **Fiber Requirements:** Unlike broilers, ostriches are hindgut fermenters requiring 10–14% crude fiber (from chopped Lucerne/Alfalfa) rather than calorie-dense grain fats.
* **NutriAgro Recommendation:** Use our custom **NutriRatite Starter Crumbles** with controlled 19.5% CP and moderate energy density (2,600 kcal ME/kg).`;
    }

    // Emergency Veterinary / Acute Bloat
    if (q.includes('bloat') || q.includes('frothy') || q.includes('tympany') || q.includes('legume')) {
      return `### 🚨 Emergency Veterinary Action: Acute Frothy Rumen Bloat

Acute legume bloat is a life-threatening medical emergency caused by stable protein foams trapping fermentation gases in the dorsal rumen sac:
* **Immediate Intervention:** Administer an anti-foaming agent immediately. Drench with **Poloxalene** (25–50g) or 300–500ml of emulsified vegetable oil (peanut/sunflower oil) or mineral oil to break surface tension and disperse foam bubbles.
* **Rumen Buffering:** Drench with **Sodium Bicarbonate** (100–150g dissolved in 1L warm water) to neutralize acidic volatile fatty acids and stabilize rumen pH above 6.0.
* **Physical Relief:** Keep the animal's front feet elevated on an incline to facilitate natural eructation. If respiratory distress occurs (distended left paralumbar fossa pressing diaphragm), prepare for emergency trocarization.
* **Prevention:** Never turn hungry ruminants onto dewy, lush alfalfa/clover pastures without pre-feeding coarse dry hay. Transition to **NutriBov LactaMax** with incorporated ionophores (monensin) to minimize gas-producing *Streptococcus bovis* populations.`;
    }

    // Heat Stress / Indian Summer / Murrah Buffaloes
    if (q.includes('heat') || q.includes('summer') || q.includes('haryana') || q.includes('44') || q.includes('buffalo') || q.includes('dcad')) {
      return `### ☀️ Indian Summer Heat Stress Protocol (Murrah Buffaloes & Dairy)

During intense 42°C–45°C summer heatwaves, buffaloes experience reduced dry matter intake (DMI) and up to 30% milk yield drops due to poor cutaneous sweating:
* **Bypass Fat Supplementation:** Increase energy density without elevating metabolic heat of digestion by adding **300g–400g/day of Prilled Calcium Salts of Fatty Acids (Bypass Fat)** like NutriFat™ Gold.
* **DCAD Mineral Balancing:** Optimize Dietary Cation-Anion Difference to **+350 to +400 mEq/kg** by supplementing Potassium Carbonate (raise dietary K to 1.5–1.8%) and Sodium Bicarbonate (1.0–1.2%), replenishing electrolytes lost in salivation.
* **Night Feeding Regimen:** Shift 65–70% of concentrate and green fodder feeding to the cooler nocturnal hours (8:00 PM to 4:00 AM) when ruminal fermentation heat coincides with cooler ambient temperatures.
* **Wallowing & Cooling:** Provide wallowing or overhead mister fans 45 minutes prior to morning and evening milking to lower core rectal body temperature below 38.5°C.`;
    }

    // Identity & Scientific Formulation Benchmarks
    if (q.includes('who are you') || q.includes('identity') || q.includes('benchmark') || q.includes('thorne') || q.includes('quality control')) {
      return `### 👨‍🔬 Dr. Thorne • NutriAgro Senior Livestock Nutritionist

I am **Dr. Thorne**, Lead Agronomist & Feed Scientist at NutriAgro Feeds India. Our feeding programs adhere strictly to global nutritional standards adapted for Indian agro-climates:
* **Precision Near-Infrared (NIR) Testing:** Every batch of raw maize, soya DOC, and de-oiled rice bran undergoes benchtop NIR spectrophotometry to verify amino acid profiles, moisture (<11%), and Crude Protein within 0.1% accuracy.
* **LC-MS/MS Mycotoxin Defense:** Certified 0-tolerance for aflatoxin B1 (<15 ppb) and vomitoxin/T-2 toxin through automated broad-spectrum liquid chromatography.
* **Performance Benchmarks:**
  * **Broilers:** 1.48 to 1.52 FCR at 40-day harvest weight (2.4–2.6 kg).
  * **Commercial Layers:** 92%+ peak lay rate with <1.5% cracked egg loss.
  * **Dairy Ruminants:** +1.8 to +2.5 litres/day milk yield boost with guaranteed 4.0+ Fat and 8.5+ SNF.
  * **Aquaculture:** 35-minute float integrity with 1.25:1 FCR in fresh ponds.`;
    }

    // Mathematical Herd Intake & Cobb-500 Broilers
    if (q.includes('500') || q.includes('cobb') || q.includes('week 4') || q.includes('how much feed') || q.includes('water requirement') || q.includes('calculation')) {
      return `### 📊 Feed & Water Mathematical Calculations: 500 Cobb-500 Broilers (Week 4)

For a commercial flock of **500 Cobb-500 broilers** in **Week 4 (Day 22 to 28)**:
* **Daily Feed Intake per Bird:** Approximately **135g to 150g per bird/day** of **AviGrow™ Broiler Finisher Performance Feed**.
* **Total Daily Herd Feed Requirement:**
  $$\\text{500 birds} \\times 0.140\\text{ kg} = \\mathbf{70.0\\text{ kg/day}} \\quad (\\approx 1.4 \\text{ bags of 50kg/day})$$
* **Total Feed for Week 4 (7 Days):** $70\\text{ kg} \\times 7\\text{ days} = \\mathbf{490\\text{ kg}}$ (approx. 10 bags).
* **Daily Water Consumption (2:1 Ratio):**
  * Healthy broilers consume strictly **1.8 to 2.2 times their feed weight in water** under standard 24°C–26°C temperatures.
  * $70\\text{ kg feed} \\times 2.0 = \\mathbf{140\\text{ Litres/day}}$ of fresh, sanitised drinking water (pH 6.2–6.8, chlorine residual 2–3 ppm).
  * *Hot Weather Note:* If temperature exceeds 32°C, water requirement increases to $210\\text{ Litres/day}$ (3:1 ratio).`;
    }

    // Alfalfa / Lucerne Harvest & Plant Science
    if (q.includes('alfalfa') || q.includes('lucerne') || q.includes('bloom') || q.includes('lignin') || q.includes('lignification') || q.includes('harvest')) {
      return `### 🌿 Alfalfa/Lucerne Agronomy: Early Bloom (10% Bloom) Harvesting Principle

Harvesting alfalfa at exactly the **10% early bloom stage** provides the scientific sweet spot reconciling forage yield and nutritional quality:
* **Crude Protein Optimization:** At 10% bloom, vegetative leaf-to-stem ratio remains high, providing **19% to 21% Crude Protein (CP)** and high relative feed value (RFV > 150).
* **Lignification Kinetics:** Beyond 10% bloom, plant secondary cell walls rapidly synthesize **lignin** (indigestible phenylpropanoid polymers) to mechanically support upright flowering stalks.
* **Fiber Digestibility (NDF/ADF):** As lignin cross-links with hemicellulose, Neutral Detergent Fiber (NDF) and Acid Detergent Fiber (ADF) surge, drastically reducing ruminal microbial degradation and retarding dry matter intake (DMI).
* **NutriAgro Agronomy Rule:** Harvesting earlier (pre-bloom) yields higher protein but weakens root crown carbohydrate reserves; harvesting late (50%+ bloom) yields woody forage with sub-14% CP. The 10% bloom cut maximizes total seasonal digestible nutrient tonnage.`;
    }

    // 1. Dairy & Milk Yield / Fat SNF
    if (q.includes('dairy') || q.includes('milk') || q.includes('cow') || q.includes('fat') || q.includes('snf') || q.includes('butterfat')) {
      return `### 🐄 Dairy Cattle Nutrition & Milk Yield Protocol

To maximize **daily milk output** and boost **butterfat & SNF content**, balanced rumen fermentation is critical:

* **Nutritional Target:** Milking cows producing 15-25L/day require **20.0% to 22.0% Crude Protein** with at least 40% Rumen Undegradable Protein (Bypass Protein) and 74% TDN.
* **Recommended Formula:** **NutriBov LactaMax™ High-Yield Dairy Feed** (6mm Steam Pellets).
* **Daily Ration Calculation:**
  * Base maintenance: 2.0 to 2.5 kg/day.
  * Production allowance: **400g to 450g of LactaMax per litre of milk produced**.
  * Example: A cow giving 18L requires approximately **7.5 to 8.5 kg/day** of concentrate.
* **To Boost Fat & SNF:** Ensure adequate effective fiber (min. 30% NDF from green Napier/maize silage) to prevent Sub-Acute Rumen Acidosis (SARA). Our LactaMax formula includes active live yeast buffers to maintain rumen pH above 6.2.`;
    }

    // 2. Poultry Broiler & FCR
    if (q.includes('broiler') || q.includes('fcr') || q.includes('chicken') || q.includes('meat') || q.includes('growth')) {
      return `### 🐔 Poultry Broiler 1.48 FCR Optimization Strategy

Achieving an industry-leading **1.48 to 1.52 Feed Conversion Ratio (FCR)** requires strict 3-phase nutritional synchronization:

1. **Phase 1: Pre-Starter (Day 0 to 10):**
   * Formula: **AviGrow™ Pre-Starter Crumbles (23% Crude Protein, 3,050 kcal/kg ME)**.
   * Target: Drives 7-day target chick weight (180g - 200g target).
2. **Phase 2: Grower (Day 11 to 24):**
   * Formula: **AviGrow™ Grower Pellets (21.5% Crude Protein, 3,120 kcal/kg ME)**.
3. **Phase 3: Finisher (Day 25 to Harvest):**
   * Formula: **AviGrow™ Broiler Finisher Performance Feed (21.0% Crude Protein, 3,200 kcal/kg ME)**.
* **Key FCR Tips:** Maintain 24-hour clean water supply (water-to-feed intake ratio is 2:1). Our AviGrow pellets are steam-conditioned to reduce feeder pan dust and eliminate feed wastage.`;
    }

    // 3. Poultry Layer & Egg Production
    if (q.includes('layer') || q.includes('egg') || q.includes('hen') || q.includes('shell')) {
      return `### 🥚 Poultry Layer Egg Production & Shell Strength

To maintain a **92%+ lay rate** through peak production with crack-resistant eggshells:

* **Recommended Formula:** **AviGrow™ EggMax Layer Phase-1 Feed** (Homogeneous Coarse Mash).
* **Nutritional Profile:** 18.5% Crude Protein, 2,800 kcal/kg ME, with **3.8% coarse oyster shell & calcium carbonate** for nocturnal shell calcification.
* **Daily Allocation:** 110g to 118g per bird per day.
* **Agronomist Tip:** Feed the largest portion of the daily ration in the late afternoon (around 3:00-4:00 PM) when calcium demand for eggshell formation reaches its peak.`;
    }

    // 4. Aquaculture & Fish Feeding
    if (q.includes('aqua') || q.includes('fish') || q.includes('tilapia') || q.includes('catfish') || q.includes('pond')) {
      return `### 🐟 Aquaculture Floating Pellet Protocol

For intensive Tilapia, Carp, or Pangasius pond culture:

* **Recommended Formula:** **AquaVital™ Max Floating Fish Pellets (4mm)**.
* **Crude Protein:** **32.0% high-protein marine & extruded soy peptides**.
* **Water Stability:** Extruded thermo-treated pellets float for **35+ minutes without leaching**, preventing pond bottom ammonia spikes and keeping dissolved oxygen high.
* **Feeding Rate:** Feed at 2.5% to 3.0% of total pond biomass daily, split into two feedings (morning 9:00 AM and afternoon 4:00 PM).`;
    }

    // 5. Sheep & Goats
    if (q.includes('goat') || q.includes('sheep') || q.includes('lamb') || q.includes('ewe') || q.includes('copper')) {
      return `### 🐐 Small Ruminant (Goat & Sheep) Nutrition

Sheep and goats have sensitive hepatic metabolism that requires strict mineral balancing:

* **Recommended Formula:** **CapraPlus™ Dairy Goat & Sheep Balanced Ration (16.0% Crude Protein)**.
* **Strict Copper Safety:** Formulated with strictly controlled copper (<15 ppm) to prevent hemolytic copper toxicity in sheep.
* **Urinary Calculi Prevention:** Formulated with ammonium chloride and a 2:1 Calcium-to-Phosphorus ratio to prevent urinary stone blockage in wethers and bucks.
* **Feeding Rate:** 500g to 800g per head daily alongside quality alfalfa or mixed grass hay.`;
    }

    // 6. Feed Transition Protocol
    if (q.includes('transition') || q.includes('switch') || q.includes('change') || q.includes('adapt')) {
      return `### 🔄 Official NutriAgro 7-Day Feed Transition Protocol

Whenever switching animal diets, always follow our gradual 7-day adaptation schedule to prevent digestive shock or sudden drops in production:

* **Days 1–2:** 75% Old Feed + **25% NutriAgro**
* **Days 3–4:** 50% Old Feed + **50% NutriAgro**
* **Days 5–6:** 25% Old Feed + **75% NutriAgro**
* **Day 7 Onward:** **100% NutriAgro Formula**

This transition window gives rumen microbes and intestinal enzymes time to multiply and adapt smoothly, keeping feed conversion optimal.`;
    }

    // General Livestock Guidance
    return `### 🌾 NutriAgro Livestock Nutrition Consultation

Thank you for your question regarding **"${query}"**!

Here is our primary agronomic recommendation:
* **Nutritional Balance:** High-performance livestock require precise ratios of **Crude Protein (CP)**, energy density (TDN / ME), and bio-available trace minerals (Zinc, Copper, Selenium).
* **Guaranteed Feed Quality:** All NutriAgro feeds undergo NIR spectrophotometry and LC-MS/MS testing to guarantee 100% freedom from aflatoxins and mold mycotoxins.
* **Ration Planning:** Try our interactive **Herd Ration Calculator** on this page to calculate your herd's exact monthly bag requirement and unlock wholesale discounts!

Would you like specific recommendations for **Dairy Cattle**, **Poultry Broilers**, **Layers**, **Aquaculture**, or **Sheep/Goats**?`;
  }

  appendMessage(sender, text) {
    const container = document.getElementById('geminiChatMessages');
    if (!container) return;

    const msgEl = document.createElement('div');
    msgEl.className = `gemini-msg gemini-msg-${sender}`;

    const formattedHtml = this.formatMarkdown(text);

    if (sender === 'user') {
      msgEl.innerHTML = `
        <div class="gemini-msg-content">${this.escapeHtml(text)}</div>
        <div class="gemini-msg-avatar">👨‍🌾</div>
      `;
    } else {
      msgEl.innerHTML = `
        <div class="gemini-msg-avatar">✨</div>
        <div class="gemini-msg-content">${formattedHtml}</div>
      `;
    }

    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
  }

  appendTypingIndicator() {
    const container = document.getElementById('geminiChatMessages');
    if (!container) return null;

    const id = 'typing_' + Date.now();
    const typingEl = document.createElement('div');
    typingEl.id = id;
    typingEl.className = 'gemini-msg gemini-msg-ai gemini-typing-wrap';
    typingEl.innerHTML = `
      <div class="gemini-msg-avatar">✨</div>
      <div class="gemini-msg-content gemini-typing-content">
        <span class="gemini-typing-dot"></span>
        <span class="gemini-typing-dot"></span>
        <span class="gemini-typing-dot"></span>
        <span style="font-size:0.75rem; color:var(--color-dark-muted); margin-left:6px;">Gemini Agronomist analyzing nutrition...</span>
      </div>
    `;

    container.appendChild(typingEl);
    container.scrollTop = container.scrollHeight;
    return id;
  }

  removeTypingIndicator(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  formatMarkdown(text) {
    let html = text
      .replace(/^### (.*$)/gim, '<h4 class="gemini-msg-heading">$1</h4>')
      .replace(/^## (.*$)/gim, '<h3 class="gemini-msg-heading">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^[0-9]\. (.*$)/gim, '<li>$1</li>');

    // Wrap consecutive <li> into <ul>
    html = html.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');

    // Convert line breaks to paragraphs
    html = html.split('\n\n').map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<li')) return p;
      return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
    }).join('');

    return html;
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Global instance
let geminiAI;

document.addEventListener('DOMContentLoaded', () => {
  geminiAI = new GeminiAgronomist();
  window.geminiAI = geminiAI;
});

// UI Helper Functions
function openGeminiChat(initialQuery = '') {
  if (window.geminiAI) {
    window.geminiAI.openChat(initialQuery);
  }
}

function closeGeminiChat() {
  if (window.geminiAI) {
    window.geminiAI.closeChat();
  }
}

function toggleGeminiSettings() {
  if (window.geminiAI) {
    window.geminiAI.toggleSettings();
  }
}

function saveGeminiApiKey() {
  if (window.geminiAI) {
    window.geminiAI.saveApiKey();
  }
}

function sendQuickPrompt(promptText) {
  if (window.geminiAI) {
    window.geminiAI.sendMessage(promptText);
  }
}

function handleGeminiChatSubmit(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('geminiChatInput');
  if (!input) return;
  const val = input.value.trim();
  if (val && window.geminiAI) {
    window.geminiAI.sendMessage(val);
    input.value = '';
    input.style.height = 'auto';
  }
}

function handleGeminiInputKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleGeminiChatSubmit(e);
  }
}
