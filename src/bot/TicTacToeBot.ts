import { Client, Message, TextChannel } from 'discord.js';
import TicTacToe from '../index';
import CommandHandler from '@bot/CommandHandler';
import StartCommand from '@bot/commands/StartCommand';
import GameChannel from '@bot/channel/GameChannel';

/**
 * Manages all interactions with the Discord bot.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export default class TicTacToeBot {
    /**
     * Game controller
     */
    private readonly _controller: TicTacToe;
    /**
     * Discord Client object
     */
    private readonly _client: Client;
    /**
     * Manages the command handling
     */
    private readonly _commandHandler: CommandHandler;
    /**
     * Collection with all channels in which games are handled.
     */
    private _channels: Array<GameChannel>;

    /**
     * Constructs the Discord bot interaction object.
     *
     * @param controller game controller
     * @param client Discord client object, if empty use a new client
     */
    constructor(controller: TicTacToe, client?: Client) {
        this._controller = controller;
        this._client = client ?? new Client();
        this._commandHandler = new CommandHandler();
        this._channels = [];

        this.registerCommands();
        this.addEventListeners();
    }

    /**
     * Retrieves the game controller.
     */
    public get controller(): TicTacToe {
        return this._controller;
    }

    /**
     * Retrieves the connected Discord client.
     */
    public get client(): Client {
        return this._client;
    }

    /**
     * Retrieves a game channel from the Discord object.
     * Creates a new game channel innstance if not found in the cache.
     *
     * @param parent parent Discord channel object
     */
    public getorCreateGameChannel(parent: TextChannel): GameChannel {
        const found = this._channels.find(channel => channel.channel === parent);
        if (found) {
            return found;
        } else {
            const instance = new GameChannel(this, parent);
            this._channels.push(instance);
            return instance;
        }
    }

    /**
     * Register all commands to be handled by the bot.
     */
    private registerCommands(): void {
        this._commandHandler.addCommand(new StartCommand(this));
    }

    /**
     * Register all events to be handled by the bot.
     */
    private addEventListeners(): void {
        this.client.on('message', this.onMessage.bind(this));
    }

    /**
     * Called when a message is sent and has been detected by the bot.
     *
     * @param message message object received from Discord
     */
    private onMessage(message: Message): void {
        if (!message.author.bot && message.channel.type === 'text') {
            this._commandHandler.execute(message);
        }
    }
}
