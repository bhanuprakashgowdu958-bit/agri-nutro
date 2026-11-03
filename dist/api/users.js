// Serverless Function for Vercel: /api/users
const fs = require('fs');
const path = require('path');

const crypto = require('crypto');

let memoryUsers = null;

function computePasswordHash(password, salt) {
  if (!password) return '';
  return crypto.createHash('sha256').update(password + '::nutriagro::' + (salt || 'seed')).digest('hex');
}

function normalizePhone(str) {
  if (!str) return '';
  let digits = str.toString().replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.substring(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.substring(1);
  }
  return digits;
}

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

      if (body.action === 'delete') {
        const targetKey = (body.userId || body.phone || body.email || '').toString().toLowerCase();
        users = users.filter(u => {
          const uid = (u.userId || '').toLowerCase();
          const ph = (u.phone || '').toLowerCase();
          const em = (u.email || '').toLowerCase();
          return uid !== targetKey && ph !== targetKey && em !== targetKey;
        });
        memoryUsers = users;
        saveLocalUsers(users);
        return res.status(200).json({ success: true, users });
      }

      if (body.action === 'update_profile') {
        const identifier = (body.userId || body.email || body.phone || '').toString().toLowerCase().trim();
        const normIdent = normalizePhone(body.phone || '');

        let user = users.find(u => {
          const em = (u.email || '').toLowerCase().trim();
          const ph = normalizePhone(u.phone || '');
          const uid = (u.userId || '').toLowerCase().trim();
          return (uid && uid === identifier) || (em && em === identifier) || (normIdent && ph && ph === normIdent);
        });

        if (user) {
          if (body.fullName) user.fullName = body.fullName.trim();
          if (body.email) user.email = body.email.trim().toLowerCase();
          if (body.phone) user.phone = body.phone.trim();
          if (body.picture !== undefined) user.picture = body.picture;
          user.lastUpdated = new Date().toISOString();
        } else {
          user = {
            userId: body.userId || `FARM-${Math.floor(100000 + Math.random() * 900000)}`,
            fullName: body.fullName || 'Farm User',
            email: body.email || '',
            phone: body.phone || '',
            picture: body.picture || '',
            registeredAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          };
          users.unshift(user);
        }

        memoryUsers = users;
        saveLocalUsers(users);

        const { password, passwordHash, salt, ...safeUser } = user;
        return res.status(200).json({
          success: true,
          message: 'Profile updated successfully',
          user: safeUser
        });
      }

      if (body.action === 'google_auth') {
        const gEmail = (body.email || '').toString().toLowerCase().trim();
        const gName = (body.fullName || '').toString().trim();
        const gPicture = (body.picture || '').toString().trim();
        const gId = (body.googleId || '').toString().trim();

        if (!gEmail) {
          return res.status(400).json({ success: false, error: 'Missing Google email' });
        }

        let user = users.find(u => (u.email || '').toLowerCase().trim() === gEmail);

        if (user) {
          user.authProvider = 'google';
          if (gPicture) user.picture = gPicture;
          if (gName && !user.fullName) user.fullName = gName;
          user.lastUpdated = new Date().toISOString();
          user.signedInAt = new Date().toISOString();
        } else {
          const displayName = gName || gEmail.split('@')[0];
          user = {
            userId: 'GOOGLE-' + Math.floor(100000 + Math.random() * 900000),
            fullName: displayName,
            email: gEmail,
            phone: (body.phone || '').trim(),
            picture: gPicture,
            googleId: gId,
            authProvider: 'google',
            farmName: (body.farmName || (displayName + "'s Commercial Farm")).trim(),
            farmType: 'Commercial Livestock & Dairy',
            tier: 'Verified Google Member (10% Rebate)',
            registeredAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            signedInAt: new Date().toISOString()
          };
          users.unshift(user);
        }

        memoryUsers = users;
        saveLocalUsers(users);

        const { password, passwordHash, salt, ...safeUser } = user;
        return res.status(200).json({
          success: true,
          message: 'Google authentication successful',
          user: safeUser
        });
      }

      if (body.action === 'reset_password') {
        const identifier = (body.email || body.phone || body.identifier || '').toString().toLowerCase().trim();
        const normIdent = normalizePhone(identifier);
        const newPassword = (body.newPassword || body.password || '').toString();

        if (!newPassword || newPassword.length < 6) {
          return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
        }

        const user = users.find(u => {
          const em = (u.email || '').toLowerCase().trim();
          const ph = normalizePhone(u.phone || '');
          const uid = (u.userId || '').toLowerCase().trim();
          return (em && em === identifier) || (normIdent && ph && ph === normIdent) || (uid && uid === identifier);
        });

        if (!user) {
          return res.status(404).json({
            success: false,
            error: `No registered farm account found for "${body.email || body.phone || identifier}". Please check your email or phone number.`
          });
        }

        const salt = user.salt || crypto.randomBytes(6).toString('hex');
        const passwordHash = body.passwordHash || computePasswordHash(newPassword, salt);
        user.salt = salt;
        user.passwordHash = passwordHash;
        delete user.password;
        user.lastUpdated = new Date().toISOString();

        memoryUsers = users;
        saveLocalUsers(users);

        const { password, passwordHash: ph, salt: s, ...safeUser } = user;
        return res.status(200).json({
          success: true,
          message: 'Password reset successfully',
          user: safeUser
        });
      }

      if (body.action === 'login') {
        const identifier = (body.email || body.phone || body.userId || '').toString().toLowerCase().trim();
        const normIdent = normalizePhone(identifier);
        const inputPassword = (body.password || '').toString();
        const inputHash = (body.passwordHash || '').toString().toLowerCase();

        const user = users.find(u => {
          const em = (u.email || '').toLowerCase().trim();
          const ph = normalizePhone(u.phone || '');
          const uid = (u.userId || '').toLowerCase().trim();
          return (em && em === identifier) || (normIdent && ph && ph === normIdent) || (uid && uid === identifier);
        });

        if (!user) {
          return res.status(404).json({
            success: false,
            error: `No account found with "${body.email || body.phone || identifier}". Please check your email or create a new account.`
          });
        }

        if (user.authProvider === 'google' && !user.passwordHash && !user.password) {
          return res.status(400).json({
            success: false,
            error: `This account is linked with Google. Please click "Sign In with Google" to access your orders.`
          });
        }

        // Validate password
        let passwordMatches = false;
        const salt = user.salt || 'seed';
        const expectedHash = user.passwordHash ? user.passwordHash.toLowerCase() : '';
        const computedHash = inputPassword ? computePasswordHash(inputPassword, salt).toLowerCase() : '';

        if (expectedHash) {
          if (computedHash && computedHash === expectedHash) {
            passwordMatches = true;
          } else if (inputHash && inputHash === expectedHash) {
            passwordMatches = true;
          }
        } else if (user.password && inputPassword) {
          passwordMatches = (user.password === inputPassword);
        }

        if (!passwordMatches) {
          return res.status(401).json({
            success: false,
            error: 'The password you entered is incorrect. Please check your password and try again.'
          });
        }

        // Password verified
        const { password, passwordHash, salt: userSalt, ...safeUser } = user;
        return res.status(200).json({
          success: true,
          message: 'Login successful',
          user: safeUser
        });
      }

      if (body.action === 'register') {
        const email = (body.email || '').toLowerCase().trim();
        const phone = (body.phone || '').trim();

        const duplicate = users.find(u => 
          (email && u.email && u.email.toLowerCase().trim() === email) ||
          (phone && u.phone && u.phone.trim() === phone)
        );

        if (duplicate) {
          return res.status(409).json({
            success: false,
            error: `An account with this ${email && duplicate.email?.toLowerCase() === email ? 'email address' : 'mobile number'} is already registered. Please sign in instead.`
          });
        }

        const salt = body.salt || crypto.randomBytes(6).toString('hex');
        const passwordHash = body.passwordHash || (body.password ? computePasswordHash(body.password, salt) : '');

        const newUser = {
          userId: body.userId || `FARM-${Math.floor(100000 + Math.random() * 900000)}`,
          registeredAt: body.registeredAt || new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          ...body,
          salt: salt,
          passwordHash: passwordHash
        };
        delete newUser.action;
        delete newUser.password;

        users.unshift(newUser);
        memoryUsers = users;
        saveLocalUsers(users);

        const { password, passwordHash: ph, salt: s, ...safeUser } = newUser;
        return res.status(200).json({ success: true, user: safeUser, users });
      }

      // Check if user with phone, userId, or email already exists
      const existingIdx = users.findIndex(u => 
        (body.phone && u.phone && u.phone === body.phone) ||
        (body.userId && u.userId && u.userId.toLowerCase() === body.userId.toLowerCase()) ||
        (body.email && u.email && u.email.toLowerCase() === body.email.toLowerCase())
      );
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

      return res.status(200).json({ success: true, user: users[0], users });
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Internal error' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
