import { env } from '../../config/env.js'

export function startBot(): void {
  console.log('Starting Telegram bot...')
  console.log('Token prefix:', env.BOT_TOKEN.slice(0, 5) + '...')
}
