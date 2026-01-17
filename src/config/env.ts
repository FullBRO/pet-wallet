function requireEnv(key: string): string {
  const value = process.env[key]

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }

  return value
}

export const env = {
  BOT_TOKEN: requireEnv('BOT_TOKEN'),
  NODE_ENV: process.env.NODE_ENV ?? 'development'
} as const
