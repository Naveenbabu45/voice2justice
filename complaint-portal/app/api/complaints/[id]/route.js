import { getComplaintById, getComplaintHistory, updateComplaintStatus, updateComplaintDetails } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET /api/complaints/[id] — Public: track a complaint by ID or complaint_no
export async function GET(request, { params }) {
  const { id } = params;

  try {
    const complaint = getComplaintById(id);
    if (!complaint) {
      return Response.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const history = getComplaintHistory(complaint.id);

    // Public view: hide sensitive fields
    const isAdmin = !!requireAuth(request);
    if (!isAdmin) {
      const { ip_address, officer_notes, ...safe } = complaint;
      return Response.json({ complaint: safe, history });
    }

    return Response.json({ complaint, history });
  } catch (error) {
    console.error('GET /api/complaints/[id] error:', error);
    return Response.json({ error: 'Database error' }, { status: 500 });
  }
}

// PATCH /api/complaints/[id] — Admin: update status or details
export async function PATCH(request, { params }) {
  const user = requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'update_status') {
      const { status, note } = body;
      const validStatuses = ['pending', 'under_investigation', 'fir_registered', 'resolved', 'closed', 'rejected'];
      if (!validStatuses.includes(status)) {
        return Response.json({ error: 'Invalid status' }, { status: 400 });
      }
      const updated = updateComplaintStatus(id, status, note, user.username);
      if (!updated) return Response.json({ error: 'Complaint not found' }, { status: 404 });
      return Response.json({ success: true, complaint: updated });
    }

    if (action === 'update_details') {
      const { priority, assigned_to, officer_notes } = body;
      const updated = updateComplaintDetails(id, { priority, assigned_to, officer_notes });
      if (!updated) return Response.json({ error: 'Complaint not found' }, { status: 404 });
      return Response.json({ success: true, complaint: updated });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('PATCH /api/complaints/[id] error:', error);
    return Response.json({ error: 'Update failed' }, { status: 500 });
  }
}
