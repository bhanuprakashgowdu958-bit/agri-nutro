// Vercel Serverless Function: Gemini AI Proxy for NutriAgro Feeds
const https = require('https');

// Official Google Gemini model candidates
const MODEL_CANDIDATES = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-2.5-flash'
];

// Dr. Thorne Built-in Livestock Nutrition Knowledge Base
function generateAgronomistExpertResponse(query) {
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

  // Dairy & Milk Yield / Fat SNF
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

  // Poultry Broiler & FCR
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

  // Poultry Layer & Egg Production
  if (q.includes('layer') || q.includes('egg') || q.includes('hen') || q.includes('shell')) {
    return `### 🥚 Poultry Layer Egg Production & Shell Strength

To maintain a **92%+ lay rate** through peak production with crack-resistant eggshells:
* **Recommended Formula:** **AviGrow™ EggMax Layer Phase-1 Feed** (Homogeneous Coarse Mash).
* **Nutritional Profile:** 18.5% Crude Protein, 2,800 kcal/kg ME, with **3.8% coarse oyster shell & calcium carbonate** for nocturnal shell calcification.
* **Daily Allocation:** 110g to 118g per bird per day.
* **Agronomist Tip:** Feed the largest portion of the daily ration in the late afternoon (around 3:00-4:00 PM) when calcium demand for eggshell formation reaches its peak.`;
  }

  // Aquaculture & Fish Feeding
  if (q.includes('aqua') || q.includes('fish') || q.includes('tilapia') || q.includes('catfish') || q.includes('pond')) {
    return `### 🐟 Aquaculture Floating Pellet Protocol

For intensive Tilapia, Carp, or Pangasius pond culture:
* **Recommended Formula:** **AquaVital™ Max Floating Fish Pellets (4mm)**.
* **Crude Protein:** **32.0% high-protein marine & extruded soy peptides**.
* **Water Stability:** Extruded thermo-treated pellets float for **35+ minutes without leaching**, preventing pond bottom ammonia spikes and keeping dissolved oxygen high.
* **Feeding Rate:** Feed at 2.5% to 3.0% of total pond biomass daily, split into two feedings (morning 9:00 AM and afternoon 4:00 PM).`;
  }

  // Sheep & Goats
  if (q.includes('goat') || q.includes('sheep') || q.includes('lamb') || q.includes('ewe') || q.includes('copper')) {
    return `### 🐐 Small Ruminant (Goat & Sheep) Nutrition

Sheep and goats have sensitive hepatic metabolism that requires strict mineral balancing:
* **Recommended Formula:** **CapraPlus™ Dairy Goat & Sheep Balanced Ration (16.0% Crude Protein)**.
* **Strict Copper Safety:** Formulated with strictly controlled copper (<15 ppm) to prevent hemolytic copper toxicity in sheep.
* **Urinary Calculi Prevention:** Formulated with ammonium chloride and a 2:1 Calcium-to-Phosphorus ratio to prevent urinary stone blockage in wethers and bucks.
* **Feeding Rate:** 500g to 800g per head daily alongside quality alfalfa or mixed grass hay.`;
  }

  // Feed Transition Protocol
  if (q.includes('transition') || q.includes('switch') || q.includes('change') || q.includes('adapt')) {
    return `### 🔄 Official NutriAgro 7-Day Feed Transition Protocol

Whenever switching animal diets, always follow our gradual 7-day adaptation schedule to prevent digestive shock or sudden drops in production:
* **Days 1–2:** 75% Old Feed + **25% NutriAgro**
* **Days 3–4:** 50% Old Feed + **50% NutriAgro**
* **Days 5–6:** 25% Old Feed + **75% NutriAgro**
* **Day 7 Onward:** **100% NutriAgro Formula**

This transition window gives rumen microbes and intestinal enzymes time to multiply and adapt smoothly, keeping feed conversion optimal.`;
  }

  // General Livestock Guidance Fallback
  return `### 🌾 NutriAgro Livestock Nutrition Consultation

Thank you for your question regarding **"${query}"**!

Here is our primary agronomic recommendation:
* **Nutritional Balance:** High-performance livestock require precise ratios of **Crude Protein (CP)**, energy density (TDN / ME), and bio-available trace minerals (Zinc, Copper, Selenium).
* **Guaranteed Feed Quality:** All NutriAgro feeds undergo NIR spectrophotometry and LC-MS/MS testing to guarantee 100% freedom from aflatoxins and mold mycotoxins.
* **Ration Planning:** Try our interactive **Herd Ration Calculator** on this page to calculate your herd's exact monthly bag requirement and unlock wholesale discounts!

Would you like specific recommendations for **Dairy Cattle**, **Poultry Broilers**, **Layers**, **Aquaculture**, or **Sheep/Goats**?`;
}

function callModel(model, payload, apiKey) {
  return new Promise((resolve, reject) => {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const body = JSON.stringify(payload);
    const url = new URL(endpoint);

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 20000
    };

    const request = https.request(options, (response) => {
      let resData = '';
      response.on('data', chunk => { resData += chunk; });
      response.on('end', () => {
        try {
          const json = JSON.parse(resData);
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve({ model, json });
          } else {
            reject({ status: response.statusCode, body: json, model });
          }
        } catch (e) {
          reject({ status: response.statusCode, body: resData, model });
        }
      });
    });

    request.on('timeout', () => {
      request.destroy();
      reject(new Error(`Model ${model} timed out`));
    });

    request.on('error', reject);
    request.write(body);
    request.end();
  });
}

async function callGeminiWithFailover(payload, apiKey) {
  let lastError = null;
  for (const model of MODEL_CANDIDATES) {
    try {
      const result = await callModel(model, payload, apiKey);
      return result.json;
    } catch (err) {
      lastError = err;
      // Stop failover immediately on auth/credential errors
      if (err.status === 401 || err.status === 403) {
        break;
      }
    }
  }
  throw lastError || new Error('All models failed');
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, x-gemini-key');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authHeader = req.headers['authorization'] || '';
  const bearerKey = authHeader.replace(/^Bearer\s+/i, '').trim();
  const clientKey = (req.headers['x-gemini-key'] || bearerKey || '').trim();
  const effectiveKey = (clientKey || process.env.GEMINI_API_KEY || '').trim();

  // GET /api/gemini health & AI readiness check
  if (req.method === 'GET') {
    return res.status(200).json({
      active: Boolean(effectiveKey),
      model: 'gemini-1.5-flash',
      mode: effectiveKey ? 'live_ai' : 'built_in_knowledge_base'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const userText = body.contents?.[body.contents.length - 1]?.parts?.[0]?.text || '';
    const postKey = (body.apiKey || effectiveKey || '').trim();

    // If no API key configured, seamlessly serve built-in agronomy knowledge engine
    if (!postKey) {
      const expertAnswer = generateAgronomistExpertResponse(userText);
      return res.status(200).json({
        candidates: [
          {
            content: { parts: [{ text: expertAnswer }] },
            finishReason: 'STOP'
          }
        ],
        isFallback: true,
        mode: 'built_in_knowledge_base'
      });
    }

    const sysText = (body.systemInstruction?.parts?.[0]?.text || body.system_instruction?.parts?.[0]?.text || '').trim();

    const geminiPayload = {
      systemInstruction: sysText ? { parts: [{ text: sysText }] } : undefined,
      contents: body.contents || [],
      generationConfig: body.generationConfig || {
        temperature: 0.6,
        topP: 0.95,
        maxOutputTokens: 1000
      }
    };

    try {
      const geminiResponse = await callGeminiWithFailover(geminiPayload, postKey);
      return res.status(200).json({
        ...geminiResponse,
        isLiveAI: true
      });
    } catch (apiErr) {
      // Gracefully fall back if key was invalid/forbidden/quota exhausted
      const expertAnswer = generateAgronomistExpertResponse(userText);
      return res.status(200).json({
        candidates: [
          {
            content: { parts: [{ text: expertAnswer }] },
            finishReason: 'STOP'
          }
        ],
        isFallback: true,
        errorNotice: apiErr.body?.error?.message || apiErr.message
      });
    }
  } catch (err) {
    const expertAnswer = generateAgronomistExpertResponse('General livestock nutrition');
    return res.status(200).json({
      candidates: [
        {
          content: { parts: [{ text: expertAnswer }] },
          finishReason: 'STOP'
        }
      ],
      isFallback: true
    });
  }
};
