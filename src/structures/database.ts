import path = require("path");
import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
    logging: () => {},
    dialect: "sqlite",
    storage: path.join(__dirname, `../../db.sqlite3`),
});