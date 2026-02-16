import { Transaction, UniqueConstraintError } from "sequelize"
import { Event, Payload } from "../../db/models/index.js"
import { postEventQueue } from "./bull.js"
import { EVENT_STATUSES, PostEventData } from "./constants.js"

export async function createEvent(data: PostEventData, transaction: Transaction): Promise<Event | null>{
    try{

        const event = await Event.create(
            {
                source: data.source, 
                type: data.type,
                occurred_at: data.timestamp,
                event_uid: data.id,
            }, 
            {
                transaction
            }
        )
        await Payload.create({
            id: event.id,
            payload: JSON.stringify(data.data)
        },
        {transaction})
        await Event.update({status: EVENT_STATUSES.processing}, {where: {id: event.id, status: EVENT_STATUSES.received }, transaction})
        transaction.afterCommit(()=>{
            postEventQueue.add('process',{eventId: event.id}, { jobId: `event_${event.id.toString()}`})
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


