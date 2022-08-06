import { ActionRowBuilder, CacheType, SelectMenuBuilder, SelectMenuInteraction, SlashCommandBuilder } from "discord.js";
import { PluginBase, SlashCommandDict } from "../../src/structures/PluginBase";
import { getUniqueSelectId } from "../../src/handler/menuHelper";

export default class Trivia extends PluginBase {
    get name() { return "Trivia"; }
    get version() { return "0.1.0"; }

    get description() {
        return "A plugin that provides a trivia game.";
    }

    onCommandsDeployment(): SlashCommandBuilder[] {
        return Object.values(this.commandBuilders);
    }

    onRegisterCommands(collection: SlashCommandDict) {
        collection.set(this.commandBuilders.trivia.name, {
            data: this.commandBuilders.trivia,
            execute: async (interaction) => {
                const row: any = new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId(getUniqueSelectId(this))
                            .setPlaceholder('Nothing selected')
                            .addOptions(
                                {
                                    label: 'Natsu Megumi',
                                    description: 'choose this',
                                    value: 'first_option',
                                },
                                {
                                    label: 'Maya Jouga',
                                    description: 'not this',
                                    value: 'second_option',
                                },
                            ),
                    );

                await interaction.reply({ content: "Who is the best girl in Gochiusa?", components: [row] });
            }
        });
    }

    handleSelectMenu(interaction: SelectMenuInteraction<CacheType>): void {
        console.log(interaction.values);
        if (interaction.values.shift()?.trim() !== "first_option") {
            interaction.reply("You chose the wrong one.");
        }
    }

    commandBuilders = {
        trivia: new SlashCommandBuilder().setName('trivia').setDescription('starts a trivia game')
    };
}