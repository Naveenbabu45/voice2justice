import { createComplaint, getAllComplaints } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET /api/complaints — Admin: list all complaints
export async function GET(request) {
  const user = requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page     = parseInt(searchParams.get('page')     || '1');
  const limit    = parseInt(searchParams.get('limit')    || '20');
  const status   = searchParams.get('status')   || 'all';
  const search   = searchParams.get('search')   || '';
  const language = searchParams.get('language') || 'all';

  try {
    const result = getAllComplaints({ page, limit, status, search, language });
    return Response.json(result);
  } catch (error) {
    console.error('GET /api/complaints error:', error);
    return Response.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST /api/complaints — Public: submit a new complaint
export async function POST(request) {
  try {
    const body = await request.json();

    const required = ['name', 'phone', 'address', 'complaint_type', 'incident_date', 'incident_location', 'incident_description', 'language'];
    for (const field of required) {
      if (!body[field]?.toString().trim()) {
        return Response.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Validate phone
    const phone = body.phone.replace(/\D/g, '');
    if (phone.length < 10) {
      return Response.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // Get client IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]
      || request.headers.get('x-real-ip')
      || 'unknown';

    const { id, complaint_no } = createComplaint({
      language:             body.language,
      name:                 body.name.trim(),
      phone:                phone,
      address:              body.address.trim(),
      complaint_type:       body.complaint_type.trim(),
      incident_date:        body.incident_date.trim(),
      incident_location:    body.incident_location.trim(),
      incident_description: body.incident_description.trim(),
      ip_address:           ip,
    });

    return Response.json({ success: true, id, complaint_no }, { status: 201 });
  } catch (error) {
    console.error('POST /api/complaints error:', error);
    return Response.json({ error: 'Failed to submit complaint' }, { status: 500 });
  }
}
