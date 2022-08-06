require('dotenv').config();

import fs from 'node:fs';
import path from 'node:path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord.js';
import { clientId } from './config.json';
import { PluginBase } from './src/structures/PluginBase';

const commands: any[] = [];
const commandsPath = path.join(__dirname, 'src/commands/slash');
const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.ts'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath.replace(".ts", ""));
	commands.push(command.default.data.toJSON());
}

// load commands for plugins
const pluginsPath = path.join(__dirname, 'plugins');
const plugins = fs.readdirSync(pluginsPath, { withFileTypes:true }).filter(dirent => dirent.isDirectory()).map(x => x.name);

for (const pluginFolders of plugins) {
    const plugin: PluginBase = require(path.join(pluginsPath, pluginFolders)).default;
    if (!plugin) continue;

	plugin.onCommandsDeployment().forEach(x => commands.push(x.toJSON()));
}

if (!process.env.TOKEN) {
    throw new Error('No token provided to deply commands!');
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);