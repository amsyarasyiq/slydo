import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { PluginBase, PluginEvents } from "../../src/interfaces/PluginBase";
import CommandUsage from "../../src/handler/database_handler/CommandUsage";
import images from "./assets/images.json";

const commandBuilder = new SlashCommandBuilder()
    .setName('megu')
    .setDescription('gives you megus');

const onInteraction = async (interaction: CommandInteraction) => {
    await interaction.reply(images[Math.floor(Math.random() * images.length)]);
    CommandUsage.increaseUsageCount(commandBuilder.name);
};

export const metadata: PluginBase = {
    name: "Megu",
    version: "0.1.0",
    invokeEvent: (eventName: PluginEvents, args: any[]) => {
        switch (eventName) {
            case 'onCommandsDeployment': {
                const [commands] = args;
                commands.push(commandBuilder.toJSON());
                break;
            }
            case 'onRegisterCommands': {
                const [client] = args;
                client.slashCommands.set(commandBuilder.name, {
                    data: commandBuilder,
                    execute: onInteraction 
                });
                break;
            }
        }
    }
};