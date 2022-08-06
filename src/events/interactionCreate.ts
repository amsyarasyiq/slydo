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
            const command: any = slydoClient.slashCommands.get(interaction.commandName);
            if (!command) return;

            command.execute(interaction);
        }

        if (interaction.isSelectMenu()) {
            slydoClient.plugins.find(x => interaction.customId.split(":")?.[0] === x.name)?.handleSelectMenu(interaction);
        }
    }
};