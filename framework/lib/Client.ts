import { APIStats } from "./Utils/APIStats";
import { API } from "nhentai-api";
import { Client, ClientEvents } from "oceanic.js";
import { CookieJar } from "tough-cookie";
import { Collection } from "./Utils";
import { ICommand, IConfig, IEvent, IGuildSchemaSettings } from "./Interfaces";
import { TLocale, TranslationKey } from "./Types";
import { connect } from "mongoose";
import { GuildModel } from "./Models";
import { Logger } from "./Utils/Logger";
import { StatsManager } from "./Modules/StatsManager";
import { join } from "path";
import { readdirSync } from "fs";
import { t, TFunction, use } from "i18next";
import i18NextICU from "i18next-icu";
import localeEN from "./Locales/en.json";
import localeID from "./Locales/id.json";
import localeJA from "./Locales/ja.json";
import localeZH from "./Locales/zh.json";
import localeEO from "./Locales/eo.json";
import { HttpsCookieAgent } from "http-cookie-agent/http";

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
    public logger = new Logger();

    /**
     * Manage the database stats
     */
    public stats = new StatsManager(this);

    /**
     * NHentai API
     */
    public get api() {
        const jar = new CookieJar();
        const agent = new HttpsCookieAgent({ cookies: { jar } });

        jar.setCookie(this.config.API.COOKIE, "https://nhentai.net");

        /* @ts-ignore */
        return new API({ agent });
    }

    /**
     * Initialise every handler for NReader
     */
    public initialiseEverything() {
        this.connect();
        connect(this.config.BOT.MONGODB).then(async () => {
            this.logger.info({
                message: "Database Connected",
                subTitle: "NReaderFramework::MongoDB",
                title: "DATABASE",
            });

            const guilds = this.guilds.map((guild) => guild.id);

            for (let i = 0; i < guilds.length; i++) {
                const guildData = await GuildModel.findOne({ id: guilds[i] });

                if (!guildData) {
                    GuildModel.create({
                        createdAt: new Date(),
                        id: guilds[i],
                        settings: {
                            blacklisted: false,
                            emojiText: false,
                            locale: "en",
                            whitelisted: false,
                        } as IGuildSchemaSettings,
                    });
                }
            }
        });

        const commandPath = join(
            __dirname,
            "..",
            "..",
            "bot",
            "src",
            "Commands"
        );
        const eventPath = join(__dirname, "..", "..", "bot", "src", "Events");

        readdirSync(commandPath).forEach(async (dir) => {
            const commands = readdirSync(`${commandPath}/${dir}`).filter(
                (file) => file.endsWith(".ts")
            );

            for (const file of commands) {
                const { command } = await import(
                    `${commandPath}/${dir}/${file}`
                );

                this.commands.set(command.name as string, command as ICommand);
            }
        });

        readdirSync(eventPath).forEach(async (file) => {
            const { event } = await import(`${eventPath}/${file}`);

            try {
                this.events.set(
                    event.name as keyof ClientEvents,
                    event as IEvent
                );
                this.on(
                    event.name as keyof ClientEvents,
                    event.run.bind(null, this)
                );
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
                    translation: localeEN,
                },
                eo: {
                    translation: localeEO,
                },
                id: {
                    translation: localeID,
                },
                ja: {
                    translation: localeJA,
                },
                zh: {
                    translation: localeZH,
                },
            },
        });
    }

    /**
     * Translate keys based on the localisation set in the guild
     * @param key The translation key
     * @param format Translate variable keys
     */
    public translate(key: TranslationKey, format?: object): string;

    /**
     * Translate keys from requested locale
     * @param key The translation key
     * @param format Key format
     * @returns {string}
     */
    /* @ts-ignore */
    public translateLocale(
        locale: TLocale,
        key: TranslationKey,
        format?: object
    ): string {
        this.initialiseLocale(locale);

        return t(key, format);
    }
}
