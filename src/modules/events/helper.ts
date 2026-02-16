import { Transaction, UniqueConstraintError } from "sequelize"
import { Event, Payload, User, Transaction as TransactionModel } from "../../db/models/index.js"
import { postEventQueue } from "./bull.js"
import { EVENT_STATUSES, PostEventData, GetEventData, TypeDetailsMap } from "./constants.js"

export async function createEvent(data: PostEventData, transaction: Transaction): Promise<Event | null>{
    try{

        const event = await Event.create({
            source: data.source, 
            type: data.type,
            occurred_at: data.timestamp,
            event_uid: data.id,
        }, 
        {transaction})

        await Payload.create({
            id: event.id,
            payload: JSON.stringify(data.data)
        },
        {transaction})

        await Event.update({
            status: EVENT_STATUSES.processing
        }, {
            where: {
                id: event.id, 
                status: EVENT_STATUSES.received
            },
            transaction
        })
        
        transaction.afterCommit(()=>{
            postEventQueue
            .add('process',{eventId: event.id}, { jobId: `event_${event.id.toString()}`})
            .catch(error => console.error(error))
        })
        
        return event
    }catch(error){
        if(error instanceof UniqueConstraintError){
            return await Event.findOne({
                where: {
                    event_uid: data.id,
                    source: data.source
                },
                transaction
                }
            )
        }
        console.error(error)
        return null;
    }
}

export async function getEventById(data: GetEventData, transaction: Transaction){
    const event = await Event.findByPk(data.id, {transaction});
    if(!event) return null;
    const details = await parseType(event.type as keyof typeof TypeDetailsMap, data.id, transaction)
    
    return {event, details}
}


async function parseType(type: keyof typeof  TypeDetailsMap, id: string, transaction: Transaction): Promise<User | TransactionModel | null>{
    const model = TypeDetailsMap[type]
    return await model.findByPk(id, {transaction})
}
