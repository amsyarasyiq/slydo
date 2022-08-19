import { ActionRowBuilder, APISelectMenuOption, BaseInteraction, Message, MessageOptions, RestOrArray, SelectMenuBuilder, SelectMenuComponentOptionData, SelectMenuInteraction, SelectMenuOptionBuilder, TextChannel } from "discord.js";
import Trivia from ".";
import { getUniqueSelectId } from "../../src/handler/menuHelper";
import { TriviaBuilder } from "./interface/TriviaBuilder";
import { default as TriviaHandler } from "./databaseHandler";
import { Responses } from "./interface/TriviaResponse";

export class TriviaBase {
    triviaId?: number;
    question?: string;
    choices?: Partial<APISelectMenuOption>[];
    answer: number;
    attachments?: string[];
    
    isRestored: boolean = false;
    guessedUsers: string[] = [];
    messageReferred?: string;

    constructor({ question, choices, answer, attachments, isRestoration, responseIds }: TriviaBuilder) {
        if (isRestoration) {
            this.answer = answer;
            this.isRestored = true;
            this.guessedUsers.push(...responseIds!);
            return;
        }

        this.question = question;
        this.choices = choices;
        this.answer = answer;
        this.attachments = attachments;
        this.sync();
    }

    async sync(): Promise<void> {
        this.triviaId ??= await TriviaHandler.createTrivia(this.answer);
    }

    async send(interaction: BaseInteraction): Promise<Message<boolean> | undefined> {
        if (this.isRestored) {
            console.error(`Tried to send a restored trivia. Cancelling...`);
            return;
        }

        const row: any = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId(getUniqueSelectId(Trivia.instance))
                .setPlaceholder('Choose your answer')
                .addOptions(...this.choices?.map((choice: any, index: number) => {
                    choice.value = `${this.triviaId?.toString()}:${index.toString()}`;
                    return choice;
                }))
        );

        const message = await interaction.channel?.send({
            content: this.question,
            components: [row],
            files: this.attachments,
        });

        this.messageReferred = `${message?.channel?.id}:${message?.id}`;
        TriviaHandler.updateMessageReference(this.triviaId!, this.messageReferred!);

        return message;
    }

    async update(userId: string, response: string): Promise<Responses> {
        const [resId, answer] = response.split(':').map(parseInt);
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

    async end(interaction: BaseInteraction): Promise<void> {
        const [channelId, messageId] = this.messageReferred!.split(':');
        let channel: TextChannel | null = await interaction.client.channels?.fetch(channelId) as TextChannel;
        let message = await channel?.messages.fetch(messageId);

        if (!message) {
            console.error(`Could not find message ${this.messageReferred} for trivia ${this.triviaId}`);
            return;
        }

        const time = await TriviaHandler.endTrivia(this.triviaId!);

        await message.edit({ content: `*[The trivia ended <t:${time}:R>]*\n${message.content}`, components: [] });
    }

    async isTrivia(value: string): Promise<boolean> {
        return value.split(':')[0] === this.triviaId?.toString();
    }

    addOption(...options: any[]): TriviaBase {
        this.choices?.push(...options);
        return this;
    }
}