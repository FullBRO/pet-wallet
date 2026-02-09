import {DataTypes, Model} from 'sequelize';
import {sequelize} from '../sequelize.js'

export class Event extends Model {
    declare id: number;
    declare provider: string;
    declare external_event_id: string;
    declare payload_json: string;
    declare status: string;
    declare type: string;
    declare created_at: Date;
    declare updated_at: Date;
    declare error: string;
    declare attempts: number;
}

Event.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    event_uid: {
        type: DataTypes.STRING(64),
        allowNull: false,
    },
    source: {
        type: DataTypes.STRING(8),
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'undefined'
    },
    status: {
        type: DataTypes.ENUM('received', 'processing', 'processed', 'failed', 'ignored'),
        allowNull: false,
        defaultValue: 'received'
    },
    error: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    attempts: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1
    },
    occured_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    received_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    processed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    }
},
{
    sequelize,
    tableName: 'events',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['event_uid', 'source']
        },
        {
            fields: ['type', 'occured_at'],
        },
        {
            fields: ['status', 'received_at'],
        }
    ],
})

