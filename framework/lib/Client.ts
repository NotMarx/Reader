import { APIStats } from "./Utils/APIStats";
import { Client, ClientEvents } from "eris";
import { Collection } from "./Utils";
import { ICommand, IConfig, IEvent, IGuildSchemaSettings } from "./Interfaces";
import { TLocale } from "./Types";
import { Utils } from "givies-framework";
import { connect } from "mongoose";
import { GuildModel } from "./Models";
import { RequestHandler } from "./API";
import { join } from "path";
import { readdirSync } from "fs";
import { t, TFunction, use } from "i18next";
import i18NextICU from "i18next-icu";
import localeEN from "./Locales/en.json";
import localeID from "./Locales/id.json";
import localeJA from "./Locales/ja.json";
import localeZH from "./Locales/zh.json";

export class NReaderClient extends Client {

    /**
     * BotList API Stats
     */
    public apiStats = new APIStats(this);

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
     * NHentai API
     */
    public get api() {
        const handler = new RequestHandler();

        return handler;
    }

    /**
     * Initialise every handler for NReader
     */
    public initialiseEverything() {
        this.connect();
        connect(this.config.BOT.MONGODB).then(async () => {
            this.logger.info({ message: "Database Connected", subTitle: "NReaderFramework::MongoDB", title: "DATABASE" });

            const guilds = this.guilds.map((guild) => guild.id);
            const commands = this.commands.map((command) => command);

            if (commands) {
                commands.forEach(async (command) => {
                    for (let i = 0; i < guilds.length; i++) {
                        this.createGuildCommand(guilds[i], {
                            description: command.description,
                            name: command.name,
                            options: command.options,
                            type: command.type
                        }).catch(() => { });
                    }
                });

                for (let i = 0; i < guilds.length; i++) {
                    const guildData = await GuildModel.findOne({ id: guilds[i] });

                    if (!guildData) {
                        GuildModel.create({
                            createdAt: new Date(),
                            id: guilds[i],
                            settings: ({
                                blacklisted: false,
                                locale: "en",
                                whitelisted: false
                            } as IGuildSchemaSettings)
                        });
                    }
                }
            }
        });

        this.editStatus("dnd", {
            name: "Reading...",
            type: 0
        });

        const commandPath = join(__dirname, "..", "..", "..", "bot", "src", "Commands");
        const eventPath = join(__dirname, "..", "..", "..", "bot", "src", "Events");

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
     * Initialise localisation for NReader
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
                id: {
                    translation: localeID
                },
                ja: {
                    translation: localeJA
                },
                zh: {
                    translation: localeZH
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
