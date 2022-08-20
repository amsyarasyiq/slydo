import { ActionRowBuilder, CacheType, CommandInteraction, SelectMenuBuilder, SelectMenuInteraction, SlashCommandBuilder } from "discord.js";
import { PluginBase, SlashCommandDict } from "../../src/structures/PluginBase";
import { getUniqueSelectId } from "../../src/handler/menuHelper";
import { TriviaBase } from "./Trivia";
import { Responses } from "./interface/TriviaResponse";
import { default as TriviaHandler } from "./databaseHandler";

export default class Trivia extends PluginBase {
    static instance: Trivia;
    static triviaInstances: TriviaBase[] = [];

    get name() { return "Trivia"; }
    get version() { return "0.1.0"; }

    get description() {
        return "A plugin that provides a trivia game.";
    }

    commandBuilders: SlashCommandBuilder[] = [
        new SlashCommandBuilder().setName('trivia').setDescription('starts a trivia game')
    ];

    loadSubcommands() {
        this.commandBuilders[0]
            .addSubcommand(subCommand => 
                subCommand.setName('start').setDescription('starts a trivia game')
            ).addSubcommand(subCommmand => 
                subCommmand.setName('end').setDescription('ends a trivia game')
                    .addIntegerOption(op => op
                        .setName('id')
                        .setDescription('the ID of the trivia game to end')
                        .setRequired(true)
                )
            ).addSubcommand(subCommmand => 
                subCommmand.setName('stats').setDescription('your current stats on trivia')
            ); 
    }

    async load() {
        this.loadSubcommands();
        Trivia.instance ??= this;

        const restoredTrivias = await TriviaHandler.getAllTrivia();
        Trivia.triviaInstances.push(...restoredTrivias);
    }

    onCommandsDeployment(): SlashCommandBuilder[] {
        this.loadSubcommands();
        return this.commandBuilders;
    }

    async handleCommandInteraction(interaction: CommandInteraction) {
        if (interaction.commandName !== "trivia") return;

        switch ((interaction.options as any).getSubcommand()) {
            case "start": {
                const trivia = new TriviaBase({
                    question: "",
                    choices: [
                        { label: "チョコリズムチョコルール", description: "Choco Rhythm Choco Rule" }, 
                        { label: "COCOATIC BAR" }, 
                        { label: "きらめきカフェタイム", description: "Kirameki Café Time" }, 
                        { label: "全天候型いらっしゃいませ", description: "Zentenkougata Irasshaimase" },
                        { label: "日常デコレーション", description: "Nichijou Decoration" },
                        { label: "きらきら印を見つけたら", description: "Kirakirajirushi wo Mitsuketara" }
                    ],
                    answer: 0,
                    attachments: [
                        "https://cdn.discordapp.com/attachments/1003338798253494342/1004977058306326578/song.mp4"
                    ],
                    isRestoration: false
                });
        
                await trivia.sync();
                trivia.question = `Trive ${trivia.triviaId} | What is the title of the song?`;
        
                Trivia.triviaInstances.push(trivia);
                await trivia.send(interaction);
                return;
            } case "end": {
                const triviaId = (interaction.options as any).getInteger("id");
                const trivia = Trivia.triviaInstances.find(t => t.triviaId === triviaId);
                if (!trivia) {
                    await interaction.reply({ content: "Couldn't find a trivia instance with that ID", ephemeral: true });
                    return;
                }

                await trivia.end(interaction);
                await interaction.reply({ content: "Successfully ended trivia!", ephemeral: true });
                return;
            } case "stats": {
                const { won, lost } = await TriviaHandler.getUserStats(interaction.member!.user.id);
                await interaction.reply({ content: `You've got ${won} correct and ${lost} wrong guess(es) so far.`, ephemeral: true });
                return;
            }
        }
    }


    async handleSelectMenuInteraction(interaction: SelectMenuInteraction<CacheType>) {
        await interaction.deferReply({ ephemeral: true });

        const res = interaction.values.shift()!.trim();
        const triviaInstance = await this.getTriviaInstance(res);
        const response = await triviaInstance?.update(interaction.member!.user.id, res);

        let content: string;

        switch (response) {
            case Responses.CORRECT: {
                const { won, lost } = await TriviaHandler.getUserStats(interaction.member!.user.id);
                content = `You're correct! You've got ${won} correct and ${lost} wrong guess(es) so far.`;
                break;
            }
            case Responses.INCORRECT: {
                const { won, lost } = await TriviaHandler.getUserStats(interaction.member!.user.id);
                content = `You're wrong, better luck next time! You've got ${won} correct and ${lost} wrong guess(es) so far.`;
                break;
            }
            case Responses.INVALID_TRIVIA_ID:
                content = "An error occurred: Trivia ID is does not match/invalid";
                break;
            case Responses.ALREADY_ANSWERED:
                content = "You've already answered this trivia";
                break;
            default:
                content = `Something went wrong! Error: ${response}`;
                break;
        }

        await interaction.followUp({ content, ephemeral: true });
    }

    async getTriviaInstance(response: string): Promise<TriviaBase | undefined> {
        const resId = parseInt(response.split(':')[0]);
        const trivia = Trivia.triviaInstances.find(t => t.triviaId === resId);
        
        if (!trivia) {
            console.log({ content: "No trivia instance found" });
            return;
        }

        return trivia;
    }
}