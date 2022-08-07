import { ActionRowBuilder, APISelectMenuOption, BaseInteraction, Message, MessageOptions, RestOrArray, SelectMenuBuilder, SelectMenuComponentOptionData, SelectMenuInteraction, SelectMenuOptionBuilder } from "discord.js";
import Trivia from ".";
import { getUniqueSelectId } from "../../src/handler/menuHelper";
import { TriviaBuilder } from "./interface/TriviaBuilder";
import { default as TriviaHandler } from "./databaseHandler";
import { Responses } from "./interface/TriviaResponse";

// TODO: load triviabase from database
export class TriviaBase {
    triviaId?: number;
    question: string;
    choices: Partial<APISelectMenuOption>[];
    answer: number;
    attachments?: string[];

    guessedUsers: string[] = [];
    messageReferred?: Message<boolean>;

    constructor({ question, choices, answer, attachments }: TriviaBuilder) {
        this.question = question;
        this.choices = choices;
        this.answer = answer;
        this.attachments = attachments;
    }

    async sync(): Promise<void> {
        this.triviaId ??= await TriviaHandler.createNewTriviaId();
    }

    async send(interaction: BaseInteraction): Promise<Message<boolean> | undefined> {
        const row: any = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId(getUniqueSelectId(Trivia.instance))
                .setPlaceholder('Choose your answer')
                .addOptions(...await Promise.all(this.choices.map(async(choice: any, index: number) => {
                    choice.value = `${this.triviaId?.toString()}:${index.toString()}`;
                    return choice;
                })))
        );

        return this.messageReferred = await interaction.channel?.send({
            content: this.question,
            components: [row],
            files: this.attachments,
        });
    }

    async update(userId: string, response: string): Promise<Responses> {
        const resId = parseInt(response.split(':')[0]);
        const answer = parseInt(response.split(':')[1]);
        if (resId !== this.triviaId) {
            console.error(`${userId} tried to answer ${resId} but we are on ${this.triviaId}`);
            return Responses.INVALID_TRIVIA_ID;
        }

        if (this.guessedUsers.includes(userId)) {
            console.log(`The user \'${userId}\' tried to answer more than once`);
            return Responses.ALREADY_ANSWERED;
        }

        this.guessedUsers.push(userId);

        TriviaHandler.updateUserTrivia(userId, this.triviaId, answer === this.answer);
        return answer === this.answer ? Responses.CORRECT : Responses.INCORRECT;
    }

    async end() {
        await TriviaHandler.endTrivia(this.triviaId!);
        await this.messageReferred?.edit({ content: `*[The trivia ended <t:${Math.floor(new Date().getTime() / 1000)}:R>]*\n${this.messageReferred!.content}`, components: [] });
    }

    async isTrivia(value: string): Promise<boolean> {
        return value.split(':')[0] === this.triviaId?.toString();
    }

    addOption(...options: any[]): TriviaBase {
        this.choices.push(...options);
        return this;
    }
}