import * as commands from './commands/index.js'
import type { Message } from 'node-telegram-bot-api'
import type TelegramBot from 'node-telegram-bot-api'

export type CommandHandler = (msg: Message, bot: TelegramBot) => void

export interface Command {
  command: string
  handler: CommandHandler
}

export const COMMANDS: Command[] = [
  { command: '/start', handler: commands.start },
]
