const codeMap = new Map<string, { code: string; expiresAt: number; sentAt: number }>()

const CODE_TTL = 5 * 60 * 1000
const RESEND_INTERVAL = 60 * 1000

export function generateCode(phone: string): { code: string } {
  const existing = codeMap.get(phone)
  if (existing && Date.now() - existing.sentAt < RESEND_INTERVAL) {
    const remaining = Math.ceil((RESEND_INTERVAL - (Date.now() - existing.sentAt)) / 1000)
    throw new Error(`请 ${remaining} 秒后再试`)
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  codeMap.set(phone, { code, expiresAt: Date.now() + CODE_TTL, sentAt: Date.now() })
  return { code }
}

export function verifyCode(phone: string, code: string): boolean {
  const entry = codeMap.get(phone)
  if (!entry) return false
  if (Date.now() > entry.expiresAt) {
    codeMap.delete(phone)
    return false
  }
  return entry.code === code
}

export function deleteCode(phone: string) {
  codeMap.delete(phone)
}
