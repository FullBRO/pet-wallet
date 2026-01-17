import { bot } from './instance.js'
import { COMMANDS } from './command-table.js'
import type { Message } from 'node-telegram-bot-api'
import type TelegramBot from 'node-telegram-bot-api'

bot.on('message', (msg: Message) => {
    if (!msg.text) return

    const command = COMMANDS.find(c => c.command === msg.text)
    if (command) {
        command.handler(msg, bot)
    } else{
        bot.sendMessage(msg.chat.id, `I hear you, ${msg.from?.username ?? 'stranger'}`)
    }
})
