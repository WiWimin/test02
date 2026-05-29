import { PrismaClient } from '@prisma/client'

const p = new PrismaClient()

async function main() {
  try {
    const u = await p.user.create({
      data: { phone: '19800001111', password_hash: 'test', name: 'test', role: 'owner' }
    })
    console.log('OK', u.id)
  } catch (e: any) {
    console.error('Error:', e.code, JSON.stringify(e.meta))
  } finally {
    await p.$disconnect()
  }
}

main()
