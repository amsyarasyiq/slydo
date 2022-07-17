import { prefix, botOwner } from "../../config.json";
import { Collection, ChannelType, Client, Interaction } from "discord.js";
import SlydoBot from "../structures/SlydoBot";

export default {
    // name of event
    name: "interactionCreate",

    // executed when event is fired
    execute: async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command: any = (interaction.client as SlydoBot).slashCommands.get(interaction.commandName);
        if (!command) return;

        command.execute(interaction);
    }
};