import {User} from './User.js'
import {Message} from "./Message.js"


Message.belongsTo(User, {foreignKey: "from_user_id", as: "fromUser"});
Message.belongsTo(User, {foreignKey: "to_user_id", as: "toUser"});

export {User, Message}
