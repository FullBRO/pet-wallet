import type {Request, Response} from 'express'
import { atomicTransaction } from '../../db/helper.js'
import { createEvent, fetchEventById, fetchEventByIdData, postEventData } from './helper.js';
import { EVENT_STATUSES } from './constants.js';

export async function postEvent(req: Request, res: Response){
    const {provider, id, type, timestamp, data} = req.body
    const event = await atomicTransaction(new postEventData(id, provider, type, JSON.stringify(data), new Date(timestamp)), createEvent)
    if(!event) {
        return res.status(500).json({error: "Internal error"})
    }
    console.log(event.dataValues)
    if(event.status!==EVENT_STATUSES.received) {
        return res.status(409).json({message: "Event exists already. No changes made", event})
    }
    if(event) return res.status(202).json({message: 'Accepted', id: event.id})
    return res.status(500).json({error: "Internal error"})
}


export async function getEventById(req: Request, res: Response){
    const id = Number(req.params.id);



    const event = await atomicTransaction(new fetchEventByIdData(id),fetchEventById )

    if (event){
        return res.status(200).json(event.get())
    }
    return res.status(500).json({message: `No event with id ${id} found`})
}
