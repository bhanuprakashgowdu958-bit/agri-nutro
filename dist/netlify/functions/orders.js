// Netlify Serverless Function for orders
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
  },
  {
    orderId: "NUTRI-573104",
    date: "11 Oct 2026",
    timestamp: 1791730000000,
    farmerName: "Annamalai Commercial Poultry",
    phone: "+91 94432 67890",
    address: "Udumalpet Highway, Pollachi, Coimbatore, Tamil Nadu - 642001",
    paymentMethod: "Direct Bank NEFT / RTGS Transfer",
    items: [
      { name: "NutriBroil UltraGrow™ 23% Pre-Starter Crumbs", quantity: 6, price: 2150, bagSize: "50kg" }
    ],
    totalBags: 6,
    totalWeightKg: 300,
    finalTotal: 12900,
    status: "Dispatched on Agro Freight Truck",
    eta: "Today by 6:30 PM (En Route)",
    driverName: "Gurpreet Singh (Truck #PB-10-CZ-9912)",
    driverPhone: "+91 98721 54321",
    currentStep: 3,
    lastUpdated: "2026-10-11T23:35:00.000Z"
  }
];

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    return { statusCode: 200, headers, body: JSON.stringify(memoryOrders) };
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      if (body.action === 'update_status' && body.orderId) {
        const match = memoryOrders.find(o => o.orderId && o.orderId.toLowerCase() === body.orderId.toLowerCase());
        if (match) {
          match.currentStep = parseInt(body.currentStep, 10) || match.currentStep || 1;
          match.status = body.status || match.status;
          match.lastUpdated = new Date().toISOString();
        }
        return { statusCode: 200, headers, body: JSON.stringify(memoryOrders) };
      } else if (body.action === 'delete' && body.orderId) {
        memoryOrders = memoryOrders.filter(o => o.orderId && o.orderId.toLowerCase() !== body.orderId.toLowerCase());
        return { statusCode: 200, headers, body: JSON.stringify(memoryOrders) };
      } else {
        body.lastUpdated = new Date().toISOString();
        memoryOrders.unshift(body);
        return { statusCode: 200, headers, body: JSON.stringify(memoryOrders) };
      }
    } catch (e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  return { statusCode: 405, headers, body: 'Method Not Allowed' };
};
