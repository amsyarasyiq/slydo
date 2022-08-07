import { Collection, CommandInteraction, SelectMenuInteraction, SlashCommandBuilder } from "discord.js";

export type SlashCommandDict = Collection<string, { data: SlashCommandBuilder, execute: ((interaction: CommandInteraction) => Promise<void>) | undefined }>;

export abstract class PluginBase {
    constructor() {
        if (new.target === PluginBase) {
            throw new TypeError("Cannot construct PluginBase instances directly");
        }
    }

    abstract get name(): string;
    abstract get version(): string;

    get description(): string | undefined { return undefined; }

    abstract onCommandsDeployment(): SlashCommandBuilder[];

    load(): void { return undefined; }
    onEventSubscriptions(): void { return undefined; }

    ownSelectMenu(interaction: SelectMenuInteraction): boolean { return this.selectMenuIds.includes(interaction.customId); }

    // interaction handlers
    async handleCommandInteraction(_interaction: CommandInteraction): Promise<void> { return undefined; }
    async handleSelectMenuInteraction(_interaction: SelectMenuInteraction): Promise<void> { return undefined; }

    selectMenuIds: string[] = [];
    commandBuilders: SlashCommandBuilder[] = [];
}

// TODO: command system similar select menu system for plugins