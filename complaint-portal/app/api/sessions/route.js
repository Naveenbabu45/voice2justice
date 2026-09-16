import { createChatSession, saveChatMessage, getChatHistory, closeChatSession } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

// POST /api/sessions — create a new chat session
export async function POST(request) {
  const token = getTokenFromRequest(request);
  const user  = token ? verifyToken(token) : null;
  const { language = 'en' } = await request.json();

  const session_id = createChatSession({ user_id: user?.id, language });
  return Response.json({ session_id });
}

// GET /api/sessions?id=xxx — fetch message history for a session
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get('id');
  if (!session_id) return Response.json({ error: 'session id required' }, { status: 400 });
  const messages = getChatHistory(session_id);
  return Response.json({ messages });
}

// PATCH /api/sessions — save a message or close session
export async function PATCH(request) {
  const body = await request.json();
  const { action, session_id } = body;

  if (action === 'save_message') {
    const { role, content, audio_url } = body;
    saveChatMessage({ session_id, role, content, audio_url });
    return Response.json({ success: true });
  }
  if (action === 'close') {
    closeChatSession(session_id);
    return Response.json({ success: true });
  }
  return Response.json({ error: 'Unknown action' }, { status: 400 });
}
