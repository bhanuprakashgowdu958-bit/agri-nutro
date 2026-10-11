// Serverless Function for Vercel / Cloud deployments
// In-memory + persisted fallback orders store

let memoryOrders = [
  {
    orderId: "NUTRI-842915",
    date: "11 Oct 2026",
    timestamp: 1791740000000,
    farmerName: "Sri Venkateswara Dairy Farm",
    phone: "+91 98450 12345",
    address: "Survey 42, Hosur Road, Bengaluru, Karnataka - 560100",
    paymentMethod: "Farmgate Delivery (COD / Cheque on Site)",
    items: [
      { name: "NutriBov LactaMax™ High-Yield Dairy Feed", quantity: 4, price: 1850, bagSize: "50kg" }
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

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json(memoryOrders);
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (body.action === 'update_status' && body.orderId) {
        const match = memoryOrders.find(o => o.orderId && o.orderId.toLowerCase() === body.orderId.toLowerCase());
        if (match) {
          match.currentStep = parseInt(body.currentStep, 10) || match.currentStep || 1;
          match.status = body.status || match.status;
          match.lastUpdated = new Date().toISOString();
        }
        return res.status(200).json(memoryOrders);
      } else if (body.action === 'delete' && body.orderId) {
        memoryOrders = memoryOrders.filter(o => o.orderId && o.orderId.toLowerCase() !== body.orderId.toLowerCase());
        return res.status(200).json(memoryOrders);
      } else if (body.action) {
        return res.status(200).json(memoryOrders);
      } else {
        if (body.farmerName || body.items || body.finalTotal) {
          body.lastUpdated = new Date().toISOString();
          memoryOrders.unshift(body);
        }
        return res.status(200).json(memoryOrders);
      }
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.status(405).json({ error: 'Method Not Allowed' });
};
