import { Queue } from "bullmq";

import {connection} from '../../db/ioredis.js'


export const POST_EVENT_QUEUE = 'event_post'

export type postEventQueueData = {
    eventId: number;
}

export const postEventQueue = new Queue<postEventQueueData>(POST_EVENT_QUEUE, {
    connection,
    defaultJobOptions:{
        attempts: 5,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: 10,
        removeOnFail: 50
    }
})
