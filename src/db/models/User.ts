import {DataTypes, Model} from 'sequelize';
import {sequelize} from '../sequelize.js'

export class User extends Model {
    declare id: number;
    declare username: string;
    declare created_at: Date;
}

User.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        references: {
            model: 'events',
            key: 'id'
        }
    },
    tg_user_id: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING(32),
        allowNull: false,
    },
    action: {
        type: DataTypes.STRING(16),
        allowNull: true,
        defaultValue: null
    },
    bonus: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }

},
{
    sequelize,
    tableName: "users",
    timestamps: false
})


