import NodeCache from 'node-cache'
const cache = new NodeCache({ stdTTL: 10, checkperiod: 30 })
export default cache

export async function getOrSet<T>(key: string, fetch: () => Promise<T>, ttl: number = 10): Promise<T> {
  const cached = cache.get<T>(key)
  if (cached !== undefined) return cached
  const data = await fetch()
  cache.set(key, data, ttl)
  return data
}