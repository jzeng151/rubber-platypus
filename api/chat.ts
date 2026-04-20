import type { VercelRequest, VercelResponse } from '@vercel/node'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface RequestBody {
  messages: ChatMessage[]
  mode: 'socratic' | 'quack'
}

const SYSTEM_PROMPT = `You are Perry, a rubber duck debugger (but a platypus). The user describes a bug or problem. You NEVER give the answer. You ask questions that help them think through it. Be warm, slightly quirky, occasionally snarky. Reference platypus things (bills, tails, swimming, egg-laying) when appropriate. Keep responses short (1-3 sentences max).

Key constraints:
- Never give the answer directly
- Ask one question at a time
- If the user is going in circles, point that out
- If the user solves it, celebrate`

const MAX_MESSAGES = 20
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 20

// In-memory rate limiting (resets on cold start, acceptable for MVP)
const rateLimitMap = new Map<string, number[]>()

function getClientIp(req: VercelRequest): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) || []
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW)
  rateLimitMap.set(ip, recent)
  return recent.length >= RATE_LIMIT_MAX
}

function recordRequest(ip: string) {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) || []
  timestamps.push(now)
  rateLimitMap.set(ip, timestamps)
}

function validateBody(body: unknown): body is RequestBody {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  if (b.mode !== 'socratic' && b.mode !== 'quack') return false
  if (!Array.isArray(b.messages)) return false
  return (b.messages as unknown[]).every(
    (m) =>
      m &&
      typeof m === 'object' &&
      typeof (m as Record<string, unknown>).role === 'string' &&
      typeof (m as Record<string, unknown>).content === 'string'
  )
}

function trimMessages(messages: ChatMessage[]): ChatMessage[] {
  const systemMsg = messages.find((m) => m.role === 'system')
  const nonSystem = messages.filter((m) => m.role !== 'system')
  const trimmed = nonSystem.slice(-MAX_MESSAGES)
  return systemMsg ? [systemMsg, ...trimmed] : trimmed
}

const FALLBACK_QUACKS = [
  'Quack!',
  'Quack quack!',
  '*confused platypus noises*',
  'Quack? Quack quack!',
  '*the platypus stares blankly*',
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate limiting
  const ip = getClientIp(req)
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests' })
  }
  recordRequest(ip)

  // Validation
  if (!validateBody(req.body)) {
    return res.status(400).json({ error: 'Invalid request body' })
  }

  // Quack mode should not reach the API
  if (req.body.mode === 'quack') {
    return res.status(400).json({ error: 'Quack mode is client-side only' })
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...trimMessages(req.body.messages),
  ]

  try {
    const apiKey = process.env.LLM_API_KEY
    const provider = process.env.LLM_PROVIDER || 'openai'

    if (!apiKey) {
      throw new Error('LLM_API_KEY not configured')
    }

    let responseText: string

    if (provider === 'claude') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 200,
          system: SYSTEM_PROMPT,
          messages: messages
            .filter((m) => m.role !== 'system')
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await response.json()
      responseText = data.content?.[0]?.text || FALLBACK_QUACKS[Math.floor(Math.random() * FALLBACK_QUACKS.length)]
    } else {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          max_tokens: 200,
          messages,
        }),
      })
      const data = await response.json()
      responseText = data.choices?.[0]?.message?.content || FALLBACK_QUACKS[Math.floor(Math.random() * FALLBACK_QUACKS.length)]
    }

    return res.status(200).json({ response: responseText })
  } catch {
    // Fallback to quack on error
    const quack = FALLBACK_QUACKS[Math.floor(Math.random() * FALLBACK_QUACKS.length)]
    return res.status(200).json({ response: quack, fallback: true })
  }
}
