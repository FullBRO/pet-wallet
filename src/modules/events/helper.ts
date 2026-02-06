import { Transaction, UniqueConstraintError } from "sequelize"
import type {Identifier} from 'sequelize'
import { Event } from "../../db/models/Event.js"

export async function createEvent(data: postEventData, transaction: Transaction): Promise<Event | null>{
    try{

        const event = await Event.create(
            {
                provider: data.provider, 
                type: data.type,
                created_at: data.timestamp,
                external_event_id: data.id,
                payload_json: data.data
            }, 
            {
                transaction
            }
        )
        if(event) return event
        return null
    }catch(error){
        if(error instanceof UniqueConstraintError){
            return await Event.findOne({
                where: {
                    provider: data.provider,
                    external_event_id: data.id
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
        const event = await Event.findByPk(data.id)
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
    readonly provider: string = '';
    readonly type: string = '';
    readonly data: string = '{}';
    readonly timestamp: Date = new Date();
    constructor(id: string, provider: string, type: string, data: string, timestamp: Date){
       super()
       this.id = id;
       this.provider = provider;
       this.type = type;
       this.data = data;
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
