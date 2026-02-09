import { Sequelize, Transaction } from "sequelize";
import { sequelize } from "./sequelize.js";

export async function atomicTransaction<D, R>(
    data: D, 
    commitFunction: (data:D, tx: Transaction) => Promise<R> | R, 
    transaction: Transaction | null = null, 
    sequelizeInstance: Sequelize = sequelize,
): Promise<R>{
    
    let ownTransaction = false;

    if (!transaction){
        transaction = await sequelizeInstance.transaction();
        ownTransaction = true;
    }

    try {
        const result = await commitFunction(data, transaction);

        if (ownTransaction) {
            console.log("commit")
            await transaction.commit();
        }

        return result;
    } catch (error) {
        if (ownTransaction && transaction) {
            await transaction.rollback();
        }

        throw error; 
    }
}


