import { APISelectMenuOption, RestOrArray, SelectMenuComponentOptionData, SelectMenuOptionBuilder } from "discord.js";

export type TriviaBuilder = {
    question?: string;
    attachments?: string[];

    choices?: Partial<APISelectMenuOption>[];
    answer: number;
    isRestoration?: boolean;
    responseIds?: string[];
}