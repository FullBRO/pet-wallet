import type TelegramBot from 'node-telegram-bot-api'
import type { Message } from 'node-telegram-bot-api'
import {bot} from '../instance.js'
import { User } from '../../db/models/User.js';

export async function start(msg: Message): Promise<void> {
    if (!msg.chat?.id) return;
    const chat_id = msg.chat.id;
    const user = await User.findOne({where: {id: msg.from?.id}})
    if(user) {
        bot.sendMessage(chat_id, `You are registered already, ${user.username}`);
        return;
    }
    await askName(msg);
}

async function askName(msg: Message) {
    const chatId = msg.chat.id;
    const sentMessage = await bot.sendMessage(chatId, 'Pick a username, please', {reply_markup: {force_reply: true}})
    bot.onReplyToMessage(chatId, sentMessage.message_id, getName)
}

async function getName(msg: Message){
    const username = msg.text?.trim();
    const chatId = msg.chat.id;

    if(username?.startsWith("/")){
        bot.sendMessage(msg.chat.id, "In order to use commands, you have to sign up")
        await askName(msg);
        return;
    }

    if (!username) {
      await bot.sendMessage(chatId, "Username can't be empty. Try again.");
      await askName(msg);
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,32}$/.test(username)) {
      await bot.sendMessage(chatId, "Username must be 3–32 chars: letters, numbers, underscore.");
      await askName(msg);
      return;
    }

    let user = {username: 'stranger'};
    let created = false;

    try{
        [user, created] = await User.findOrCreate({where: {username: msg.text}, defaults: {id: msg.from?.id, created_at: Date.now()}})
    } catch(error){
        console.error(error);
        bot.sendMessage(msg.chat.id, 'Error')
        return;
    }
    if(!created){
        bot.sendMessage(msg.chat.id, 'Username is taken already');
        await askName(msg);
        return;
    }
    bot.sendMessage(msg.chat.id, `You have succesfully signed up. Welcome, ${user.username}`)
}
