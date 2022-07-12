import { Client, ClientEvents, TextableChannel } from "eris";
import { Collection } from "./Utils";
import { ICommand, IConfig, IEvent } from "./Interfaces";
import { TLocale } from "./Types";
import { Utils } from "givies-framework";
import { connect } from "mongoose";
import { join } from "path";
import { readdirSync } from "fs";
import { t, TFunction, use } from "i18next";
import i18NextICU from "i18next-icu";
import localeEN from "./Locales/en.json";
import localeJA from "./Locales/ja.json";
import { MessageCollector, MessageCollectorOptions } from "./Modules/MessageCollector";

export class ReaderClient extends Client {

    /**
     * Collection of the bot's commands
     */
    public commands = new Collection<ICommand>();

    /**
     * The configuration of the bot. Contains secret token
     */
    public config: IConfig;

    /**
     * Collection of the bot's gateway events
     */
    public events = new Collection<IEvent>();

    /**
     * Logger
     */
    public logger = new Utils.Logger();

    /**
     * Collect messages in a channel
     */
    public awaitChannelMessages(channel: TextableChannel, options: MessageCollectorOptions) {
        return new MessageCollector(channel, options).run();
    }

    /**
     * Initialise every handler for Reader
     */
    public initialiseEverything() {
        this.connect();
        connect(this.config.BOT.MONGODB).then(() => {
            this.logger.info({ message: "Database Connected", subTitle: "ReaderFramework::MongoDB", title: "DATABASE" });
        });

        this.editStatus("dnd", {
            name: "Reading...",
            type: 0
        });

        const commandPath = join(__dirname, "..", "..", "bot", "src", "Commands");
        const eventPath = join(__dirname, "..", "..", "bot", "src", "Events");

        readdirSync(commandPath).forEach(async (dir) => {
            const commands = readdirSync(`${commandPath}/${dir}`).filter((file) => file.endsWith(".ts"));

            for (const file of commands) {
                const { command } = await import(`${commandPath}/${dir}/${file}`);

                this.commands.set(command.name as string, command as ICommand);
            }
        });

        readdirSync(eventPath).forEach(async (file) => {
            const { event } = await import(`${eventPath}/${file}`);

            try {
                this.events.set(event.name as keyof ClientEvents, event as IEvent);
                this.on(event.name as keyof ClientEvents, event.run.bind(null, this));
            } catch (err) {
                return;
            }
        });
    }

    /**
     * Initialise localisation for Reader
     * @param locale The requested locale
     * @returns {Promise<TFunction>}
     */
    public initialiseLocale(locale: TLocale): Promise<TFunction> {
        return use(i18NextICU).init({
            fallbackLng: "en",
            lng: locale,
            resources: {
                en: {
                    translation: localeEN
                },
                ja: {
                    translation: localeJA
                }
            }
        });
    }

    /**
     * Translate keys
     * @param key The translation key
     * @param format Key format
     */
    public translate(key: string, format?: object): string;

    /**
      * Translate keys from requested locale
      * @param key The translation key
      * @param format Key format
      * @returns {string}
      */
    /* @ts-ignore */
    public translateLocale(locale: TLocale, key: string, format?: object): string {
        this.initialiseLocale(locale);

        return t(key, format);
    }
}
