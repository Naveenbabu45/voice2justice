import { getDashboardStats } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
  const user = requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stats = getDashboardStats();
    return Response.json(stats);
  } catch (error) {
    console.error('Stats API error:', error);
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
