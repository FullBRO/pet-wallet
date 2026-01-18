import type TelegramBot from 'node-telegram-bot-api'
import type { Message } from 'node-telegram-bot-api'

export function start(msg: Message, bot: TelegramBot): void {
  if (!msg.chat?.id) return
  bot.sendMessage(msg.chat.id, '👋 Hello! I am in development 🙏')
}
