const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('Auth: No authorization header');
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.log('Auth: Invalid authorization format');
      return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
    }

    const token = parts[1];

    if (!token) {
      console.log('Auth: No token after Bearer');
      return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    console.error('Auth error stack:', error.stack);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid token', details: error.message });
    }
    // Nếu là lỗi khác, trả về 500
    return res.status(500).json({ error: 'Authentication error', details: error.message });
  }
};

module.exports = { authenticate };

