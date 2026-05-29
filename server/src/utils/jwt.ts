import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export function signToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any })
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string }
  } catch {
    return null
  }
}
