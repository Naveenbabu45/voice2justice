import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPTS } from '@/lib/constants';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { messages, language = 'en' } = body;

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'messages array is required' }, { status: 400 });
    }

    const systemPrompt = SYSTEM_PROMPTS[language] || SYSTEM_PROMPTS.en;

    // Filter to only user/assistant messages for API
    const apiMessages = messages
  .filter(m => m.role === 'user' || m.role === 'assistant')
  .map(m => ({ role: m.role, content: m.content }));

// Claude expects the conversation to begin with a user message.
// The initial assistant greeting is only a UI message.
if (apiMessages[0]?.role === 'assistant') {
  apiMessages.shift();
}

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: apiMessages,
    });

    const text = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    // Extract complaint JSON if present
    let complaintData = null;
    const jsonMatch = text.match(/COMPLAINT_JSON:(\{[\s\S]*?\})/);
    if (jsonMatch) {
      try {
        complaintData = JSON.parse(jsonMatch[1]);
      } catch {}
    }

    // Clean the message text (remove the JSON token)
    const cleanText = text.replace(/COMPLAINT_JSON:\{[\s\S]*?\}/, '').trim();

    return Response.json({
      message: cleanText,
      complaintData,
      usage: response.usage,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'AI service unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
