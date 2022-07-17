import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import chars from "./assets/chars.json";
import CommandUsage from "../../src/handler/database_handler/CommandUsage";

export default (eventName: string, args: any[]) => {
    switch (eventName) {
        case 'onCommandsDeployment': {
            const [commands] = args;
            chars.forEach((character: any) => {
                const parse = {
                    data: new SlashCommandBuilder()
                        .setName(character.name)
                        .setDescription(`provides an adorable ${character.name} image!`),
                    execute: async (interaction: CommandInteraction) => {
                        await interaction.reply(character.links[Math.floor(Math.random()*character.links.length)]);
                    },
                };
            
                commands.push(parse.data.toJSON());
            });
            break;
        }
        case 'onSubscribeEvents': {
            // ignored
            break;
        }
        case 'onRegisterCommands': {
            const [client] = args;
            // load characters command
            chars.forEach((character: any) => {
                const parse = {
                    data: new SlashCommandBuilder()
                        .setName(character.name)
                        .setDescription(`provides an adorable ${character.name} image!`),
                    execute: async (interaction: CommandInteraction) => {
                        await interaction.reply(character.links[Math.floor(Math.random()*character.links.length)]);
                        CommandUsage.increaseUsageCount(interaction.commandName);
                    },
                };

                client.slashCommands.set(parse.data.name, parse);
            });
            break;
        }
    }
};