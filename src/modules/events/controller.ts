import type {Request, Response} from 'express'
import { atomicTransaction } from '../../db/helper.js'
import { createEvent } from './helper.js';
import { EVENT_STATUSES } from './constants.js';

export async function postEvent(req: Request, res: Response){
    const {source, id, type, timestamp, data} = req.body
    const event = await atomicTransaction({id, source, type, timestamp: new Date(timestamp), data}, createEvent)
    if(!event) {
        return res.status(500).json({error: "Internal error"})
    }
    if(event.status!==EVENT_STATUSES.received) {
        return res.status(409).json({message: "Event exists already. No changes made", event})
    }
    if(event) return res.status(202).json({message: 'Accepted', id: event.id})
    return res.status(500).json({error: "Internal error"})
}


