// Serverless Function for Vercel: /api/users
const fs = require('fs');
const path = require('path');

let memoryUsers = null;

function getUsersFilePath() {
  return path.join(process.cwd(), 'users.json');
}

function getLocalUsers() {
  try {
    const filePath = getUsersFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {}
  return [];
}

function saveLocalUsers(users) {
  try {
    const filePath = getUsersFilePath();
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {}
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    let users = memoryUsers || getLocalUsers();
    return res.status(200).json(users || []);
  }

  if (req.method === 'POST') {
    try {
      let users = memoryUsers || getLocalUsers();
      let body = req.body;
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }

      if (!body) {
        return res.status(400).json({ error: 'Missing request body' });
      }

      // Check if user with phone already exists
      const existingIdx = users.findIndex(u => u.phone === body.phone);
      if (existingIdx >= 0) {
        users[existingIdx] = { ...users[existingIdx], ...body, lastUpdated: new Date().toISOString() };
      } else {
        const newUser = {
          userId: body.userId || `FARM-${Math.floor(100000 + Math.random() * 900000)}`,
          registeredAt: new Date().toISOString(),
          ...body
        };
        users.unshift(newUser);
      }

      memoryUsers = users;
      saveLocalUsers(users);

      return res.status(200).json({ success: true, user: users[0] });
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Internal error' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
