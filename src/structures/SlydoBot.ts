import { Client, Collection, GatewayIntentBits, Partials, SlashCommandBuilder, CommandInteraction } from "discord.js";
import { PluginBase, SlashCommandDict } from "./PluginBase";
import * as fs from 'fs';
import path from "path";
import { config } from "../index";

export default class SlydoBot extends Client {
    slashCommands: SlashCommandDict = new Collection();

    plugins: PluginBase[] = [];
    
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildWebhooks,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildMessageTyping,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.DirectMessageTyping
            ],
            partials: [
                Partials.Channel, 
                Partials.Message, 
                Partials.User, 
                Partials.GuildMember, 
                Partials.Reaction
            ]
        });

        (async() => {
            await this.registerPlugins();
            await this.subscribeEvents();
            await this.registerCommands();
        })();
    }

    // Register plugins
    private async registerPlugins() {
        const pluginsPath = path.join(__dirname, "../../plugins");
        const pluginFolders = await fs.promises.readdir(pluginsPath, { withFileTypes:true });

        for (const pluginName of pluginFolders.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)) {
            const PluginClass = (await import(path.join(pluginsPath, pluginName))).default;
            const plugin: PluginBase = new PluginClass();

            if (config.diasbledPlugins.includes(plugin.name)) {
                console.log(`Skipping disabled plugin: ${plugin.name}`);
                continue;
            }

            console.log(`Loading plugin: ${plugin.name} (${plugin.version})`);
            this.plugins.push(plugin);

            plugin.load();
        }
    }

    // Subscribe all discord events found in src/events
    private async subscribeEvents() {
        const eventFiles = fs
            .readdirSync(path.join(__dirname, '../events'))
            .filter((file: string) => file.endsWith(".ts"));

        for (const file of eventFiles) {
            const event = (await import(`../events/${file}`)).default;
            if (event.once) {
                this.once(event.name, (...args) => event.execute(...args));
            } else {
                this.on(event.name, async (...args) => await event.execute(...args));
            }
        }

        this.plugins.forEach(x => x.onEventSubscriptions());
    }

    // Register commands
    private async registerCommands() {
        const commandsPath = path.join(__dirname, '../commands/slash');
        const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.ts'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = await import(filePath);
            this.slashCommands.set(command.default.data.name, command.default);
        }

        this.plugins.forEach(x => x.onRegisterCommands(this.slashCommands));
    }
}