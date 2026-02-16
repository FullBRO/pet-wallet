import {z} from "zod"
import { User, Transaction as TransactionModel} from "../../db/models/index.js"

export const EVENT_STATUSES = {
    received: 'received',
    processing: 'processing',
    processed: 'processed',
    failed: 'failed'
}

type PayloadByType = {
    tx: TransactionPayload; //rest is commented until implemented
    user: UserPayload;
    //game: { tg_user_id: number; game_id: number; round_id?: number };
    //leaderboard: { week_start: string; metric: string; snapshot: unknown[] };
};

type EventType = keyof PayloadByType

export type PostEventData<T extends EventType = EventType> = {
  id: string;
  source: string;
  type: T;
  timestamp: Date;
  data: PayloadByType[T];
};

//Zod Schemas
const UserPayloadSchema = z.object({
    tg_user_id : z.coerce.bigint(),
    username: z.string(),
    action: z.string(),
    bonus: z.int(),
    timestamp: z.coerce.date()
}).strict();

const TransactionPayloadSchema = z.object({
    currency: z.string(),
    txHash: z.string(),
    sender: z.string().optional(),
    receiver: z.string().optional(),
    message: z.string().optional(),
    amount: z.string(),
    status: z.enum(["completed", "failed", "returned", "lost"]).optional(),
}).strict();

//Schema-based types
export type TransactionPayload = z.infer<typeof TransactionPayloadSchema>
export type UserPayload = z.infer<typeof UserPayloadSchema>

//Processors (Schema-Model pairs)
const UserPayloadProcessor = {
    schema: UserPayloadSchema,
    model: User
}
const TransactionPayloadProcessor = {
    schema: TransactionPayloadSchema,
    model: TransactionModel
}

//Processor Registry (Schema-Model map)
export const ProcessorRegistry = {
    USER: UserPayloadProcessor,
    TRANSACTION: TransactionPayloadProcessor
} as const



//additional types
export type GetEventData = {
    id: string;
}



export const TypeDetailsMap = {
    user: User,
    tx: TransactionModel
} as const
