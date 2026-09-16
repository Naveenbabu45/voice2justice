import bcrypt from 'bcryptjs';
import { createUser, findUserByPhone, updateUserLogin } from '@/lib/db';
import { signToken } from '@/lib/auth';

// POST /api/users — Register
export async function POST(request) {
  try {
    const { full_name, phone, email, password, preferred_language = 'en' } = await request.json();

    if (!full_name?.trim()) return Response.json({ error: 'Full name is required' }, { status: 400 });
    if (!phone) return Response.json({ error: 'Phone number is required' }, { status: 400 });
    if (!password || password.length < 6) return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) return Response.json({ error: 'Enter a valid 10-digit phone number' }, { status: 400 });

    const user = createUser({ full_name, phone: cleanPhone, email, password, preferred_language });

    const token = signToken({ id: user.id, phone: cleanPhone, role: 'user', name: full_name });

    const res = Response.json({ success: true, token, user: { id: user.id, full_name, phone: cleanPhone, preferred_language } }, { status: 201 });
    res.headers.set('Set-Cookie', `user_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
    return res;
  } catch (e) {
    return Response.json({ error: e.message || 'Registration failed' }, { status: 400 });
  }
}

// PATCH /api/users — Login
export async function PATCH(request) {
  try {
    const { phone, password } = await request.json();
    if (!phone || !password) return Response.json({ error: 'Phone and password required' }, { status: 400 });

    const user = findUserByPhone(phone);
    if (!user) {
      bcrypt.compareSync(password, '$2a$10$dummy.hash.for.timing.only.xxxx');
      return Response.json({ error: 'Invalid phone number or password' }, { status: 401 });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) return Response.json({ error: 'Invalid phone number or password' }, { status: 401 });

    updateUserLogin(user.id);
    const token = signToken({ id: user.id, phone: user.phone, role: 'user', name: user.full_name });

    const res = Response.json({
      success: true, token,
      user: { id: user.id, full_name: user.full_name, phone: user.phone, preferred_language: user.preferred_language }
    });
    res.headers.set('Set-Cookie', `user_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
    return res;
  } catch (e) {
    return Response.json({ error: 'Login failed' }, { status: 500 });
  }
}
