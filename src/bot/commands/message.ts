import type {Message, ChatId} from 'node-telegram-bot-api'
import {bot} from '../instance.js'
import { User } from '../../db/models/User.js'
import { atomicTransaction } from '../../db/helper.js'
import { Transaction } from 'sequelize'

export async function startThread(msg: Message): Promise<void> {
    const startMessage = await bot.sendMessage(msg.chat.id, "Name a user you want to message", {reply_markup: {force_reply: true}})
    const user = bot.onReplyToMessage(startMessage.chat.id, startMessage.message_id, validateReceiver) //onReplyToMessage does not return values. todo:  Move following logic to validateReceiver and further
    if(!user) {
         return await startThread(msg)
    }
    const fwMessage = await bot.sendMessage(msg.chat.id, "Let me forward your message", {reply_markup: {force_reply: true}})
    //await forwardMessage(fwMessage, user.id, await getUsernameById(msg.chat.id))

}

async function getUsernameById(id: ChatId): Promise<string>{
    const user = await atomicTransaction(new getUserByIdData(String(id)), getUserById)
    if(!user) return "Unknown"
    return user.username;
}

async function getUserById(data: getUserByIdData, transaction: Transaction){
    return await User.findByPk(data.id)
}

async function forwardMessage(msg: Message, receiver: ChatId, sender: string){
    if(msg.text){
        bot.sendMessage(receiver, msg.text)
    }
    else if(msg.sticker){
        bot.sendSticker(receiver, msg.sticker?.file_id)
    }
    else if(msg.photo && msg.photo.length > 0){
        bot.sendPhoto(receiver, msg.photo[msg.photo.length - 1]?.file_id || "", {caption: msg.caption || ""})
    }
    else if(msg.video){
        bot.sendVideo(receiver, msg.video.file_id, {caption: msg.caption || ""})
    }
    else if(msg.voice){
        bot.sendAudio(receiver, msg.voice.file_id)
    }
    else if(msg.document){
        bot.sendDocument(receiver, msg.document.file_id, {caption: msg.caption || ""})
    }
    else bot.sendMessage(msg.chat.id, "Could not deliver your message. Maybe i can't process this type of message yet? Ask dev about it")
}

async function validateReceiver(msg: Message): Promise<User | null>{
    try{
        const user = atomicTransaction(new getUserByUsernameData(msg.text), getUserByUsername)
        if(!user) return null;
        return user
    } catch(error){
        console.error(error)
        bot.sendMessage(msg.chat.id, "User not found. Try again")
        return null
    }
}

class getUserByUsernameData extends Object {
    username: string = '';
    constructor(username: string = '') {
        super()
        this.username = username;
    }
}

class getUserByIdData extends Object {
    id: string = '';
    constructor(id: string = ''){
        super()
        this.id = id
    }
}


async function getUserByUsername(data: getUserByUsernameData, transaction: Transaction){
    return await User.findOne({where:{ username: data.username}, transaction})
}
