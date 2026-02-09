import { Sequelize } from "sequelize";
import {env} from '../config/env.js'

export const sequelize = new Sequelize(
  env.DB_NAME,
  env.DB_USER,
  env.DB_PASS,
  {
    host: env.DB_HOST ?? "127.0.0.1",
    port: env.DB_PORT ?? 3306,
    dialect: "mysql",
    logging: false//env.DB_LOG_SQL  ? console.log : false,
  }
);

sequelize.sync({alter: true})
