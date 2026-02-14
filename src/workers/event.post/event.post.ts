import { Worker, QueueEvents } from 'bullmq';
import type { Job } from 'bullmq'
import { Payload } from '../../db/models/Payload.js';
import { atomicTransaction } from '../../db/helper.js';
import { Transaction } from 'sequelize';
import { Event } from '../../db/models/Event.js';
import { postEventQueueData } from '../../modules/events/bull.js';
import { env } from '../../config/env.js';
import { Redis, RedisOptions } from 'ioredis';
import { Transaction as TransactionModel } from '../../db/models/Transactions.js'
import { ZodError } from 'zod';
import { EVENT_STATUSES } from '../../modules/events/constants.js';
import {parseAndUpsert} from './helper.js'

const redisOptions: RedisOptions = {
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),
  maxRetriesPerRequest: null,
};

const connection = new Redis(redisOptions);
const workerConnection = connection.duplicate();            
const eventsConnection = connection.duplicate();

export const POST_EVENT_QUEUE = 'event_post'
const queueEvents = new QueueEvents(POST_EVENT_QUEUE, { connection: eventsConnection });

queueEvents.on('completed', ({jobId, returnvalue}) => {
    console.log("[completed]", jobId, returnvalue)
})

queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.log('[failed]', jobId, failedReason);
})


const worker = new Worker(
    POST_EVENT_QUEUE,
    preatomicPost,
    {
        connection: workerConnection,
        concurrency: 10
    }

)
await queueEvents.waitUntilReady();
await worker.waitUntilReady();

async function preatomicPost(job: Job<postEventQueueData>) {
    return await atomicTransaction(job.data, processPost)
}

const typeMap = {
    tx: 'TRANSACTION',
    user: 'USER'
} as const

type EventTypeKey = keyof typeof typeMap;

interface EventInterface {
    type: EventTypeKey;
}

async function processPost(data: postEventQueueData, transaction: Transaction): Promise<TransactionModel | null>{
    const id = data.eventId
    const event = await Event.findByPk(id, {transaction})
    if(!event){
        throw new Error("Event not found while processing")
    }
    if(event.status===EVENT_STATUSES.processed){
        return null;
    }
    await event.update({status: EVENT_STATUSES.processing}, {transaction})
    await event.increment(['attempts'], {by:1, transaction})
    const payload = await Payload.findByPk(id, {transaction})
    if(!payload) {
        throw new Error("Payload not found")
    }
    let row = null;
    try{
        if (!(event.type in typeMap)) {
            throw new Error(`Unknown event type: ${event.type}`);
        }
        const type = typeMap[event.type as keyof typeof typeMap];
        row = await parseAndUpsert(payload.payload, id, type, transaction)

    } catch(error){
        if(error instanceof ZodError || (error instanceof Error && error.message==="JSON is invalid")){
            await payload.update({ status: "invalid" }, {transaction});
            await event.update({ status: EVENT_STATUSES.failed, error: "Strucural non-retryable error" }, {transaction});
            return null
        }
        await payload.update({status: 'processing'})
        await event.update({ status: EVENT_STATUSES.failed, error: "Unrecognized retryable error" });
        throw new Error(`Unrecognize error. Source: ${error}`)
    }
    if(row){
        await payload.update({status: 'processed'}, {transaction})
        await event.update({status: EVENT_STATUSES.processed, error: null}, {transaction})
    }
    return row
}


async function shutdown() {
    console.log("Shutting down...");
    await worker.close();
    await queueEvents.close();
    await eventsConnection.quit();
    await connection.quit();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
