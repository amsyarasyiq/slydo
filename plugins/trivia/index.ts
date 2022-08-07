import { ActionRowBuilder, CacheType, CommandInteraction, SelectMenuBuilder, SelectMenuInteraction, SlashCommandBuilder } from "discord.js";
import { PluginBase, SlashCommandDict } from "../../src/structures/PluginBase";
import { getUniqueSelectId } from "../../src/handler/menuHelper";

export default class Trivia extends PluginBase {
    get name() { return "Trivia"; }
    get version() { return "0.1.0"; }

    get description() {
        return "A plugin that provides a trivia game.";
    }

    commandBuilders = [
        new SlashCommandBuilder().setName('trivia').setDescription('starts a trivia game')
    ];

    onCommandsDeployment(): SlashCommandBuilder[] {
        return this.commandBuilders;
    }

    async handleCommandInteraction(interaction: CommandInteraction<CacheType>) {
        if (interaction.commandName !== "trivia") return;

        const row: any = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId(getUniqueSelectId(this))
                    .setPlaceholder('Select your answer')
                    .addOptions(
                        {
                            label: 'チョコリズムチョコルール',
                            description: 'Choco Rhythm Choco Rule',
                            value: 'first_option',
                        },
                        {
                            label: 'COCOATIC BAR',
                            //description: 'not this',
                            value: 'second_option',
                        },
                        {
                            label: 'きらめきカフェタイム',
                            description: 'Kirameki Café Time',
                            value: 'third_option',
                        },
                        {
                            label: '全天候型いらっしゃいませ',
                            description: 'Zentenkougata Irasshaimase',
                            value: 'fourth_option',
                        },
                        {
                            label: '日常デコレーション',
                            description: 'Nichijou Decoration',
                            value: 'fifth_option',
                        },
                        {
                            label: 'きらきら印を見つけたら', 
                            description: 'Kirakirajirushi wo Mitsuketara',
                            value: 'sixth_option',
                        }
                    ),
            );

        await interaction.channel?.send({ content: ":microphone: [1s] Which Gochiusa song is this?", components: [row], files: [ "https://cdn.discordapp.com/attachments/1003338798253494342/1004977058306326578/song.mp4" ] });
    }

    guessedUsers: string[] = [];

    async handleSelectMenuInteraction(interaction: SelectMenuInteraction<CacheType>) {
        if (this.guessedUsers.includes(interaction.member?.user.id ?? "")) {
            await interaction.reply({ content: "You already guessed this one.", ephemeral: true });
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        if (interaction.values.shift()?.trim() !== "first_option") {
            interaction.followUp({ content: "You chose the wrong one.", ephemeral: true });
        } else {
            interaction.followUp({ content: "You chose the right one!", ephemeral: true });
        }

        this.guessedUsers.push(interaction.member?.user.id ?? "");
    }
}