// Serverless Function for Vercel
const fs = require('fs');
const path = require('path');

// In-memory + persistent fallback orders store
let memoryOrders = null;

// Helper: Get orders from Vercel KV / Upstash Redis if configured
async function getKvOrders() {
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!kvUrl || !kvToken) return null;

  try {
    const res = await fetch(`${kvUrl}/get/nutriagro_orders`, {
      headers: { Authorization: `Bearer ${kvToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.result) {
        const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (e) {}
  return null;
}

// Helper: Save orders to Vercel KV / Upstash Redis
async function saveKvOrders(orders) {
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!kvUrl || !kvToken) return false;

  try {
    await fetch(`${kvUrl}/set/nutriagro_orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kvToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(JSON.stringify(orders))
    });
    return true;
  } catch (e) {}
  return false;
}

// Helper: Load initial orders from /tmp or bundled orders.json
function loadLocalOrders() {
  // Check /tmp first (writable in Vercel Lambdas)
  const tmpFile = path.join('/tmp', 'nutri_orders.json');
  try {
    if (fs.existsSync(tmpFile)) {
      const content = fs.readFileSync(tmpFile, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}

  // Check bundled orders.json
  try {
    const bundledPath = path.join(process.cwd(), 'orders.json');
    if (fs.existsSync(bundledPath)) {
      const content = fs.readFileSync(bundledPath, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}

  return [
    {
      orderId: "NUTRI-205819",
      date: "12 Oct 2026",
      timestamp: 1791749540403,
      farmerName: "tharun",
      phone: "6789054321",
      address: "Sholinganallur, Chennai, Tamil Nadu, India",
      paymentMethod: "Farmgate Delivery (COD / Cheque on Site)",
      items: [
        {
          name: "NutriBov CalfGrow™ 20% Starter Pellets",
          quantity: 1,
          price: 2050,
          bagSize: "50kg"
        }
      ],
      totalBags: 1,
      totalWeightKg: 50,
      finalTotal: 2500,
      status: "Order Confirmed & Logged",
      eta: "Tomorrow by 4:00 PM (Farmgate Arrival)",
      driverName: "Ramesh Singh (Agro Hauler #HR-05-AB-4821)",
      driverPhone: "+91 98123 45678",
      currentStep: 1,
      lastUpdated: "2026-10-11T20:12:20.419Z"
    },
    {
      orderId: "NUTRI-842915",
      date: "11 Oct 2026",
      timestamp: 1791740000000,
      farmerName: "Sri Venkateswara Dairy Farm",
      phone: "+91 98450 12345",
      address: "Survey 42, Hosur Road, Bengaluru, Karnataka - 560100",
      paymentMethod: "Farmgate Delivery (COD / Cheque on Site)",
      items: [
        {
          name: "NutriBov LactaMax™ High-Yield Dairy Feed",
          quantity: 4,
          price: 1850,
          bagSize: "50kg"
        }
      ],
      totalBags: 4,
      totalWeightKg: 200,
      finalTotal: 7400,
      status: "Automated Milling & Quality Screened",
      eta: "Tomorrow by 4:00 PM (Farmgate Arrival)",
      driverName: "Ramesh Singh (Agro Hauler #HR-05-AB-4821)",
      driverPhone: "+91 98123 45678",
      currentStep: 2,
      lastUpdated: "2026-10-11T23:30:00.000Z"
    }
  ];
}

function persistLocalOrders(orders) {
  try {
    const tmpFile = path.join('/tmp', 'nutri_orders.json');
    fs.writeFileSync(tmpFile, JSON.stringify(orders, null, 2), 'utf8');
  } catch (e) {}
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Load orders (try KV cloud store first, then local /tmp & bundled)
  let orders = await getKvOrders();
  if (!orders) {
    if (!memoryOrders) {
      memoryOrders = loadLocalOrders();
    }
    orders = memoryOrders;
  }

  if (req.method === 'GET') {
    return res.status(200).json(orders || []);
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

      if (body.action === 'update_status' && body.orderId) {
        const match = orders.find(o => o.orderId && o.orderId.toLowerCase() === body.orderId.toLowerCase());
        if (match) {
          match.currentStep = parseInt(body.currentStep, 10) || match.currentStep || 1;
          match.status = body.status || match.status;
          match.lastUpdated = new Date().toISOString();
        }
      } else if (body.action === 'delete' && body.orderId) {
        orders = orders.filter(o => o && o.orderId && o.orderId.toLowerCase() !== body.orderId.toLowerCase());
      } else if (body.action) {
        // Handled action, do not insert
      } else {
        if (body.farmerName || body.items || body.finalTotal || body.orderId) {
          body.lastUpdated = new Date().toISOString();
          orders.unshift(body);
        }
      }

      orders = orders.filter(o => o && o.orderId && !o.action);
      memoryOrders = orders;
      persistLocalOrders(orders);
      await saveKvOrders(orders);

      return res.status(200).json(orders);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.status(405).json({ error: 'Method Not Allowed' });
};
