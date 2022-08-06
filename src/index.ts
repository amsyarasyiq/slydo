require('dotenv').config();
import SlydoBot from "./structures/SlydoBot";

export const config = require("../config.json");

const client = new SlydoBot();

if (!process.env.TOKEN) {
    throw new Error('No token was provided. Please set TOKEN environment variable.');
}

client.login(process.env.TOKEN);
