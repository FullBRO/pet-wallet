import { Worker, QueueEvents } from 'bullmq';
import type {Job} from 'bullmq'
import { Payload } from '../db/models/Payload.js';
import { atomicTransaction } from '../db/helper.js';
import { Transaction } from 'sequelize';
import { Event } from '../db/models/Event.js';
import { postEventQueueData } from '../modules/events/bull.js';
import { env } from '../config/env.js';
import { Redis, RedisOptions } from 'ioredis';
import {Transaction as TransactionModel} from '../db/models/Transactions.js'
import {z, ZodError} from 'zod';
import { EVENT_STATUSES } from '../modules/events/constants.js';

const redisOptions: RedisOptions = {
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),
  maxRetriesPerRequest: null,
};

const connection = new Redis(redisOptions);
const workerConnection = connection;            
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
    const payload = await Payload.findByPk(id, {transaction})
    if(!payload) {
        throw new Error("Payload not found")
    }
    let row = null;
    try{
        switch(event.type){
            case 'tx':
                row = await parseTx(payload.payload, id, transaction)
                break;
            default:
                row = null
                break;
        }
    } catch(error){
        if(error instanceof ZodError){
            await payload.update({ status: "invalid" }, { transaction });
            await event.update({ status: "failed" }, { transaction });
            return null
        }
    }
    if(row){
        await payload.update({status: 'processed'}, {transaction})
        await event.update({status: EVENT_STATUSES.processed}, {transaction})
    }
    return row
}


async function parseTx(payloadString: string, id: number, transaction: Transaction): Promise<TransactionModel | null> {
    let transactionPayload;
    try{
        transactionPayload = TransactionPayloadSchema.parse(JSON.parse(payloadString))       
    }catch(error){
        //JSON is invalid, handle error
        if(error instanceof ZodError){
            throw error
        }
        console.log(error)
        throw new Error("JSON is invalid")
    }
    const row = await TransactionModel.upsert({...transactionPayload, id}, {transaction})
    return row[0]
}

export const TransactionPayloadSchema = z.object({
  currency: z.string(),
  txHash: z.string(),
  sender: z.string().optional(),
  receiver: z.string().optional(),
  message: z.string().optional(),
  amount: z.string(),
  status: z.enum(["completed", "failed", "returned", "lost"]).optional(),
}).strict();

export type TransactionPayload = z.infer<typeof TransactionPayloadSchema>;

async function shutdown() {
  console.log("Shutting down...");
  await worker.close();
  await queueEvents.close();
  await eventsConnection.quit();
  await connection.quit();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
