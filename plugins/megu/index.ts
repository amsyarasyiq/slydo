import { CacheType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { PluginBase, SlashCommandDict } from "../../src/structures/PluginBase";
import CommandUsage from "../../src/handler/database_handler/CommandUsage";
import images from "./assets/images.json";

export default class Megu extends PluginBase {
    get name() { return "Megu"; }
    get version() { return "0.1.1"; }

    commandBuilders = [
        new SlashCommandBuilder().setName('megu').setDescription('gives you megus'),
        new SlashCommandBuilder().setName('megu_count').setDescription('check how many times people has used megu'),
    ];

    onCommandsDeployment(): SlashCommandBuilder[] {
        return this.commandBuilders;
    }

    async handleCommandInteraction(interaction: CommandInteraction<CacheType>) {
        switch (interaction.commandName) {
            case "megu": this.replyWithImage(interaction); break;
            case "megu_count": this.sendUsageCount(interaction); break;
        }
    }
    
    sendUsageCount = async (interaction: CommandInteraction) => {
        await interaction.reply({ content: `${await CommandUsage.getUsageCount("megu")}`});
    };
    
    replyWithImage = async (interaction: CommandInteraction) => {
        await interaction.reply(images[Math.floor(Math.random() * images.length)]);
        CommandUsage.increaseUsageCount("megu");
    };
}