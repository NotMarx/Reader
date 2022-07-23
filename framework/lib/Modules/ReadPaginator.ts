import { API, Book } from "nhentai-api";
import { ActionRow, AdvancedMessageContent, CommandInteraction, ComponentInteraction, Constants, EmbedOptions, Message, TextableChannel } from "eris";
import { CookieJar } from "tough-cookie";
import { HttpsCookieAgent } from "http-cookie-agent/http";
import { ReaderClient } from "../Client";
import { Utils } from "givies-framework";
import { GuildModel, UserModel } from "../Models";
import moment from "moment";

export class ReadPaginator {

    /**
     * NHentai API
     */
    api: API;

    /**
     * Current book
     */
    book: Book;

    /**
     * Reader client
     */
    client: ReaderClient;

    /**
     * The index of current embed page
     */
    embed: number;

    /**
     * An array of embed pages
     */
    embeds: EmbedOptions[];

    /**
     * Eris command interaction
     */
    interaction: CommandInteraction<TextableChannel>;

    /**
     * The message for embed pages
     */
    message: Message<TextableChannel>;

    /**
     * Whether the paginator is running or not
     */
    running: boolean;

    /**
     * Creates a read paginator
     * @param client Reader client
     * @param book Current book
     * @param interaction Eris command interaction
     */
    constructor(client: ReaderClient, book: Book, interaction: CommandInteraction<TextableChannel>) {
        const jar = new CookieJar();
        jar.setCookie(client.config.API.COOKIE, "https://nhentai.net/");
        const agent = new HttpsCookieAgent({ cookies: { jar } });

        // @ts-ignore
        this.api = new API({ agent });
        this.book = book;
        this.client = client;
        this.embed = 1;
        this.embeds = book.pages.map((page, index) => {
            return new Utils.RichEmbed()
                .setAuthor(book.id.toString(), this.api.getImageURL(page))
                .setColor(client.config.BOT.COLOUR)
                .setFooter(client.translate("main.page", { firstIndex: index + 1, lastIndex: book.pages.length }))
                .setImage(this.api.getImageURL(page))
                .setTitle(book.title.pretty)
                .setURL(`https://nhentai.net/g/${book.id.toString()}`);
        });
        this.interaction = interaction;
        this.onRead = this.onRead.bind(this);
        this.running = false;
    }

    /**
     * Initialise the paginator class
     */
    public async initialisePaginator() {
        const userData = await UserModel.findOne({ id: this.interaction.member.id });
        const messageContent: AdvancedMessageContent = {
            components: [
                {
                    components: [
                        { custom_id: `first_page_${this.interaction.id}`, label: this.client.translate("main.page.first"), style: 1, type: 2 },
                        { custom_id: `previous_page_${this.interaction.id}`, label: this.client.translate("main.page.previous"), style: 2, type: 2 },
                        { custom_id: `stop_${this.interaction.id}`, label: this.client.translate("main.stop"), style: 4, type: 2 },
                        { custom_id: `next_page_${this.interaction.id}`, label: this.client.translate("main.page.next"), style: 2, type: 2 },
                        { custom_id: `last_page_${this.interaction.id}`, label: this.client.translate("main.page.last"), style: 1, type: 2 }
                    ],
                    type: 1
                },
                {
                    components: [
                        { custom_id: `jumpto_page_${this.interaction.id}`, label: this.client.translate("main.page.enter"), style: 1, type: 2 },
                        { custom_id: `bookmark_${this.interaction.id}`, label: this.client.translate("main.bookmark"), style: 2, type: 2 },
                        { custom_id: `home_${this.interaction.id}`, label: this.client.translate("main.home"), style: 1, type: 2 }
                    ],
                    type: 1
                }
            ],
            embeds: [this.embeds[this.embed - 1]]
        };

        switch (userData.settings.readState) {
            case "current":
                this.message = await this.interaction.editOriginalMessage(messageContent);
                break;
            case "new":
                this.message = await this.client.createMessage(this.interaction.channel.id, messageContent);
                break;
        }
    }

    /**
     * Start reading
     * @param interaction Eris component interaction
     */
    public async onRead(interaction: ComponentInteraction<TextableChannel>) {
        if (interaction.member.bot) return;

        const guildData = await GuildModel.findOne({ id: interaction.guildID });
        const userData = await UserModel.findOne({ id: interaction.member.id });
        const artistTags: string[] = this.book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name);
        const characterTags: string[] = this.book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name);
        const contentTags: string[] = this.book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`);
        const languageTags: string[] = this.book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name.charAt(0).toUpperCase() + tag.name.slice(1));
        const parodyTags: string[] = this.book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name);
        const uploadedAt = moment(this.book.uploaded).locale(guildData.settings.locale).format("dddd, MMMM Do, YYYY h:mm A");

        const resultEmbed = new Utils.RichEmbed()
            .setAuthor(this.book.id.toString(), `https://nhentai.net/g/${this.book.id.toString()}`)
            .setColor(this.client.config.BOT.COLOUR)
            .addField(this.client.translate("main.title"), `\`${this.book.title.pretty}\``)
            .addField(this.client.translate("main.pages"), `\`${this.book.pages.length}\``)
            .addField(this.client.translate("main.released"), `\`${this.client.translate("main.date", { date: uploadedAt })}\``)
            .addField(languageTags.length > 1 ? this.client.translate("main.languages") : this.client.translate("main.language"), `\`${languageTags.length !== 0 ? languageTags.join("`, `") : this.client.translate("main.none")}\``)
            .addField(artistTags.length > 1 ? this.client.translate("main.artists") : this.client.translate("main.artist"), `\`${artistTags.length !== 0 ? artistTags.join("`, `") : this.client.translate("main.none")}\``)
            .addField(characterTags.length > 1 ? this.client.translate("main.characters") : this.client.translate("main.character"), `\`${characterTags.length !== 0 ? characterTags.join("`, `") : this.client.translate("main.original")}\``)
            .addField(parodyTags.length > 1 ? this.client.translate("main.parodies") : this.client.translate("main.parody"), `\`${parodyTags.length !== 0 ? parodyTags.join("`, `").replace("original", `${this.client.translate("main.original")}`) : this.client.translate("main.none")}\``)
            .addField(contentTags.length > 1 ? this.client.translate("main.tags") : this.client.translate("main.tag"), `\`${contentTags.length !== 0 ? contentTags.join("`, `") : this.client.translate("main.none")}\``)
            .setFooter(`⭐ ${this.book.favorites.toLocaleString()}`)
            .setThumbnail(this.api.getImageURL(this.book.cover));

        const hideComponent: ActionRow = {
            components: [
                {
                    custom_id: `read_${this.interaction.id}`,
                    label: this.client.translate("main.read"),
                    style: 1,
                    type: 2
                },
                {
                    custom_id: `stop_${this.interaction.id}`,
                    label: this.client.translate("main.stop"),
                    style: 4,
                    type: 2
                },
                {
                    custom_id: `bookmark_${this.interaction.id}`,
                    label: this.client.translate("main.bookmark"),
                    style: 2,
                    type: 2
                },
                {
                    custom_id: `hide_cover_${this.interaction.id}`,
                    label: this.client.translate("main.cover.hide"),
                    style: 1,
                    type: 2
                }
            ],
            type: 1
        };

        const showComponent: ActionRow = {
            components: [
                {
                    custom_id: `read_${this.interaction.id}`,
                    label: this.client.translate("main.read"),
                    style: 1,
                    type: 2
                },
                {
                    custom_id: `stop_${this.interaction.id}`,
                    label: this.client.translate("main.stop"),
                    style: 4,
                    type: 2
                },
                {
                    custom_id: `bookmark_${this.interaction.id}`,
                    label: this.client.translate("main.bookmark"),
                    style: 2,
                    type: 2
                },
                {
                    custom_id: `show_cover_${this.interaction.id}`,
                    label: this.client.translate("main.cover.show"),
                    style: 1,
                    type: 2
                }
            ],
            type: 1
        };

        switch (interaction.data.custom_id) {
            case `read_${this.interaction.id}`:
                this.initialisePaginator();
                interaction.acknowledge();
                break;
            case `show_cover_${this.interaction.id}`:
                resultEmbed.setImage(this.api.getImageURL(this.book.cover));
                this.interaction.editOriginalMessage({ components: [hideComponent], embeds: [resultEmbed] });
                interaction.acknowledge();
                break;
            case `hide_cover_${this.interaction.id}`:
                resultEmbed.setImage("");
                this.interaction.editOriginalMessage({ components: [showComponent], embeds: [resultEmbed] });
                interaction.acknowledge();
                break;
            case `home_${this.interaction.id}`:
                this.interaction.editOriginalMessage({ components: [showComponent], embeds: [resultEmbed] });
                interaction.acknowledge();
                break;
            case `stop_${this.interaction.id}`:
                interaction.message.delete();
                interaction.acknowledge();
                this.stopPaginator();
                break;
            case `bookmark_${this.interaction.id}`:
                if (userData.bookmark.includes(this.embeds[0].author.name)) {
                    interaction.createMessage({
                        embeds: [
                            new Utils.RichEmbed()
                                .setColor(this.client.config.BOT.COLOUR)
                                .setDescription(this.client.translate("main.bookmark.removed", { id: `[\`${this.embeds[0].author.name}\`](https://nhentai.net/g/${this.embeds[0].author.name})` }))
                        ],
                        flags: Constants.MessageFlags.EPHEMERAL
                    });

                    UserModel.findOneAndUpdate({ id: interaction.member.id }, { $pull: { "bookmark": this.embeds[0].author.name } }).exec();
                } else {
                    interaction.createMessage({
                        embeds: [
                            new Utils.RichEmbed()
                                .setColor(this.client.config.BOT.COLOUR)
                                .setDescription(this.client.translate("main.bookmark.saved", { id: `[\`${this.embeds[0].author.name}\`](https://nhentai.net/g/${this.embeds[0].author.name})` }))
                        ],
                        flags: Constants.MessageFlags.EPHEMERAL
                    });

                    UserModel.findOneAndUpdate({ id: interaction.member.id }, { $push: { "bookmark": this.embeds[0].author.name } }).exec();
                }

                break;
            case `next_page_${this.interaction.id}`:
                interaction.acknowledge();

                if (this.embed < this.embeds.length) {
                    this.embed++;
                    this.updatePaginator();
                }

                break;
            case `previous_page_${this.interaction.id}`:
                interaction.acknowledge();

                if (this.embed > 1) {
                    this.embed--;
                    this.updatePaginator();
                }

                break;
            case `first_page_${this.interaction.id}`:
                interaction.acknowledge();

                this.embed = 1;
                this.updatePaginator();
                break;
            case `last_page_${this.interaction.id}`:
                interaction.acknowledge();

                this.embed = this.embeds.length;
                this.updatePaginator();
                break;
            case `jumpto_page_${this.interaction.id}`:
                interaction.createMessage({
                    embeds: [
                        new Utils.RichEmbed()
                            .setColor(this.client.config.BOT.COLOUR)
                            .setDescription(this.client.translate("main.page.enter.hint"))
                    ],
                    flags: Constants.MessageFlags.EPHEMERAL
                });

                /* eslint-disable-next-line */
                    const filter = (m: Message<TextableChannel>) => {
                    if (m.author.bot) return;
                    if (m.author.id !== interaction.member.id) return;

                    if (isNaN(parseInt(m.content))) {
                        m.delete();
                        interaction.createMessage({
                            embeds: [
                                new Utils.RichEmbed()
                                    .setColor(this.client.config.BOT.COLOUR)
                                    .setDescription(this.client.translate("main.page.enter.invalid"))
                            ],
                            flags: Constants.MessageFlags.EPHEMERAL
                        });

                        return false;
                    }

                    if (parseInt(m.content) > this.embeds.length) {
                        m.delete();
                        interaction.createMessage({
                            embeds: [
                                new Utils.RichEmbed()
                                    .setColor(this.client.config.BOT.COLOUR)
                                    .setDescription(this.client.translate("main.page.enter.unknown", { index: m.content }))
                            ],
                            flags: Constants.MessageFlags.EPHEMERAL
                        });

                        return false;
                    }

                    if (parseInt(m.content) <= 0) {
                        m.delete();
                        interaction.createMessage({
                            embeds: [
                                new Utils.RichEmbed()
                                    .setColor(this.client.config.BOT.COLOUR)
                                    .setDescription(this.client.translate("main.page.enter.unknown", { index: m.content }))
                            ],
                            flags: Constants.MessageFlags.EPHEMERAL
                        });

                        return false;
                    } else return true;
                };

                /* eslint-disable-next-line */
                    const response = await this.client.awaitChannelMessages(interaction.channel, { count: 1, filter, timeout: 30000 });

                if (response.message) {
                    response.message.delete();
                    this.embed = parseInt(response.message.content);
                    this.updatePaginator();
                } else {
                    return interaction.createMessage({
                        embeds: [
                            new Utils.RichEmbed()
                                .setColor(this.client.config.BOT.COLOUR)
                                .setDescription(this.client.translate("main.timeout"))
                        ],
                        flags: Constants.MessageFlags.EPHEMERAL
                    });
                }

                break;
        }
    }

    /**
     * Update the paginator class
     */
    public updatePaginator() {
        this.message.edit({
            components: [
                {
                    components: [
                        { custom_id: `first_page_${this.interaction.id}`, label: this.client.translate("main.page.first"), style: 1, type: 2 },
                        { custom_id: `previous_page_${this.interaction.id}`, label: this.client.translate("main.page.previous"), style: 2, type: 2 },
                        { custom_id: `stop_${this.interaction.id}`, label: this.client.translate("main.stop"), style: 4, type: 2 },
                        { custom_id: `next_page_${this.interaction.id}`, label: this.client.translate("main.page.next"), style: 2, type: 2 },
                        { custom_id: `last_page_${this.interaction.id}`, label: this.client.translate("main.page.last"), style: 1, type: 2 }
                    ],
                    type: 1
                },
                {
                    components: [
                        { custom_id: `jumpto_page_${this.interaction.id}`, label: this.client.translate("main.page.enter"), style: 1, type: 2 },
                        { custom_id: `bookmark_${this.interaction.id}`, label: this.client.translate("main.bookmark"), style: 2, type: 2 },
                        { custom_id: `home_${this.interaction.id}`, label: this.client.translate("main.home"), style: 1, type: 2 }
                    ],
                    type: 1
                }
            ],
            embeds: [this.embeds[this.embed - 1]]
        });
    }

    /**
     * Run the paginator class
     */
    public runPaginator() {
        this.client.on("interactionCreate", this.onRead);
        this.running = true;
    }

    /**
     * Stop the paginator class
     */
    public stopPaginator() {
        this.client.off("interactionCreate", this.onRead);
        this.running = false;
    }
}

export async function createReadPaginator(client: ReaderClient, book: Book, interaction: CommandInteraction<TextableChannel>) {
    const paginator = new ReadPaginator(client, book, interaction);

    paginator.runPaginator();

    return Promise.resolve(paginator.message);
}
