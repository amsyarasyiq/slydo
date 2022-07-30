require('dotenv').config();
import SlydoBot from "./structures/SlydoBot";

const client = new SlydoBot();

if (!process.env.TOKEN) {
    throw new Error('No token?');
}

client.login(process.env.TOKEN);
