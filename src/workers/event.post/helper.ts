import { ZodError, z } from "zod";
import { Transaction as TransactionModel }  from "../../db/models/Transactions.js";
import type { Transaction } from "sequelize";
import { User } from "../../db/models/User.js";
import { ProcessorRegistry } from "../../modules/events/constants.js";



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
    return toJsonSafe(row[0].get({plain: true}))
}




export function toJsonSafe<T>(value: T): any {
    if (typeof value === "bigint") return value.toString();

    if (Array.isArray(value)) {
        return value.map(toJsonSafe);
    }

    if (value && typeof value === "object") {
        const out: Record<string, any> = {};

        for (const [k, v] of Object.entries(value as Record<string, any>)) {
            out[k] = toJsonSafe(v);
        }

        return out;
    }

    return value;
}

