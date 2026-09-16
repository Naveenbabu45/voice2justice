import bcrypt from 'bcryptjs';
import { findAdmin, updateAdminLogin } from '@/lib/db';
import { signToken, requireAuth } from '@/lib/auth';

// POST /api/auth — Login
export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return Response.json({ error: 'Username and password required' }, { status: 400 });
    }

    const admin = findAdmin(username);
    if (!admin) {
      // Prevent timing attack
      bcrypt.compareSync(password, '$2a$10$dummy.hash.for.timing.protection.only');
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = bcrypt.compareSync(password, admin.password_hash);
    if (!valid) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    updateAdminLogin(admin.id);

    const token = signToken({
      id:       admin.id,
      username: admin.username,
      role:     admin.role,
      name:     admin.full_name,
    });

    const response = Response.json({
      success: true,
      token,
      user: { id: admin.id, username: admin.username, role: admin.role, name: admin.full_name },
    });

    // Also set cookie for SSR convenience
    response.headers.set(
      'Set-Cookie',
      `admin_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800`
    );

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return Response.json({ error: 'Login failed' }, { status: 500 });
  }
}

// GET /api/auth — Verify token
export async function GET(request) {
  const user = requireAuth(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  return Response.json({ user });
}

// DELETE /api/auth — Logout
export async function DELETE() {
  const response = Response.json({ success: true });
  response.headers.set('Set-Cookie', 'admin_token=; Path=/; Max-Age=0');
  return response;
}
