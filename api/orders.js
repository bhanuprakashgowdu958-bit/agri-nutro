// Serverless Function for Vercel
const fs = require('fs');
const path = require('path');

// In-memory + persistent fallback orders store
let memoryOrders = null;

const FIREBASE_RTDB_ORDERS_URL = process.env.FIREBASE_RTDB_ORDERS_URL || 'https://nutriagro-feeds-default-rtdb.firebaseio.com/orders';
const DEFAULT_PURGED_ORDERS = new Set(['nutri-495921', 'nutri-917758', 'nutri-270946', 'nutri-842915', 'nutri-205819']);

// Helper: Get orders directly from Firebase Realtime Database
async function getFirebaseOrders() {
  try {
    const res = await fetch(`${FIREBASE_RTDB_ORDERS_URL}.json`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const list = Array.isArray(data) ? data : Object.values(data);
        return list.filter(o => o && o.orderId && !o.action && !DEFAULT_PURGED_ORDERS.has(String(o.orderId).toLowerCase())).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      }
    }
  } catch (e) {}
  return null;
}

// Helper: Save single order to Firebase Realtime Database
async function saveFirebaseOrder(order) {
  if (!order || !order.orderId) return;
  try {
    await fetch(`${FIREBASE_RTDB_ORDERS_URL}/${encodeURIComponent(order.orderId)}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
  } catch (e) {}
}

// Helper: Patch order status in Firebase Realtime Database
async function patchFirebaseOrder(orderId, patch) {
  if (!orderId) return;
  try {
    await fetch(`${FIREBASE_RTDB_ORDERS_URL}/${encodeURIComponent(orderId)}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
  } catch (e) {}
}

// Helper: Delete order from Firebase Realtime Database
async function deleteFirebaseOrder(orderId) {
  if (!orderId) return;
  try {
    await fetch(`${FIREBASE_RTDB_ORDERS_URL}/${encodeURIComponent(orderId)}.json`, {
      method: 'DELETE'
    });
  } catch (e) {}
}

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
      if (Array.isArray(parsed)) return parsed.filter(o => o && o.orderId && !DEFAULT_PURGED_ORDERS.has(String(o.orderId).toLowerCase()));
    }
  } catch (e) {}

  // Check bundled orders.json
  try {
    const bundledPath = path.join(process.cwd(), 'orders.json');
    if (fs.existsSync(bundledPath)) {
      const content = fs.readFileSync(bundledPath, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed.filter(o => o && o.orderId && !DEFAULT_PURGED_ORDERS.has(String(o.orderId).toLowerCase()));
    }
  } catch (e) {}

  return [];
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

  // Load orders (try Firebase Cloud Store first, then KV, then memory/local)
  let orders = await getFirebaseOrders();
  if (!orders || orders.length === 0) {
    orders = await getKvOrders();
  }
  if (!orders || orders.length === 0) {
    if (!memoryOrders) {
      memoryOrders = loadLocalOrders();
    }
    orders = memoryOrders;
  }

  if (req.method === 'GET') {
    const urlObj = new URL(req.url, 'http://localhost');
    const singleId = urlObj.searchParams.get('id') || urlObj.searchParams.get('orderId');
    if (singleId) {
      const match = (orders || []).find(o => o && o.orderId && o.orderId.toLowerCase() === singleId.toLowerCase());
      if (match) return res.status(200).json(match);
      return res.status(404).json({ error: 'Order not found', orderId: singleId });
    }
    return res.status(200).json(orders || []);
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

      if (body.action === 'update_status' && body.orderId) {
        const match = orders.find(o => o && o.orderId && o.orderId.toLowerCase() === body.orderId.toLowerCase());
        const step = body.currentStep !== undefined ? parseInt(body.currentStep, 10) : (match ? match.currentStep : 1);
        const calculatedEta = body.eta || (
          step === 1 ? 'Tomorrow by 4:00 PM (Farmgate Arrival)' :
          step === 2 ? 'Tomorrow by 4:00 PM (Farmgate Arrival)' :
          step === 3 ? 'Out for Farmgate Delivery (Today by 6:00 PM)' :
          step === 4 ? 'Delivered at Farmgate' :
          (match && match.eta && match.eta !== 'Pending Admin Review' ? match.eta : 'Tomorrow by 4:00 PM (Farmgate Arrival)')
        );
        const patch = {
          currentStep: step,
          status: body.status || (match ? match.status : 'Order confirmed'),
          adminApproval: body.adminApproval || (step >= 1 ? 'accepted' : (match ? match.adminApproval : 'pending')),
          eta: calculatedEta,
          rejectionReason: body.rejectionReason !== undefined ? body.rejectionReason : (match ? match.rejectionReason : ''),
          lastUpdated: new Date().toISOString()
        };
        if (match) {
          match.currentStep = patch.currentStep;
          match.status = patch.status;
          match.adminApproval = patch.adminApproval;
          match.eta = patch.eta;
          match.rejectionReason = patch.rejectionReason;
          match.lastUpdated = patch.lastUpdated;
        }
        await patchFirebaseOrder(body.orderId, patch);
      } else if (body.action === 'update_phone' && body.orderId && body.phone) {
        const match = orders.find(o => o.orderId && o.orderId.toLowerCase() === body.orderId.toLowerCase());
        const patch = {
          phone: body.phone.trim(),
          lastUpdated: new Date().toISOString()
        };
        if (match) {
          match.phone = patch.phone;
          match.lastUpdated = patch.lastUpdated;
        }
        await patchFirebaseOrder(body.orderId, patch);
      } else if (body.action === 'delete' && body.orderId) {
        orders = orders.filter(o => o && o.orderId && o.orderId.toLowerCase() !== body.orderId.toLowerCase());
        await deleteFirebaseOrder(body.orderId);
      } else if (body.action) {
        // Handled action, do not insert
      } else {
        if (body.farmerName || body.items || body.finalTotal || body.orderId) {
          body.lastUpdated = new Date().toISOString();
          orders.unshift(body);
          await saveFirebaseOrder(body);
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
