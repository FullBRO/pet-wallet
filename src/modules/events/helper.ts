import { Transaction, UniqueConstraintError } from "sequelize"
import type {Identifier} from 'sequelize'
import { Event } from "../../db/models/Event.js"
import { postEventQueue } from "./bull.js"

export async function createEvent(data: postEventData, transaction: Transaction): Promise<Event | null>{
    try{

        const event = await Event.create(
            {
                source: data.source, 
                type: data.type,
                occured_at: data.timestamp,
                event_uid: data.id,
            }, 
            {
                transaction
            }
        )
        if(event) {
            postEventQueue.add('process', {eventId: event.id}, { jobId: String(event.id)})
            return event
        }
        return null
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


export async function fetchEventById(data: fetchEventByIdData, transaction: Transaction): Promise<Event | null>{
    try{
        const event = await Event.findByPk(data.id, {transaction})
        if( event) {
            return event;
        }
        return null;
    }catch(error){
        console.error(error);
        return null;
    }
}


export class postEventData extends Object {
    readonly id: string = '';
    readonly source: string = '';
    readonly type: string = '';
    readonly data: string = '{}'
    readonly timestamp: Date = new Date();
    constructor(id: string, source: string, type: string, timestamp: Date, data: string){
       super()
       this.data = data;
       this.id = id;
       this.source = source;
       this.type = type;
       this.timestamp = isNaN(timestamp.getTime()) ? new Date() : timestamp;
    }
}

export class fetchEventByIdData extends Object {
    readonly id: number = 0;
    constructor(id: number){
        super();
        this.id = id;
    }
}
