import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = '8h';

export function signToken(payload) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token) {
  if (!JWT_SECRET) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request) {
  // Check Authorization header
  const auth = request.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  // Check cookie
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/admin_token=([^;]+)/);
  return match ? match[1] : null;
}

export function requireAuth(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}
