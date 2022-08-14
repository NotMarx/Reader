import { API, Search } from "nhentai-api";
import { ActionRow, AdvancedMessageContent, CommandInteraction, ComponentInteraction, Constants, EmbedOptions, Message, TextableChannel } from "eris";
import { CookieJar } from "tough-cookie";
import { HttpsCookieAgent } from "http-cookie-agent/http";
import { NReaderClient } from "../Client";
import { Utils } from "givies-framework";
import { UserModel } from "../Models";
import { ReadSearchPaginator } from "./ReadSearchPaginator";

export class SearchPaginator {

    /**
     * NHentai API
     */
    api: API;

    /**
     * NReader client
     */
    client: NReaderClient;

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
     * The read paginator
     */
    paginationEmbed: ReadSearchPaginator;

    /**
     * Whether the paginator is running or not
     */
    running: boolean;

    /**
     * The search result
     */
    search: Search;

    /**
     * Creates a read paginator
     * @param client NReader client
     * @param book Current book
     * @param interaction Eris command interaction
     */
    constructor(client: NReaderClient, search: Search, interaction: CommandInteraction<TextableChannel>) {
        const jar = new CookieJar();
        jar.setCookie(client.config.API.COOKIE, "https://nhentai.net/");
        const agent = new HttpsCookieAgent({ cookies: { jar } });

        // @ts-ignore
        this.api = new API({ agent });
        this.client = client;
        this.embed = 1;
        this.embeds = [];
        this.interaction = interaction;
        this.onSearch = this.onSearch.bind(this);
        this.running = false;
        this.search = search;
    }

    /**
     * Initialise the paginator class
     */
    public async initialisePaginator() {
        const title = this.search.books.map((book, index) => `\`⬛ ${(index + 1).toString().length > 1 ? `${index + 1}`  : `${index + 1} `}\` - [\`${book.id}\`](https://nhentai.net/g/${book.id}) - \`${book.title.pretty}\``);
        const embeds = this.search.books.map((book, index) => {
            const artistTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name);
            const characterTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name);
            const contentTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`);
            const languageTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name.charAt(0).toUpperCase() + tag.name.slice(1));
            const parodyTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name);
            const uploadedAt = `<t:${book.uploaded.getTime() / 1000}:F>`;

            return new Utils.RichEmbed()
                .setAuthor(book.id.toString(), `https://nhentai.net/g/${book.id}`)
                .setColor(this.client.config.BOT.COLOUR)
                .setDescription(title.join("\n").replace(`\`⬛ ${(index + 1).toString().length > 1 ? `${index + 1}`  : `${index + 1} `}\` - [\`${book.id}\`](https://nhentai.net/g/${book.id}) - \`${book.title.pretty}\``, `**\`🟥 ${(index + 1).toString().length > 1 ? `${index + 1}`  : `${index + 1} `}\` - [\`${book.id}\`](https://nhentai.net/g/${book.id}) - \`${book.title.pretty}\`**`))
                .setFooter(`⭐ ${book.favorites.toLocaleString()}`)
                .setTitle(this.client.translate("main.page", { firstIndex: this.search.page.toLocaleString(), lastIndex: this.search.pages.toLocaleString() }))
                .setThumbnail(this.api.getImageURL(book.cover))
                .addField(this.client.translate("main.title"), `\`${book.title.pretty}\``)
                .addField(this.client.translate("main.pages"), `\`${book.pages.length}\``)
                .addField(this.client.translate("main.released"), uploadedAt)
                .addField(languageTags.length > 1 ? this.client.translate("main.languages") : this.client.translate("main.language"), `\`${languageTags.length !== 0 ? languageTags.join("`, `") : this.client.translate("main.none")}\``)
                .addField(artistTags.length > 1 ? this.client.translate("main.artists") : this.client.translate("main.artist"), `\`${artistTags.length !== 0 ? artistTags.join("`, `") : this.client.translate("main.none")}\``)
                .addField(characterTags.length > 1 ? this.client.translate("main.characters") : this.client.translate("main.character"), `\`${characterTags.length !== 0 ? characterTags.join("`, `") : this.client.translate("main.original")}\``)
                .addField(parodyTags.length > 1 ? this.client.translate("main.parodies") : this.client.translate("main.parody"), `\`${parodyTags.length !== 0 ? parodyTags.join("`, `").replace("original", `${this.client.translate("main.original")}`) : this.client.translate("main.none")}\``)
                .addField(contentTags.length > 1 ? this.client.translate("main.tags") : this.client.translate("main.tag"), `\`${contentTags.length !== 0 ? contentTags.join("`, `") : this.client.translate("main.none")}\``);
        });

        this.embeds = embeds;

        const messageContent: AdvancedMessageContent = {
            components: [
                {
                    components: [
                        { custom_id: `first_result_${this.interaction.id}`, label: this.client.translate("main.result.first"), style: 1, type: 2 },
                        { custom_id: `previous_result_${this.interaction.id}`, label: this.client.translate("main.result.previous"), style: 2, type: 2 },
                        { custom_id: `stop_result_${this.interaction.id}`, label: this.client.translate("main.stop"), style: 4, type: 2 },
                        { custom_id: `next_result_${this.interaction.id}`, label: this.client.translate("main.result.next"), style: 2, type: 2 },
                        { custom_id: `last_result_${this.interaction.id}`, label: this.client.translate("main.result.last"), style: 1, type: 2 },
                    ],
                    type: 1
                },
                {
                    components: [
                        { custom_id: `first_result_page_${this.interaction.id}`, label: this.client.translate("main.page.first"), style: 1, type: 2 },
                        { custom_id: `previous_result_page_${this.interaction.id}`, label: this.client.translate("main.page.previous"), style: 2, type: 2 },
                        { custom_id: `next_result_page_${this.interaction.id}`, label: this.client.translate("main.page.next"), style: 2, type: 2 },
                        { custom_id: `last_result_page_${this.interaction.id}`, label: this.client.translate("main.page.last"), style: 1, type: 2 }
                    ],
                    type: 1
                },
                {
                    components: [
                        { custom_id: `jumpto_result_${this.interaction.id}`, label: this.client.translate("main.result.enter"), style: 1, type: 2 },
                        { custom_id: `jumpto_page_${this.interaction.id}`, label: this.client.translate("main.page.enter"), style: 1, type: 2 }
                    ],
                    type: 1
                },
                {
                    components: [
                        { custom_id: `read_result_${this.interaction.id}`, label: this.client.translate("main.read"), style: 3, type: 2 },
                        { custom_id: `bookmark_${this.interaction.id}`, label: this.client.translate("main.bookmark"), style: 2, type: 2 },
                        { custom_id: `show_cover_${this.interaction.id}`, label: this.client.translate("main.cover.show"), style: 1, type: 2 }
                    ],
                    type: 1
                }
            ],
            embeds: [this.embeds[this.embed - 1]]
        };

        this.message = await this.interaction.editOriginalMessage(messageContent);
        this.updatePaginator();
    }

    /**
     * Start searching
     * @param interaction Eris component interaction
     */
    public async onSearch(interaction: ComponentInteraction<TextableChannel>) {
        if (interaction.member.bot) return;

        const embed = new Utils.RichEmbed(interaction.message ? interaction.message.embeds[0] : undefined);
        const userData = await UserModel.findOne({ id: interaction.member.id });

        const hideComponent: ActionRow[] = [
            {
                components: [
                    { custom_id: `first_result_${this.interaction.id}`, label: this.client.translate("main.result.first"), style: 1, type: 2 },
                    { custom_id: `previous_result_${this.interaction.id}`, label: this.client.translate("main.result.previous"), style: 2, type: 2 },
                    { custom_id: `stop_result_${this.interaction.id}`, label: this.client.translate("main.stop"), style: 4, type: 2 },
                    { custom_id: `next_result_${this.interaction.id}`, label: this.client.translate("main.result.next"), style: 2, type: 2 },
                    { custom_id: `last_result_${this.interaction.id}`, label: this.client.translate("main.result.last"), style: 1, type: 2 },
                ],
                type: 1
            },
            {
                components: [
                    { custom_id: `first_result_page_${this.interaction.id}`, label: this.client.translate("main.page.first"), style: 1, type: 2 },
                    { custom_id: `previous_result_page_${this.interaction.id}`, label: this.client.translate("main.page.previous"), style: 2, type: 2 },
                    { custom_id: `next_result_page_${this.interaction.id}`, label: this.client.translate("main.page.next"), style: 2, type: 2 },
                    { custom_id: `last_result_page_${this.interaction.id}`, label: this.client.translate("main.page.last"), style: 1, type: 2 }
                ],
                type: 1
            },
            {
                components: [
                    { custom_id: `jumpto_result_${this.interaction.id}`, label: this.client.translate("main.result.enter"), style: 1, type: 2 },
                    { custom_id: `jumpto_page_${this.interaction.id}`, label: this.client.translate("main.page.enter"), style: 1, type: 2 }
                ],
                type: 1
            },
            {
                components: [
                    { custom_id: `read_result_${this.interaction.id}`, label: this.client.translate("main.read"), style: 3, type: 2 },
                    { custom_id: `bookmark_${this.interaction.id}`, label: this.client.translate("main.bookmark"), style: 2, type: 2 },
                    { custom_id: `hide_cover_${this.interaction.id}`, label: this.client.translate("main.cover.hide"), style: 1, type: 2 }
                ],
                type: 1
            }
        ];

        const showComponent: ActionRow[] = [
            {
                components: [
                    { custom_id: `first_result_${this.interaction.id}`, label: this.client.translate("main.result.first"), style: 1, type: 2 },
                    { custom_id: `previous_result_${this.interaction.id}`, label: this.client.translate("main.result.previous"), style: 2, type: 2 },
                    { custom_id: `stop_result_${this.interaction.id}`, label: this.client.translate("main.stop"), style: 4, type: 2 },
                    { custom_id: `next_result_${this.interaction.id}`, label: this.client.translate("main.result.next"), style: 2, type: 2 },
                    { custom_id: `last_result_${this.interaction.id}`, label: this.client.translate("main.result.last"), style: 1, type: 2 },
                ],
                type: 1
            },
            {
                components: [
                    { custom_id: `first_result_page_${this.interaction.id}`, label: this.client.translate("main.page.first"), style: 1, type: 2 },
                    { custom_id: `previous_result_page_${this.interaction.id}`, label: this.client.translate("main.page.previous"), style: 2, type: 2 },
                    { custom_id: `next_result_page_${this.interaction.id}`, label: this.client.translate("main.page.next"), style: 2, type: 2 },
                    { custom_id: `last_result_page_${this.interaction.id}`, label: this.client.translate("main.page.last"), style: 1, type: 2 }
                ],
                type: 1
            },
            {
                components: [
                    { custom_id: `jumpto_result_${this.interaction.id}`, label: this.client.translate("main.result.enter"), style: 1, type: 2 },
                    { custom_id: `jumpto_page_${this.interaction.id}`, label: this.client.translate("main.page.enter"), style: 1, type: 2 }
                ],
                type: 1
            },
            {
                components: [
                    { custom_id: `read_result_${this.interaction.id}`, label: this.client.translate("main.read"), style: 3, type: 2 },
                    { custom_id: `bookmark_${this.interaction.id}`, label: this.client.translate("main.bookmark"), style: 2, type: 2 },
                    { custom_id: `show_cover_${this.interaction.id}`, label: this.client.translate("main.cover.show"), style: 1, type: 2 }
                ],
                type: 1
            }
        ];

        switch (interaction.data.custom_id) {
            case `read_result_${this.interaction.id}`:
                interaction.acknowledge();

                this.api.getBook(parseInt(embed.author.name)).then(async (book) => {
                    this.paginationEmbed = new ReadSearchPaginator(this.client, book, this.interaction);
                    await this.paginationEmbed.initialisePaginator();
                    this.paginationEmbed.runPaginator();
                });

                break;
            case `see_more_${this.interaction.id}`:
                interaction.acknowledge();
                this.initialisePaginator();
                break;
            case `show_cover_${this.interaction.id}`:
                embed.setImage(this.api.getImageURL((await this.api.getBook(parseInt(embed.author.name))).cover));
                this.interaction.editOriginalMessage({ components: hideComponent, embeds: [embed] });
                interaction.acknowledge();
                break;
            case `hide_cover_${this.interaction.id}`:
                embed.setImage("");
                this.interaction.editOriginalMessage({ components: showComponent, embeds: [embed] });
                interaction.acknowledge();
                break;
            case `home_result_${this.interaction.id}`:
                this.interaction.editOriginalMessage({ components: showComponent, embeds: [this.embeds[this.embed - 1]] });
                this.paginationEmbed.stopPaginator();
                interaction.acknowledge();
                break;
            case `stop_result_${this.interaction.id}`:
                interaction.message.delete();
                interaction.acknowledge();
                this.stopPaginator();

                try {
                    this.paginationEmbed.stopPaginator();
                } catch (err) {
                    return;
                }

                break;
            case `bookmark_${this.interaction.id}`:
                if (this.paginationEmbed && this.paginationEmbed.running) {
                    return;
                }

                if (userData.bookmark.includes(embed.author.name)) {
                    interaction.createMessage({
                        embeds: [
                            new Utils.RichEmbed()
                                .setColor(this.client.config.BOT.COLOUR)
                                .setDescription(this.client.translate("main.bookmark.removed", { id: `[\`${embed.author.name}\`](https://nhentai.net/g/${embed.author.name})` }))
                        ],
                        flags: Constants.MessageFlags.EPHEMERAL
                    });

                    UserModel.findOneAndUpdate({ id: interaction.member.id }, { $pull: { "bookmark": embed.author.name } }).exec();
                } else {
                    if (userData.bookmark.length === 25) {
                        return interaction.createMessage({
                            embeds: [
                                new Utils.RichEmbed()
                                    .setColor(this.client.config.BOT.COLOUR)
                                    .setDescription(this.client.translate("main.bookmark.maxed"))
                            ],
                            flags: Constants.MessageFlags.EPHEMERAL
                        });
                    }

                    interaction.createMessage({
                        embeds: [
                            new Utils.RichEmbed()
                                .setColor(this.client.config.BOT.COLOUR)
                                .setDescription(this.client.translate("main.bookmark.saved", { id: `[\`${embed.author.name}\`](https://nhentai.net/g/${embed.author.name})` }))
                        ],
                        flags: Constants.MessageFlags.EPHEMERAL
                    });

                    UserModel.findOneAndUpdate({ id: interaction.member.id }, { $push: { "bookmark": embed.author.name } }).exec();
                }

                break;
            case `next_result_${this.interaction.id}`:
                interaction.acknowledge();

                if (this.embed < this.embeds.length) {
                    this.embed++;
                    this.updatePaginator();
                }

                break;
            case `previous_result_${this.interaction.id}`:
                interaction.acknowledge();

                if (this.embed > 1) {
                    this.embed--;
                    this.updatePaginator();
                }

                break;
            case `first_result_${this.interaction.id}`:
                interaction.acknowledge();

                this.embed = 1;
                this.updatePaginator();
                break;
            case `last_result_${this.interaction.id}`:
                interaction.acknowledge();

                this.embed = this.embeds.length;
                this.updatePaginator();
                break;
            case `jumpto_result_${this.interaction.id}`:
                interaction.createMessage({
                    embeds: [
                        new Utils.RichEmbed()
                            .setColor(this.client.config.BOT.COLOUR)
                            .setDescription(this.client.translate("main.result.enter.hint"))
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
                                    .setDescription(this.client.translate("main.result.enter.invalid"))
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
                                    .setDescription(this.client.translate("main.result.enter.unknown", { index: m.content }))
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
                                    .setDescription(this.client.translate("main.result.enter.unknown", { index: m.content }))
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
                const pageFilter = (m: Message<TextableChannel>) => {
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
                const pageResponse = await this.client.awaitChannelMessages(interaction.channel, { count: 1, filter: pageFilter, timeout: 30000 });

                if (pageResponse.message) {
                    pageResponse.message.delete();
                    this.api.search(this.search.query, parseInt(pageResponse.message.content)).then((search) => {
                        const title = search.books.map((book, index) => `\`⬛ ${(index + 1).toString().length > 1 ? `${index + 1}`  : `${index + 1} `}\` - [\`${book.id}\`](https://nhentai.net/g/${book.id}) - \`${book.title.pretty}\``);
                        const embeds = search.books.map((book, index) => {
                            const artistTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name);
                            const characterTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name);
                            const contentTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`);
                            const languageTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name.charAt(0).toUpperCase() + tag.name.slice(1));
                            const parodyTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name);
                            const uploadedAt = `<t:${book.uploaded.getTime() / 1000}:F>`;

                            return new Utils.RichEmbed()
                                .setAuthor(book.id.toString(), `https://nhentai.net/g/${book.id}`)
                                .setColor(this.client.config.BOT.COLOUR)
                                .setDescription(title.join("\n").replace(`\`⬛ ${(index + 1).toString().length > 1 ? `${index + 1}`  : `${index + 1} `}\` - [\`${book.id}\`](https://nhentai.net/g/${book.id}) - \`${book.title.pretty}\``, `**\`🟥 ${(index + 1).toString().length > 1 ? `${index + 1}`  : `${index + 1} `}\` - [\`${book.id}\`](https://nhentai.net/g/${book.id}) - \`${book.title.pretty}\`**`))
                                .setFooter(`⭐ ${book.favorites.toLocaleString()}`)
                                .setTitle(this.client.translate("main.page", { firstIndex: search.page.toLocaleString(), lastIndex: search.pages.toLocaleString() }))
                                .setThumbnail(this.api.getImageURL(book.cover))
                                .addField(this.client.translate("main.title"), `\`${book.title.pretty}\``)
                                .addField(this.client.translate("main.pages"), `\`${book.pages.length}\``)
                                .addField(this.client.translate("main.released"), uploadedAt)
                                .addField(languageTags.length > 1 ? this.client.translate("main.languages") : this.client.translate("main.language"), `\`${languageTags.length !== 0 ? languageTags.join("`, `") : this.client.translate("main.none")}\``)
                                .addField(artistTags.length > 1 ? this.client.translate("main.artists") : this.client.translate("main.artist"), `\`${artistTags.length !== 0 ? artistTags.join("`, `") : this.client.translate("main.none")}\``)
                                .addField(characterTags.length > 1 ? this.client.translate("main.characters") : this.client.translate("main.character"), `\`${characterTags.length !== 0 ? characterTags.join("`, `") : this.client.translate("main.original")}\``)
                                .addField(parodyTags.length > 1 ? this.client.translate("main.parodies") : this.client.translate("main.parody"), `\`${parodyTags.length !== 0 ? parodyTags.join("`, `").replace("original", `${this.client.translate("main.original")}`) : this.client.translate("main.none")}\``)
                                .addField(contentTags.length > 1 ? this.client.translate("main.tags") : this.client.translate("main.tag"), `\`${contentTags.length !== 0 ? contentTags.join("`, `") : this.client.translate("main.none")}\``);
                        });

                        this.embeds = embeds;
                        this.embed = 1;
                        this.updatePaginator();
                    });
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
            case `next_result_page_${this.interaction.id}`:
                interaction.acknowledge();

                if (parseInt(embed.title.split(this.client.translate("main.page").split(" ")[0])[1].split("/")[0]) < this.search.pages) {
                    this.api.search(this.search.query, parseInt(embed.title.split(this.client.translate("main.page").split(" ")[0])[1].split("/")[0]) + 1).then((search) => {
                        const title = search.books.map((book, index) => `\`⬛ ${(index + 1).toString().length > 1 ? `${index + 1}`  : `${index + 1} `}\` - [\`${book.id}\`](https://nhentai.net/g/${book.id}) - \`${book.title.pretty}\``);
                        const embeds = search.books.map((book, index) => {
                            const artistTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name);
                            const characterTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name);
                            const contentTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`);
                            const languageTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name.charAt(0).toUpperCase() + tag.name.slice(1));
                            const parodyTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name);
                            const uploadedAt = `<t:${book.uploaded.getTime() / 1000}:F>`;

                            return new Utils.RichEmbed()
                                .setAuthor(book.id.toString(), `https://nhentai.net/g/${book.id}`)
                                .setColor(this.client.config.BOT.COLOUR)
                                .setDescription(title.join("\n").replace(`\`⬛ ${(index + 1).toString().length > 1 ? `${index + 1}`  : `${index + 1} `}\` - [\`${book.id}\`](https://nhentai.net/g/${book.id}) - \`${book.title.pretty}\``, `**\`🟥 ${(index + 1).toString().length > 1 ? `${index + 1}`  : `${index + 1} `}\` - [\`${book.id}\`](https://nhentai.net/g/${book.id}) - \`${book.title.pretty}\`**`))
                                .setFooter(`⭐ ${book.favorites.toLocaleString()}`)
                                .setTitle(this.client.translate("main.page", { firstIndex: search.page.toLocaleString(), lastIndex: search.pages.toLocaleString() }))
                                .setThumbnail(this.api.getImageURL(book.cover))
                                .addField(this.client.translate("main.title"), `\`${book.title.pretty}\``)
                                .addField(this.client.translate("main.pages"), `\`${book.pages.length}\``)
                                .addField(this.client.translate("main.released"), uploadedAt)
                                .addField(languageTags.length > 1 ? this.client.translate("main.languages") : this.client.translate("main.language"), `\`${languageTags.length !== 0 ? languageTags.join("`, `") : this.client.translate("main.none")}\``)
                                .addField(artistTags.length > 1 ? this.client.translate("main.artists") : this.client.translate("main.artist"), `\`${artistTags.length !== 0 ? artistTags.join("`, `") : this.client.translate("main.none")}\``)
                                .addField(characterTags.length > 1 ? this.client.translate("main.characters") : this.client.translate("main.character"), `\`${characterTags.length !== 0 ? characterTags.join("`, `") : this.client.translate("main.original")}\``)
                                .addField(parodyTags.length > 1 ? this.client.translate("main.parodies") : this.client.translate("main.parody"), `\`${parodyTags.length !== 0 ? parodyTags.join("`, `").replace("original", `${this.client.translate("main.original")}`) : this.client.translate("main.none")}\``)
                                .addField(contentTags.length > 1 ? this.client.translate("main.tags") : this.client.translate("main.tag"), `\`${contentTags.length !== 0 ? contentTags.join("`, `") : this.client.translate("main.none")}\``);
                        });

                        this.embeds = embeds;
                        this.embed = 1;
                        this.updatePaginator();
                    });
                }

                break;
            case `previous_result_page_${this.interaction.id}`:
                interaction.acknowledge();

                if (parseInt(embed.title.split(this.client.translate("main.page").split(" ")[0])[1].split("/")[0]) > 1) {
                    this.api.search(this.search.query, parseInt(embed.title.split(this.client.translate("main.page").split(" ")[0])[1].split("/")[0]) - 1).then((search) => {
                        const title = search.books.map((book, index) => `\`⬛ ${(index + 1).toString().length > 1 ? `${index + 1}`  : `${index + 1} `}\` - [\`${book.id}\`](https://nhentai.net/g/${book.id}) - \`${book.title.pretty}\``);
                        const embeds = search.books.map((book, index) => {
                            const artistTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name);
                            const characterTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name);
                            const contentTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`);
                            const languageTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name.charAt(0).toUpperCase() + tag.name.slice(1));
                            const parodyTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name);
                            const uploadedAt = `<t:${book.uploaded.getTime() / 1000}:F>`;

                            return new Utils.RichEmbed()
                                .setAuthor(book.id.toString(), `https://nhentai.net/g/${book.id}`)
                                .setColor(this.client.config.BOT.COLOUR)
                                .setDescription(title.join("\n").replace(`\`⬛ ${(index + 1).toString().length > 1 ? `${index + 1}`  : `${index + 1} `}\` - [\`${book.id}\`](https://nhentai.net/g/${book.id}) - \`${book.title.pretty}\``, `**\`🟥 ${(index + 1).toString().length > 1 ? `${index + 1}`  : `${index + 1} `}\` - [\`${book.id}\`](https://nhentai.net/g/${book.id}) - \`${book.title.pretty}\`**`))
                                .setFooter(`⭐ ${book.favorites.toLocaleString()}`)
                                .setTitle(this.client.translate("main.page", { firstIndex: search.page.toLocaleString(), lastIndex: search.pages.toLocaleString() }))
                                .setThumbnail(this.api.getImageURL(book.cover))
                                .addField(this.client.translate("main.title"), `\`${book.title.pretty}\``)
                                .addField(this.client.translate("main.pages"), `\`${book.pages.length}\``)
                                .addField(this.client.translate("main.released"), uploadedAt)
                                .addField(languageTags.length > 1 ? this.client.translate("main.languages") : this.client.translate("main.language"), `\`${languageTags.length !== 0 ? languageTags.join("`, `") : this.client.translate("main.none")}\``)
                                .addField(artistTags.length > 1 ? this.client.translate("main.artists") : this.client.translate("main.artist"), `\`${artistTags.length !== 0 ? artistTags.join("`, `") : this.client.translate("main.none")}\``)
                                .addField(characterTags.length > 1 ? this.client.translate("main.characters") : this.client.translate("main.character"), `\`${characterTags.length !== 0 ? characterTags.join("`, `") : this.client.translate("main.original")}\``)
                                .addField(parodyTags.length > 1 ? this.client.translate("main.parodies") : this.client.translate("main.parody"), `\`${parodyTags.length !== 0 ? parodyTags.join("`, `").replace("original", `${this.client.translate("main.original")}`) : this.client.translate("main.none")}\``)
                                .addField(contentTags.length > 1 ? this.client.translate("main.tags") : this.client.translate("main.tag"), `\`${contentTags.length !== 0 ? contentTags.join("`, `") : this.client.translate("main.none")}\``);
                        });

                        this.embeds = embeds;
                        this.embed = 1;
                        this.updatePaginator();
                    });
                }

                break;
            case `first_result_page_${this.interaction.id}`:
                interaction.acknowledge();

                this.api.search(this.search.query, 1).then((search) => {
                    const title = search.books.map((book, index) => `\`⬛ ${(index + 1).toString().length > 1 ? `${index + 1}`  : `${index + 1} `}\` - [\`${book.id}\`](https://nhentai.net/g/${book.id}) - \`${book.title.pretty}\``);
                    const embeds = search.books.map((book, index) => {
                        const artistTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name);
                        const characterTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name);
                        const contentTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`);
                        const languageTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name.charAt(0).toUpperCase() + tag.name.slice(1));
                        const parodyTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name);
                        const uploadedAt = `<t:${book.uploaded.getTime() / 1000}:F>`;

                        return new Utils.RichEmbed()
                            .setAuthor(book.id.toString(), `https://nhentai.net/g/${book.id}`)
                            .setColor(this.client.config.BOT.COLOUR)
                            .setDescription(title.join("\n").replace(`\`⬛ ${(index + 1).toString().length > 1 ? `${index + 1}`  : `${index + 1} `}\` - [\`${book.id}\`](https://nhentai.net/g/${book.id}) - \`${book.title.pretty}\``, `**\`🟥 ${(index + 1).toString().length > 1 ? `${index + 1}`  : `${index + 1} `}\` - [\`${book.id}\`](https://nhentai.net/g/${book.id}) - \`${book.title.pretty}\`**`))
                            .setFooter(`⭐ ${book.favorites.toLocaleString()}`)
                            .setTitle(this.client.translate("main.page", { firstIndex: search.page.toLocaleString(), lastIndex: search.pages.toLocaleString() }))
                            .setThumbnail(this.api.getImageURL(book.cover))
                            .addField(this.client.translate("main.title"), `\`${book.title.pretty}\``)
                            .addField(this.client.translate("main.pages"), `\`${book.pages.length}\``)
                            .addField(this.client.translate("main.released"), uploadedAt)
                            .addField(languageTags.length > 1 ? this.client.translate("main.languages") : this.client.translate("main.language"), `\`${languageTags.length !== 0 ? languageTags.join("`, `") : this.client.translate("main.none")}\``)
                            .addField(artistTags.length > 1 ? this.client.translate("main.artists") : this.client.translate("main.artist"), `\`${artistTags.length !== 0 ? artistTags.join("`, `") : this.client.translate("main.none")}\``)
                            .addField(characterTags.length > 1 ? this.client.translate("main.characters") : this.client.translate("main.character"), `\`${characterTags.length !== 0 ? characterTags.join("`, `") : this.client.translate("main.original")}\``)
                            .addField(parodyTags.length > 1 ? this.client.translate("main.parodies") : this.client.translate("main.parody"), `\`${parodyTags.length !== 0 ? parodyTags.join("`, `").replace("original", `${this.client.translate("main.original")}`) : this.client.translate("main.none")}\``)
                            .addField(contentTags.length > 1 ? this.client.translate("main.tags") : this.client.translate("main.tag"), `\`${contentTags.length !== 0 ? contentTags.join("`, `") : this.client.translate("main.none")}\``);
                    });

                    this.embeds = embeds;
                    this.embed = 1;
                    this.updatePaginator();
                });

                break;
            case `last_result_page_${this.interaction.id}`:
                this.api.search(this.search.query, this.search.pages).then((search) => {
                    const title = search.books.map((book, index) => `\`⬛ ${(index + 1).toString().length > 1 ? `${index + 1}`  : `${index + 1} `}\` - [\`${book.id}\`](https://nhentai.net/g/${book.id}) - \`${book.title.pretty}\``);
                    const embeds = search.books.map((book, index) => {
                        const artistTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name);
                        const characterTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name);
                        const contentTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`);
                        const languageTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name.charAt(0).toUpperCase() + tag.name.slice(1));
                        const parodyTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name);
                        const uploadedAt = `<t:${book.uploaded.getTime() / 1000}:F>`;

                        return new Utils.RichEmbed()
                            .setAuthor(book.id.toString(), `https://nhentai.net/g/${book.id}`)
                            .setColor(this.client.config.BOT.COLOUR)
                            .setDescription(title.join("\n").replace(`\`⬛ ${(index + 1).toString().length > 1 ? `${index + 1}`  : `${index + 1} `}\` - [\`${book.id}\`](https://nhentai.net/g/${book.id}) - \`${book.title.pretty}\``, `**\`🟥 ${(index + 1).toString().length > 1 ? `${index + 1}`  : `${index + 1} `}\` - [\`${book.id}\`](https://nhentai.net/g/${book.id}) - \`${book.title.pretty}\`**`))
                            .setFooter(`⭐ ${book.favorites.toLocaleString()}`)
                            .setTitle(this.client.translate("main.page", { firstIndex: search.page.toLocaleString(), lastIndex: search.pages.toLocaleString() }))
                            .setThumbnail(this.api.getImageURL(book.cover))
                            .addField(this.client.translate("main.title"), `\`${book.title.pretty}\``)
                            .addField(this.client.translate("main.pages"), `\`${book.pages.length}\``)
                            .addField(this.client.translate("main.released"), uploadedAt)
                            .addField(languageTags.length > 1 ? this.client.translate("main.languages") : this.client.translate("main.language"), `\`${languageTags.length !== 0 ? languageTags.join("`, `") : this.client.translate("main.none")}\``)
                            .addField(artistTags.length > 1 ? this.client.translate("main.artists") : this.client.translate("main.artist"), `\`${artistTags.length !== 0 ? artistTags.join("`, `") : this.client.translate("main.none")}\``)
                            .addField(characterTags.length > 1 ? this.client.translate("main.characters") : this.client.translate("main.character"), `\`${characterTags.length !== 0 ? characterTags.join("`, `") : this.client.translate("main.original")}\``)
                            .addField(parodyTags.length > 1 ? this.client.translate("main.parodies") : this.client.translate("main.parody"), `\`${parodyTags.length !== 0 ? parodyTags.join("`, `").replace("original", `${this.client.translate("main.original")}`) : this.client.translate("main.none")}\``)
                            .addField(contentTags.length > 1 ? this.client.translate("main.tags") : this.client.translate("main.tag"), `\`${contentTags.length !== 0 ? contentTags.join("`, `") : this.client.translate("main.none")}\``);
                    });

                    this.embeds = embeds;
                    this.embed = 1;
                    this.updatePaginator();
                });

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
                        { custom_id: `first_result_${this.interaction.id}`, label: this.client.translate("main.result.first"), style: 1, type: 2 },
                        { custom_id: `previous_result_${this.interaction.id}`, label: this.client.translate("main.result.previous"), style: 2, type: 2 },
                        { custom_id: `stop_result_${this.interaction.id}`, label: this.client.translate("main.stop"), style: 4, type: 2 },
                        { custom_id: `next_result_${this.interaction.id}`, label: this.client.translate("main.result.next"), style: 2, type: 2 },
                        { custom_id: `last_result_${this.interaction.id}`, label: this.client.translate("main.result.last"), style: 1, type: 2 },
                    ],
                    type: 1
                },
                {
                    components: [
                        { custom_id: `first_result_page_${this.interaction.id}`, label: this.client.translate("main.page.first"), style: 1, type: 2 },
                        { custom_id: `previous_result_page_${this.interaction.id}`, label: this.client.translate("main.page.previous"), style: 2, type: 2 },
                        { custom_id: `next_result_page_${this.interaction.id}`, label: this.client.translate("main.page.next"), style: 2, type: 2 },
                        { custom_id: `last_result_page_${this.interaction.id}`, label: this.client.translate("main.page.last"), style: 1, type: 2 }
                    ],
                    type: 1
                },
                {
                    components: [
                        { custom_id: `jumpto_result_${this.interaction.id}`, label: this.client.translate("main.result.enter"), style: 1, type: 2 },
                        { custom_id: `jumpto_page_${this.interaction.id}`, label: this.client.translate("main.page.enter"), style: 1, type: 2 }
                    ],
                    type: 1
                },
                {
                    components: [
                        { custom_id: `read_result_${this.interaction.id}`, label: this.client.translate("main.read"), style: 3, type: 2 },
                        { custom_id: `bookmark_${this.interaction.id}`, label: this.client.translate("main.bookmark"), style: 2, type: 2 },
                        { custom_id: `show_cover_${this.interaction.id}`, label: this.client.translate("main.cover.show"), style: 1, type: 2 }
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
        this.client.on("interactionCreate", this.onSearch);
        this.running = true;
    }

    /**
     * Stop the paginator class
     */
    public stopPaginator() {
        this.client.off("interactionCreate", this.onSearch);
        this.running = false;
    }
}

export async function createSearchPaginator(client: NReaderClient, search: Search, interaction: CommandInteraction<TextableChannel>) {
    const paginator = new SearchPaginator(client, search, interaction);

    paginator.runPaginator();

    return Promise.resolve(paginator.message);
}
