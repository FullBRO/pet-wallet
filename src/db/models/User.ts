import {DataTypes, Model} from 'sequelize';
import {sequelize} from '../sequelize.js'

export class User extends Model {
    declare id: number;
    declare username: string;
    declare created_at: Date;
}

User.init({
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING(32),
        allowNull: false,
        unique:true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
},
{
    sequelize,
    tableName: "users",
    timestamps: false
})


