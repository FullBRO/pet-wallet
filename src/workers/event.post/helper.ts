import { ZodError, z } from "zod";
import { Transaction as TransactionModel }  from "../../db/models/Transactions.js";
import type { Transaction } from "sequelize";
import { User } from "../../db/models/User.js";

const UserPayloadSchema = z.object({
    tg_user_id : z.uint64,
    username: z.string,
    action: z.string,
    bonus: z.int,
    timestamp: z.date
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

const UserPayloadProcessor = {
    schema: UserPayloadSchema,
    model: User
}
const TransactionPayloadProcessor = {
    schema: TransactionPayloadSchema,
    model: TransactionModel
}
const ProcessorRegistry = {
    USER: UserPayloadProcessor,
    TRANSACTION: TransactionPayloadProcessor
} as const


export async function parseAndUpsert(
    payloadString: string, 
    id: number, 
    eventType: keyof typeof ProcessorRegistry,
    transaction: Transaction
){

    const def = ProcessorRegistry[eventType];

    if(!def){
        throw new Error("No processor")
    }
    let payload;
    try{
        payload = def.schema.parse(JSON.parse(payloadString))
    }catch(error){
        if(error instanceof ZodError){
            throw error
        }
        console.error(error)
        throw new Error("JSON is invalid")
    }
    const row = await def.model.upsert({...(payload as any), id}, {transaction})
    return row[0]
}
