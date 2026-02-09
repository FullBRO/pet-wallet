import {DataTypes, Model} from 'sequelize';
import {sequelize} from '../sequelize.js'

export class Payload extends Model {
    declare id: number;
    declare payload: string;
    declare status: string;
    declare error: string;
}

Payload.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        references: {
            model: 'events',
            key: 'id'
        }    
    },
    status: {
        type: DataTypes.ENUM('received', 'processed', 'invalid', 'failed'),
        allowNull: false,
        defaultValue: 'received'
    },
    error: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    payload: {
        type: DataTypes.STRING(2048),
        allowNull: false
    }
},
{
    sequelize,
    tableName: 'payloads',
    timestamps: false,
})

