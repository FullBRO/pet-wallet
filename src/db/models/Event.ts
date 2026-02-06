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
    provider: {
        type: DataTypes.STRING(8),
        allowNull: false,
    },
    external_event_id: {
        type: DataTypes.STRING(32),
        allowNull: false
    },
    payload_json: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('received', 'processing', 'processed', 'failed'),
        allowNull: false,
        defaultValue: 'received'
    },
    type: {
        type: DataTypes.STRING(16),
        allowNull: false,
        defaultValue: 'undefined'
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
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
},
{
    sequelize,
    tableName: 'events',
    timestamps: false,
    indexes: [
        {
            unique: true,
            name: 'uniq_events_provider_external',
            fields: ['provider', 'external_event_id'],
        },
    ],
})

