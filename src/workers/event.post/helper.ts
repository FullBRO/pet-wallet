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
    return row[0]
}
