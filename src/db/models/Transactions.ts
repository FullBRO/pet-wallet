
import {DataTypes, Model} from 'sequelize';
import {sequelize} from '../sequelize.js'

export class Transaction extends Model {

}

Transaction.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        references: {
            model: 'events',
            key: 'id'
        }
    },
    sender: {
        type: DataTypes.STRING(32),
        allowNull: true,
    },
    receiver: {
        type: DataTypes.STRING(32),
        allowNull: true,
    },
    amount: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING(4),
        allowNull: false
    },
    txHash: {
        unique: true,
        type: DataTypes.STRING(64),
        allowNull: false
    },
    message: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    status: {
        type: DataTypes.ENUM('completed', 'failed', 'returned', 'lost'),
        allowNull: true,
        defaultValue: null
    }
},
{
    sequelize,
    tableName: 'transactions',
    timestamps: false,
    indexes: [

    ],
})

