import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { PluginBase, SlashCommandDict } from "../../src/structures/PluginBase";
import CommandUsage from "../../src/handler/database_handler/CommandUsage";
import images from "./assets/images.json";

export default class Megu extends PluginBase {
    get name() { return "Megu"; }
    get version() { return "0.1.1"; }

    onCommandsDeployment(): SlashCommandBuilder[] {
        return Object.values(this.commandBuilders);
    }

    onRegisterCommands(collection: SlashCommandDict) {
        Object.values(this.commandBuilders).forEach(x => {
            collection.set(x.name, {
                data: x,
                execute:  this.handler(x.name)
            });
        });
    }

    commandBuilders = {
        megu: new SlashCommandBuilder().setName('megu').setDescription('gives you megus'),
        megu_count: new SlashCommandBuilder().setName('megu_count').setDescription('check how many times people has used megu'),
    };
    
    handler = (str: string) => {
        switch (str) {
            case "megu": return this.replyWithImage;
            case "megu_count": return this.sendUsageCount;
        }
    };
    
    sendUsageCount = async (interaction: CommandInteraction) => {
        await interaction.reply({ content: `${await CommandUsage.getUsageCount(this.commandBuilders.megu.name)}`});
    };
    
    replyWithImage = async (interaction: CommandInteraction) => {
        await interaction.reply(images[Math.floor(Math.random() * images.length)]);
        CommandUsage.increaseUsageCount(this.commandBuilders.megu.name);
    };
}