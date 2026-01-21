import { bot } from './instance.js'
import { COMMANDS } from './command-table.js'
import type { Message } from 'node-telegram-bot-api'


function commandHandler(msg: Message, match: RegExpExecArray | null){
    if (!msg.text) return

    const command = COMMANDS.find(c => c.command === msg.text)
    if (command) {
        command.handler(msg, bot)
    } else{
        if(!msg.reply_to_message) bot.sendMessage(msg.chat.id, `I hear you, ${msg.from?.username ?? 'stranger'}`)
    }
}

bot.onText(RegExp("/*"), commandHandler)
