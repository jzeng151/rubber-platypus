import type { Message } from '../store/useChatStore'

const API_TIMEOUT = 10000

interface SocraticResponse {
  response: string
  fallback?: boolean
}

export async function sendMessage(messages: Message[]): Promise<SocraticResponse> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT)

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        mode: 'socratic',
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      throw new Error(`API returned ${res.status}`)
    }

    const data = await res.json()
    return { response: data.response, fallback: data.fallback }
  } finally {
    clearTimeout(timeout)
  }
}
