import { Collection, CommandInteraction, SlashCommandBuilder } from "discord.js";

export type SlashCommandDict = Collection<string, { data: SlashCommandBuilder, execute: ((interaction: CommandInteraction) => Promise<void>) | undefined }>;

export abstract class PluginBase {
    constructor() {
        if (new.target === PluginBase) {
            throw new TypeError("Cannot construct PluginBase instances directly");
        }
    }

    abstract get name(): string;
    abstract get version(): string;

    get description(): string | undefined {
        return undefined;
    }

    abstract onCommandsDeployment(): SlashCommandBuilder[];
    abstract onRegisterCommands(collection: SlashCommandDict): void;

    load(): void { return undefined; }
    onEventSubscriptions(): void { return undefined; }
}