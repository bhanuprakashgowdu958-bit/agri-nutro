// NutriAgro Feeds - Commercial Livestock Feed Catalog & Agritech Data (India Edition)
const currentCurrency = 'INR';

const CURRENCY_CONFIG = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)', shippingFee: 450, freeShippingThreshold: 12000, freeShippingBags: 15 }
};

function formatCurrency(amount) {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

const PRODUCTS_DATA = [
  {
    id: "nb-lactamax-50",
    name: "NutriBov LactaMax™ High-Yield Dairy Feed",
    category: "cattle",
    categoryLabel: "Dairy Cattle",
    form: "Steam Pellet (6mm)",
    stage: "Lactating Cows (15L+ / day)",
    image: "assets/images/cattle-feed.jpg",
    rating: 4.9,
    reviewsCount: 142,
    badge: "Top Seller",
    highlight: "Boosts Milk Yield & Fat Content (SNF)",
    shortDesc: "Formulated with high bypass protein, protected fats, and live yeast cultures to optimize rumen pH, peak lactation, and somatic cell health.",
    prices: {
      INR: { '25kg': 980, '50kg': 1850 }
    },
    stockStatus: "In Stock (Fresh Mill Batch)",
    nutritionalAnalysis: {
      crudeProtein: "22.0%",
      crudeFat: "4.5%",
      crudeFiber: "9.0%",
      totalDigestibleNutrients: "74.0%",
      calcium: "1.10%",
      phosphorus: "0.65%",
      moisture: "11.0%",
      vitaminA: "12,000 IU/kg",
      vitaminD3: "3,500 IU/kg",
      vitaminE: "80 mg/kg"
    },
    keyBenefits: [
      "Increases daily milk yield by 1.8 to 2.5 Litres per cow",
      "Contains active live yeast buffers to prevent sub-acute rumen acidosis (SARA)",
      "High bypass protein (RUP > 40%) for maximum amino acid absorption",
      "Fortified with organic zinc, copper, and selenium for hoof and udder longevity"
    ],
    feedingGuide: "Feed 400g - 500g per litre of milk produced over and above maintenance requirement (2-3 kg base + milk yield ration). Ensure constant access to fresh water and quality green/dry fodder.",
    ingredients: "Toasted Dehulled Soybean Meal, Flaked Yellow Corn, Cottonseed Meal, Wheat Middlings, Cane Molasses, Calcium Carbonate, Mono-Dicalcium Phosphate, Rumen-Protected Fat, Vitamin & Trace Mineral Premix, Probiotic Yeast Culture."
  },
  {
    id: "nb-calfstar-50",
    name: "NutriBov CalfGrow™ 20% Starter Pellets",
    category: "cattle",
    categoryLabel: "Dairy & Beef Calves",
    form: "Micro-Pellet (3mm)",
    stage: "Calves (Week 2 to Month 4)",
    image: "assets/images/cattle-feed.jpg",
    rating: 4.8,
    reviewsCount: 89,
    badge: "Fast Rumen Dev",
    highlight: "Early Rumen Papillae Development",
    shortDesc: "Highly palatable texturized starter feed with toasted grains and sweet molasses aroma, designed for smooth weaning and rapid skeletal growth.",
    prices: {
      INR: { '25kg': 1080, '50kg': 2050 }
    },
    stockStatus: "In Stock",
    nutritionalAnalysis: {
      crudeProtein: "20.0%",
      crudeFat: "3.8%",
      crudeFiber: "7.5%",
      totalDigestibleNutrients: "76.0%",
      calcium: "0.95%",
      phosphorus: "0.60%",
      moisture: "10.5%",
      vitaminA: "15,000 IU/kg",
      vitaminD3: "4,000 IU/kg",
      vitaminE: "120 mg/kg"
    },
    keyBenefits: [
      "Stimulates early rumen papillae growth for faster dry-feed conversion",
      "Infused with milk pre-digested proteins and organic acids",
      "Reduces weaning distress and post-weaning growth slump",
      "Coccidiostat added for active coccidiosis prevention"
    ],
    feedingGuide: "Introduce free-choice from Day 7 of life alongside milk replacer. Aim for 1.5 - 2.0 kg/day intake prior to full milk weaning.",
    ingredients: "Extruded Corn, Micronized Wheat, Dehulled Soy Protein, Dried Whey Permeate, Linseed Flakes, Molasses, Prebiotics (MOS), Essential Mineral Chelate."
  },
  {
    id: "ag-broilerfin-50",
    name: "AviGrow™ Broiler Finisher Performance Feed",
    category: "poultry",
    categoryLabel: "Poultry Broiler",
    form: "Pellet (3.5mm)",
    stage: "Broilers (Day 25 to Harvest)",
    image: "assets/images/poultry-feed.jpg",
    rating: 4.95,
    reviewsCount: 230,
    badge: "Optimal FCR",
    highlight: "Targets 1.48 FCR at Market Weight",
    shortDesc: "High-density balanced energy-protein matrix crafted to maximize breast meat yield and abdominal carcass quality while controlling feed conversion ratio.",
    prices: {
      INR: { '25kg': 1120, '50kg': 2150 }
    },
    stockStatus: "In Stock (Fresh Mill Batch)",
    nutritionalAnalysis: {
      crudeProtein: "21.0%",
      crudeFat: "5.5%",
      crudeFiber: "3.5%",
      metabolizableEnergy: "3,200 kcal/kg",
      calcium: "0.85%",
      availPhosphorus: "0.45%",
      lysine: "1.15%",
      methionine: "0.52%",
      moisture: "11.0%"
    },
    keyBenefits: [
      "Delivers industry-leading 1.48 - 1.52 Feed Conversion Ratio",
      "Enzyme-enhanced (Phytase + NSPase) for maximum nutrient digestibility",
      "Low dust, clean steam-conditioned pellets prevent feed pan wastage",
      "Uniform flock weight distribution and superior meat color"
    ],
    feedingGuide: "Feed ad-libitum from Day 25 until market harvest. Ensure unrestricted clean drinking water with proper drinker nipple flow.",
    ingredients: "Yellow Corn, Soybean Meal (48%), Full-Fat Soya, Broken Rice, Corn Gluten Meal, Refined Vegetable Oil, Phytase Enzymes, Synthetic Amino Acids (DL-Methionine, L-Lysine), Mineral Premix."
  },
  {
    id: "ag-layermash-50",
    name: "AviGrow™ EggMax Layer Phase-1 Feed",
    category: "poultry",
    categoryLabel: "Poultry Layer",
    form: "Homogeneous Coarse Mash",
    stage: "Laying Hens (Week 18 to 45)",
    image: "assets/images/poultry-feed.jpg",
    rating: 4.88,
    reviewsCount: 165,
    badge: "94%+ Lay Rate",
    highlight: "Hard Shells & Rich Golden Yolks",
    shortDesc: "Engineered with dual-release coarse and fine calcium sources, plus natural marigold lutein for thick eggshells and premium deep yolk pigmentation.",
    prices: {
      INR: { '25kg': 960, '50kg': 1780 }
    },
    stockStatus: "In Stock",
    nutritionalAnalysis: {
      crudeProtein: "18.5%",
      crudeFat: "3.8%",
      crudeFiber: "4.2%",
      metabolizableEnergy: "2,780 kcal/kg",
      calcium: "4.10%",
      availPhosphorus: "0.42%",
      lysine: "0.88%",
      methionine: "0.44%",
      moisture: "11.5%"
    },
    keyBenefits: [
      "Sustains peak egg production above 92-95% for extended cycles",
      "Oyster shell + coarse limestone matrix virtually eliminates cracked eggs",
      "Natural lutein carotenoids for vivid golden yolk color",
      "Fortified with Vitamin D3 & Biotin to prevent cage-layer fatigue"
    ],
    feedingGuide: "Provide 110g to 118g per bird per day depending on ambient poultry house temperature and bird body weight.",
    ingredients: "Ground Maize, Dehulled Soya, Wheat Bran, Calcite Grit & Coarse Limestone, Dicalcium Phosphate, Sodium Bicarbonate, Natural Marigold Extract, Layer Vitamin-Trace Complex."
  },
  {
    id: "av-fishmax-25",
    name: "AquaVital™ Max Floating Fish Pellets (4mm)",
    category: "aqua",
    categoryLabel: "Aquaculture",
    form: "Extruded Floating Pellets",
    stage: "Grower Fish (Tilapia, Carp, Catfish, Pangasius)",
    image: "assets/images/aqua-feed.jpg",
    rating: 4.92,
    reviewsCount: 112,
    badge: "High Water Stability",
    highlight: "Floats for 35+ Min Without Leaching",
    shortDesc: "Extruded thermo-treated floating feed loaded with prime fishmeal, marine oils, and immune beta-glucans. Zero water pollution with crisp water stability.",
    prices: {
      INR: { '25kg': 1350, '50kg': 2550 }
    },
    stockStatus: "In Stock",
    nutritionalAnalysis: {
      crudeProtein: "32.0%",
      crudeFat: "6.0%",
      crudeFiber: "4.8%",
      digestibleEnergy: "3,450 kcal/kg",
      calcium: "1.40%",
      phosphorus: "1.10%",
      moisture: "9.5%",
      vitaminC: "350 mg/kg (Stay-C)",
      lysine: "1.85%"
    },
    keyBenefits: [
      "Stable buoyancy: floats for over 35 minutes allowing farmers to monitor intake",
      "Preserves pond bio-clarity by minimizing nitrogenous and phosphorus leaching",
      "Rich in Omega-3 EPA/DHA for vigorous immune resistance and fast flesh gain",
      "Coated with heat-stable Vitamin C to ward off environmental and thermal stress"
    ],
    feedingGuide: "Feed 2.5% - 3.5% of total estimated pond biomass per day, split into morning and evening feedings based on water temperature.",
    ingredients: "Prime Marine Fishmeal, Soya Protein Concentrate, Wheat Flour, Rice Polish, Squid Liver Paste, Fish Oil, Mono-Calcium Phosphate, Stay-C Vitamin C, Probiotic Bacillus Premix."
  },
  {
    id: "pg-grower-50",
    name: "PorciGain™ Pro Swine Grower Feed",
    category: "swine",
    categoryLabel: "Swine & Pigs",
    form: "Pellet (4mm)",
    stage: "Growing Pigs (25kg to 65kg BW)",
    image: "assets/images/swine-feed.jpg",
    rating: 4.86,
    reviewsCount: 78,
    badge: "Rapid Lean Gain",
    highlight: "Superior Lean Meat Percentage & 850g ADG",
    shortDesc: "Optimal lysine-to-energy balance designed to accelerate daily liveweight gain (ADG 850g+) while maximizing carcass lean meat yield and gut health.",
    prices: {
      INR: { '25kg': 1020, '50kg': 1950 }
    },
    stockStatus: "In Stock",
    nutritionalAnalysis: {
      crudeProtein: "18.0%",
      crudeFat: "4.2%",
      crudeFiber: "4.5%",
      netEnergy: "2,450 kcal/kg",
      calcium: "0.75%",
      availPhosphorus: "0.38%",
      standardIlealLysine: "1.05%",
      threonine: "0.68%",
      moisture: "11.0%"
    },
    keyBenefits: [
      "Accelerates Average Daily Gain (ADG) to over 850 - 920g per day",
      "Formulated with ideal amino acid balance (Ideal Protein Concept) for lean tissue",
      "Includes organic butyrate acids to safeguard intestinal gut villi",
      "Minimizes slurry odor and environmental nitrogen excretion"
    ],
    feedingGuide: "Feed ad-libitum from dry feeders. Average daily intake ranges from 1.6 kg/day at 25kg liveweight to 2.4 kg/day at 60kg liveweight.",
    ingredients: "Steam-Rolled Corn, Soybean Meal (Hi-Pro), Barley Meal, Wheat Bran, Vegetable Oil, Monocalcium Phosphate, Calcium Carbonate, Synthetic Amino Acids, Gut Acidifiers."
  },
  {
    id: "cp-ruminant-50",
    name: "CapraPlus™ Dairy Goat & Sheep Balanced Ration",
    category: "goat",
    categoryLabel: "Goat & Sheep",
    form: "Clean Steam Pellets (4mm)",
    stage: "Milking Does, Ewes & Meat Goats",
    image: "assets/images/goat-feed.jpg",
    rating: 4.91,
    reviewsCount: 94,
    badge: "Copper-Safe",
    highlight: "Safe for Sheep (Strict Copper Control)",
    shortDesc: "A precisely formulated multi-ruminant diet with controlled copper levels, ammonium chloride for urinary calculi prevention, and premium fiber sources.",
    prices: {
      INR: { '25kg': 940, '50kg': 1790 }
    },
    stockStatus: "In Stock",
    nutritionalAnalysis: {
      crudeProtein: "16.0%",
      crudeFat: "3.5%",
      crudeFiber: "12.0%",
      totalDigestibleNutrients: "71.0%",
      calcium: "0.85%",
      phosphorus: "0.50%",
      copper: "< 12 ppm (Sheep Safe)",
      moisture: "11.0%",
      vitaminA: "10,000 IU/kg",
      vitaminE: "75 mg/kg"
    },
    keyBenefits: [
      "Specially balanced copper level (<12 ppm) to prevent lethal sheep copper toxicity",
      "Contains Ammonium Chloride to proactively prevent urinary calculi (waterbelly)",
      "High digestible fiber from beet pulp and alfalfa prevents bloat",
      "Stimulates persistent milk production in dairy does with high butterfat"
    ],
    feedingGuide: "Feed 0.5 kg to 1.2 kg per head daily depending on body weight, lactation status, and quality of pasture/hay provided.",
    ingredients: "Alfalfa Meal, Dehydrated Beet Pulp, Whole Oats, Ground Corn, Soya Meal, Wheat Middlings, Cane Molasses, Ammonium Chloride, Magnesium Oxide, Ruminant Mineral Chelate."
  },
  {
    id: "ag-chickstart-25",
    name: "AviGrow™ Pre-Starter Crumbles (0-14 Days)",
    category: "poultry",
    categoryLabel: "Poultry Starter",
    form: "Micro-Crumble (1.5mm)",
    stage: "Chicks (Day 1 to 14)",
    image: "assets/images/poultry-feed.jpg",
    rating: 4.97,
    reviewsCount: 188,
    badge: "99.2% Chick Livability",
    highlight: "High Immuno-Protective Formula",
    shortDesc: "Easily digestible micro-crumbles for baby chicks. Formulated to spark rapid vitelline yolk sac absorption, strong skeletal framework, and early immunity.",
    prices: {
      INR: { '25kg': 1180, '50kg': 2250 }
    },
    stockStatus: "In Stock",
    nutritionalAnalysis: {
      crudeProtein: "23.0%",
      crudeFat: "4.8%",
      crudeFiber: "2.8%",
      metabolizableEnergy: "3,050 kcal/kg",
      calcium: "1.00%",
      availPhosphorus: "0.50%",
      lysine: "1.32%",
      methionine: "0.58%",
      moisture: "10.0%"
    },
    keyBenefits: [
      "Ultra-fine uniform crumble size engineered specifically for day-old chick beaks",
      "Accelerates maternal yolk sac utilization within the first 72 hours",
      "Fortified with nucleotides and immune peptides to safeguard young chicks",
      "Drives early 7-day target body weight (180g - 200g target)"
    ],
    feedingGuide: "Offer ad-libitum on feeder trays or paper sheets from the moment day-old chicks are placed under brooders. Keep fresh warm water available.",
    ingredients: "Extruded Corn, Dehulled Soy Protein Isolate, Pre-gelatinized Rice, Fish Protein Peptides, Yeast Cell Walls (MOS & Beta-Glucans), Organic Acids, Essential Oils, Vitamins A, D3, E, K3."
  }
];

// Helper to get product price in Indian Rupees (INR)
function getProductPrice(productId, bagSize = '50kg') {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return 0;
  const inrPrices = (product.prices && product.prices.INR) ? product.prices.INR : product.prices;
  return inrPrices[bagSize] || inrPrices['50kg'] || 0;
}

// Species Ration Presets for the Interactive Calculator
const CALCULATOR_PRESETS = {
  cattle: {
    speciesName: "Dairy Cattle (Milking Cows)",
    unit: "cows",
    defaultCount: 25,
    avgDailyPerHeadKg: 8.5,
    recommendedProduct: "nb-lactamax-50",
    fcrDesc: "Optimal concentrate supplementation for 18-24L daily milk production",
    defaultDurationDays: 30
  },
  poultry_broiler: {
    speciesName: "Poultry Broilers (Meat Birds)",
    unit: "birds",
    defaultCount: 1000,
    avgDailyPerHeadKg: 0.12,
    recommendedProduct: "ag-broilerfin-50",
    fcrDesc: "Engineered for 1.48 FCR to achieve 2.2kg harvest weight at 35 days",
    defaultDurationDays: 14
  },
  poultry_layer: {
    speciesName: "Poultry Layers (Egg Production)",
    unit: "hens",
    defaultCount: 500,
    avgDailyPerHeadKg: 0.115,
    recommendedProduct: "ag-layermash-50",
    fcrDesc: "Sustains 94%+ egg production cycle and strong shell calcification",
    defaultDurationDays: 30
  },
  aqua: {
    speciesName: "Aquaculture (Fish / Tilapia Pond)",
    unit: "fish",
    defaultCount: 2000,
    avgDailyPerHeadKg: 0.025,
    recommendedProduct: "av-fishmax-25",
    fcrDesc: "High water stability floating pellets with 1.25 FCR efficiency",
    defaultDurationDays: 30
  },
  swine: {
    speciesName: "Swine / Pigs (Grower Phase)",
    unit: "pigs",
    defaultCount: 40,
    avgDailyPerHeadKg: 2.1,
    recommendedProduct: "pg-grower-50",
    fcrDesc: "Delivers 850g+ Average Daily Gain (ADG) with high carcass yield",
    defaultDurationDays: 30
  },
  goat: {
    speciesName: "Dairy Goats & Sheep Herd",
    unit: "animals",
    defaultCount: 50,
    avgDailyPerHeadKg: 0.75,
    recommendedProduct: "cp-ruminant-50",
    fcrDesc: "Copper-safe formula with ammonium chloride for urinary protection",
    defaultDurationDays: 30
  }
};

// Regional Authorized Dealer & Feed Mill Depots
const DEALER_LOCATIONS = [
  {
    id: "dl-1",
    name: "NutriAgro North Grain & Dairy Central Mill",
    city: "Karnal",
    state: "Haryana / Punjab Agri Belt",
    pincode: "132001",
    address: "Plot 42, GT Road Agro Industrial Sector, Gate 2",
    phone: "+91 98765 43210",
    inStockCategories: ["Dairy Cattle", "Poultry Broiler", "Calf Starter"],
    isMill: true,
    openingHours: "Mon-Sat: 6:00 AM - 7:00 PM"
  },
  {
    id: "dl-2",
    name: "NutriAgro Western Dairy & Livestock Hub",
    city: "Anand",
    state: "Gujarat / Maharashtra Dairy Corridor",
    pincode: "388001",
    address: "18 Amul Dairy Highway, Depot Silo 4",
    phone: "+91 98765 43210",
    inStockCategories: ["Dairy Cattle", "Swine", "Goat & Sheep"],
    isMill: true,
    openingHours: "Mon-Sat: 6:30 AM - 6:30 PM"
  },
  {
    id: "dl-3",
    name: "NutriAgro Coastal Aquaculture & Poultry Depot",
    city: "Bhimavaram",
    state: "Andhra Pradesh Aqua Belt",
    pincode: "534201",
    address: "88 Coastal Aqua Park, Someswaram Road",
    phone: "+91 98765 43210",
    inStockCategories: ["Aquaculture", "Poultry Broiler", "Poultry Layer"],
    isMill: false,
    openingHours: "Mon-Sat: 7:00 AM - 6:00 PM"
  },
  {
    id: "dl-4",
    name: "NutriAgro Southern Livestock & Hatchery Stockist",
    city: "Hosur",
    state: "Tamil Nadu / Karnataka Agro Hub",
    pincode: "635109",
    address: "7 Industrial Estate, SIPCOT Phase 1",
    phone: "+91 98765 43210",
    inStockCategories: ["Poultry Layer", "Dairy Cattle", "Goat & Sheep"],
    isMill: false,
    openingHours: "Mon-Sat: 7:30 AM - 6:00 PM"
  }
];
