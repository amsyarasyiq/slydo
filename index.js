require('dotenv').config();

const Discord = require('discord.js');
const { botId } = require('./config.json');
const client = new Discord.Client({intents: new Discord.Intents(32767)});

client.on('ready', () => {
  console.log(`Logged in...`);
});

client.on('messageCreate', msg => {
    if (msg.author.id === botId) return;

    msg.content.trim() == 'ping' && msg.reply('pong');
});

client.login(process.env.TOKEN);