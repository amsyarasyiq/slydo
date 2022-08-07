import { prefix, botOwner } from "../../config.json";
import { Collection, ChannelType, Client, Interaction } from "discord.js";
import SlydoBot from "../structures/SlydoBot";

export default {
    // name of event
    name: "interactionCreate",

    // executed when event is fired
    execute: async (interaction: Interaction) => {
        const slydoClient = interaction.client as SlydoBot;

        if (interaction.isChatInputCommand()) {
            const plugin = slydoClient.plugins.find(p => p.commandBuilders.map(x => x.name).includes(interaction.commandName));

            if (plugin) {
                plugin.handleCommandInteraction(interaction);
                return;
            }

            // native commands
            const command: any = slydoClient.slashCommands.get(interaction.commandName);
            if (!command) return;

            command.execute(interaction);
        }

        if (interaction.isSelectMenu()) {
            const plugin = slydoClient.plugins.find(p => p.ownSelectMenu(interaction));
            if (plugin) {
                plugin.handleSelectMenuInteraction(interaction);
                return;
            }

            // native select menus
        }
    }
};