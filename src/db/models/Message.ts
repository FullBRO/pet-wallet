import {DataTypes, Model} from 'sequelize';
import {sequelize} from '../sequelize.js'

export class Message extends Model {
    declare id: number;
    declare username: string;
    declare created_at: Date;
}

Message.init({
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    from_ser_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references:{
            model: "users",
            key: "id"
        }
    },
    to_user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references:{
            model: "users",
            key: "id"
        }
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
},
{
    sequelize,
    tableName: "messages",
    timestamps: false
})


