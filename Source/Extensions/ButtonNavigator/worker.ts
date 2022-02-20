"use strict";

import { ActionRow, AdvancedMessageContent, ComponentInteraction, EmbedOptions, Message, TextableChannel } from "eris";
import { API, Book, Search } from "nhentai-api";
import { GuildLanguage } from "../../Interfaces";
import LanguageConstants from "../../../Languages/LANG.json";
import Reader from "../client";
import moment from "moment";
import RichEmbed from "../embed";

/* I can't believe I wrote this all :O */

type GuildDataLanguage = "English";
type GuildDataReadState = "current" | "new";

interface GuildData {
    Language: GuildDataLanguage;
    Prefix: string;
    ReadState: GuildDataReadState;
}

class ButtonNavigator {
    api: API;
    embeds: EmbedOptions[]
    embed: number;
    client: Reader
    book: Book;
    guildLanguage: GuildLanguage;
    invoker: Message<TextableChannel>;
    message: Message<TextableChannel>;
    authorMessage: Message<TextableChannel>;
    constructor(client: Reader, book: Book, message: Message<TextableChannel>, authorMessage?: Message<TextableChannel>) {
        this.api = new API();
        this.authorMessage = authorMessage;
        this.book = book;
        this.client = client;
        this.embeds = book.pages.map((page) => ({ author: { name: `${book.id}`, url: `https://nhentai.net/g/${book.id}/`, icon_url: "https://cdn.discordapp.com/attachments/755253854819582114/894895960931590174/845298862184726538.png" }, title: book.title.pretty, image: { url: this.api.getImageURL(page) }, thumbnail: { url: this.api.getImageURL(book.cover) }, color: this.client.config.COLOR, footer: { text: `Requested By: ${authorMessage.member.username}#${authorMessage.member.discriminator}` } } as EmbedOptions));;
        this.embed = 1;
        this.guildLanguage = LanguageConstants[client.database.fetch(`Database.${this.authorMessage.guildID}.Language`)];
        this.invoker = message;
    }

    /**
     * Initialize the button navigator
     */
    async init(): Promise<void> {
        const guildData: GuildData = await this.client.database.fetch(`Database.${this.authorMessage.guildID}`);
        const messageContent: AdvancedMessageContent = {
            content: `Page **${this.embed}** / **${this.embeds.length}**`,
            embeds: [this.embeds[this.embed - 1]],
            components: [
                {
                    type: 1,
                    components: [
                        { style: 1, type: 2, custom_id: `first_page_${this.invoker.id}`, label: "First Page" },
                        { style: 2, type: 2, custom_id: `previous_page_${this.invoker.id}`, label: "Back" },
                        { style: 4, type: 2, custom_id: `kill_prop`, label: "Stop" },
                        { style: 2, type: 2, custom_id: `next_page_${this.invoker.id}`, label: "Next" },
                        { style: 1, type: 2, custom_id: `last_page_${this.invoker.id}`, label: "Last Page" }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { style: 1, type: 2, custom_id: `jumpto_page_${this.invoker.id}`, label: "Enter Page" },
                        { style: 2, type: 2, custom_id: "bookmark_prop", label: "Bookmark" }
                    ]
                }
            ]
        }

        if (guildData.ReadState === "current" && this.invoker.author.id === this.invoker.channel.client.user.id) {
            this.message = await this.invoker.edit(messageContent);
        } else if (guildData.ReadState === "new" && this.invoker.author.id === this.invoker.channel.client.user.id) {
            this.message = await this.invoker.channel.createMessage(messageContent);
        }

        // Remove old construction
        /* if (this.invoker.author.id === this.invoker.channel.client.user.id) {
            this.message = await this.invoker.edit(messageContent);
        } else {
            this.message = await this.invoker.channel.createMessage(messageContent);
        } */
    }

    /**
     * Update the embed content and its components
     */
    update(): void {
        this.message.edit({
            content: `Page **${this.embed}** / **${this.embeds.length}**`,
            embeds: [this.embeds[this.embed - 1]],
            components: [
                {
                    type: 1,
                    components: [
                        { style: 1, type: 2, custom_id: `first_page_${this.invoker.id}`, label: "First Page" },
                        { style: 2, type: 2, custom_id: `previous_page_${this.invoker.id}`, label: "Back" },
                        { style: 4, type: 2, custom_id: `kill_prop`, label: "Stop" },
                        { style: 2, type: 2, custom_id: `next_page_${this.invoker.id}`, label: "Next" },
                        { style: 1, type: 2, custom_id: `last_page_${this.invoker.id}`, label: "Last Page" }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { style: 1, type: 2, custom_id: `jumpto_page_${this.invoker.id}`, label: "Enter Page" },
                        { style: 2, type: 2, custom_id: "bookmark_prop", label: "Bookmark" }
                    ]
                }
            ]
        });
    }

    /**
     * Run the main event via `interactionCreate` that helps navigating the content to other pages
     */
    run(): void {
        this.client.on("interactionCreate", async (interaction: ComponentInteraction<TextableChannel>) => {
            if (interaction.member.bot) return;

            const artistTags: string[] = this.book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name);
            const characterTags: string[] = this.book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name);
            const contentTags: string[] = this.book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`);
            const languageTags: string[] = this.book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name);
            const parodyTags: string[] = this.book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name);
            const uploadedAt: string = `\`${moment(this.book.uploaded).format("On dddd, MMMM Do, YYYY h:mm A")}\``;

            let embed = new RichEmbed()
                .setAuthor(this.book.id.toString(), `https://nhentai.net/g/${this.book.id}`, "https://cdn.discordapp.com/attachments/755253854819582114/894895960931590174/845298862184726538.png")
                .setColor(this.client.config.COLOR)
                .addField(this.guildLanguage.MAIN.READ.TITLE, `\`${this.book.title.pretty}\``)
                .addField(this.guildLanguage.MAIN.READ.PAGES, `\`${this.book.pages.length}\``)
                .addField(this.guildLanguage.MAIN.READ.DATE, uploadedAt)
                .addField(`${languageTags.length > 1 ? this.guildLanguage.MAIN.READ.LANGUAGES : this.guildLanguage.MAIN.READ.LANGUAGE}`, `\`${languageTags.length !== 0 ? languageTags.join("`, `") : this.guildLanguage.MAIN.READ.NONE}\``)
                .addField(`${artistTags.length > 1 ? this.guildLanguage.MAIN.READ.ARTISTS : this.guildLanguage.MAIN.READ.ARTIST}`, `\`${artistTags.length !== 0 ? artistTags.join("`, `") : this.guildLanguage.MAIN.READ.NOT_PROVIDED}\``)
                .addField(`${characterTags.length > 1 ? this.guildLanguage.MAIN.READ.CHARACTERS : this.guildLanguage.MAIN.READ.CHARACTER}`, `\`${characterTags.length !== 0 ? characterTags.join("`, `") : "Original"}\``)
                .addField(this.guildLanguage.MAIN.READ.PARODY, `\`${parodyTags.length !== 0 ? parodyTags.join("`, `") : "Not Provided"}\``)
                .addField(`${contentTags.length > 1 ? this.guildLanguage.MAIN.READ.TAGS : this.guildLanguage.MAIN.READ.TAG}`, `\`${contentTags.length !== 0 ? contentTags.join("`, `") : this.guildLanguage.MAIN.READ.NOT_PROVIDED}\``)
                .setFooter(`⭐ ${this.book.favorites.toLocaleString()}`)
                .setThumbnail(this.api.getImageURL(this.book.cover));

            switch (interaction.data.custom_id) {
                case `read_prop_${this.authorMessage.id}`:
                    interaction.acknowledge();
                    this.init();
                    break;
                case `show_book_cover_${this.authorMessage.id}`:
                    const hideComponent: ActionRow = {
                        type: 1,
                        components: [
                            {
                                label: this.guildLanguage.MAIN.READ.READ,
                                custom_id: `read_prop_${this.authorMessage.id}`,
                                style: 1,
                                type: 2
                            },
                            {
                                label: this.guildLanguage.MAIN.READ.DISMISS,
                                custom_id: "kill_prop",
                                style: 4,
                                type: 2,
                            },
                            {
                                label: this.guildLanguage.MAIN.READ.BOOKMARK,
                                custom_id: "bookmark_prop",
                                style: 2,
                                type: 2
                            },
                            {
                                label: this.guildLanguage.MAIN.READ.HIDE_COVER,
                                custom_id: `hide_book_cover_${this.authorMessage.id}`,
                                style: 1,
                                type: 2
                            }
                        ]
                    };

                    embed.setImage(this.api.getImageURL(this.book.cover));

                    interaction.acknowledge();
                    this.invoker.edit({ embed: embed, components: [hideComponent] });
                    break;
                case `hide_book_cover_${this.authorMessage.id}`:
                    const showComponent: ActionRow = {
                        type: 1,
                        components: [
                            {
                                label: this.guildLanguage.MAIN.READ.READ,
                                custom_id: `read_prop_${this.authorMessage.id}`,
                                style: 1,
                                type: 2
                            },
                            {
                                label: this.guildLanguage.MAIN.READ.DISMISS,
                                custom_id: "kill_prop",
                                style: 4,
                                type: 2,
                            },
                            {
                                label: this.guildLanguage.MAIN.READ.BOOKMARK,
                                custom_id: "bookmark_prop",
                                style: 2,
                                type: 2
                            },
                            {
                                label: this.guildLanguage.MAIN.READ.SHOW_COVER,
                                custom_id: `show_book_cover_${this.authorMessage.id}`,
                                style: 1,
                                type: 2
                            }
                        ]
                    };

                    embed.setImage("");

                    interaction.acknowledge();
                    this.invoker.edit({ embed: embed, components: [showComponent] });
                    break;
                case `next_page_${this.invoker.id}`:
                    interaction.acknowledge();

                    if (this.embed < this.embeds.length) {
                        this.embed++
                        this.update();
                    }
                    break;
                case `previous_page_${this.invoker.id}`:
                    interaction.acknowledge();

                    if (this.embed > 1) {
                        this.embed--;
                        this.update();
                    }
                    break;
                case `first_page_${this.invoker.id}`:
                    interaction.acknowledge();

                    this.embed = 1;
                    this.update();
                    break;
                case `last_page_${this.invoker.id}`:
                    interaction.acknowledge();

                    this.embed = this.embeds.length;
                    this.update();
                    break;
                case `jumpto_page_${this.invoker.id}`:
                    interaction.createMessage({
                        embeds: [
                            {
                                description: `This doujin has a total pages of **${this.embeds.length}**, please enter the number page you want to jump. You only got **30 Seconds** before I ignore you.`,
                                color: this.client.config.COLOR
                            }
                        ],
                        flags: 64
                    });

                    const filter = (m: Message<TextableChannel>) => {
                        if (m.author.bot) return;
                        if (m.author.id !== interaction.member.id) return;
                        if (isNaN(parseInt(m.content))) {
                            m.delete();
                            interaction.createMessage({
                                embeds: [
                                    {
                                        description: "Please enter a valid number page!",
                                        color: this.client.config.COLOR
                                    }
                                ],
                                flags: 64
                            });
                            return false;
                        }
                        if (parseInt(m.content) > this.embeds.length) {
                            m.delete();
                            interaction.createMessage({
                                embeds: [
                                    {
                                        description: `This doujin only has **1-${this.embeds.length}** pages, what'd you think?`,
                                        color: this.client.config.COLOR
                                    }
                                ],
                                flags: 64
                            });
                            return false;
                        }
                        if (parseInt(m.content) <= 0) {
                            m.delete();
                            interaction.createMessage({
                                embeds: [
                                    {
                                        description: `This doujin only has **1-${this.embeds.length}** pages, what'd you think?`,
                                        color: this.client.config.COLOR
                                    }
                                ],
                                flags: 64
                            });
                            return false;
                        }
                        else return true;
                    }

                    const response = await this.client.awaitChannelMessages(interaction.channel, { timeout: 30000, count: 1, filter: filter });

                    if (response.message) {
                        response.message.delete();
                        this.embed = parseInt(response.message.content);
                        this.update();
                    } else {
                        return interaction.createMessage({
                            embeds: [
                                {
                                    description: "**30 Seconds** passed and I've not received any response from you... \n\n Click the **Enter Page** again to enter a valid page.",
                                    color: this.client.config.COLOR
                                }
                            ],
                            flags: 64
                        });
                    }
                    break;
            }
        });
    }
}

class SearchDetailButtonNavigator {
    api: API;
    authorMessage?: Message<TextableChannel>;
    client: Reader;
    embed: number;
    embeds: EmbedOptions[];
    invoker: Message<TextableChannel>;
    message: Message<TextableChannel>;
    search: Search;
    constructor(client: Reader, search: Search, message: Message<TextableChannel>, authorMessage?: Message<TextableChannel>) {
        this.api = new API();
        this.authorMessage = authorMessage;
        this.client = client;
        this.embed = 1;
        this.embeds = [];
        this.invoker = message;
        this.search = search;
    }

    /**
     * Initialize the button navigator
     */
    async init(): Promise<void> {
        const title: string = this.search.books.map((book, index) => `**${index + 1}.** \`[${book.id}]\` - \`${book.title.pretty}\``).join("\n");
        const embeds: EmbedOptions[] = this.search.books.map((book, index) =>
        ({
            author: {
                name: `${book.id}`,
                url: `https://nhentai.net/g/${book.id}/`,
                icon_url: "https://cdn.discordapp.com/attachments/755253854819582114/894895960931590174/845298862184726538.png"
            },
            title: `Page ${this.search.page.toLocaleString()} / ${this.search.pages.toLocaleString()}`,
            description: `${title} \n\n\n Currently Viewing Result: **__${index + 1}__** | \`[${book.id}]\``,
            color: this.client.config.COLOR,
            thumbnail: {
                url: this.api.getImageURL(book.cover)
            },
            fields: [
                {
                    name: "Title",
                    value: `\`${book.title.pretty}\``
                },
                {
                    name: "Pages",
                    value: `\`${book.pages.length}\``
                },
                {
                    name: "Date Released",
                    value: `\`${moment(book.uploaded).format("On dddd, MMMM Do, YYYY h:mm A")}\``
                },
                {
                    name: `${book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name).length > 1 ? "Languages" : "Language"}`,
                    value: `\`${book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name).join("`, `") : "None"}\``
                },
                {
                    name: `${book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name).length > 1 ? "Artists" : "Artist"}`,
                    value: `\`${book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name).join("`, `") : "Not Provided"}\``
                },
                {
                    name: `${book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name).length > 1 ? "Characters" : "Character"}`,
                    value: `\`${book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name).join("`, `") : "Original"}\``
                },
                {
                    name: "Parody",
                    value: `\`${book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name).join("`, `") : "Not Provided"}\``
                },
                {
                    name: `${book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => tag.name).length > 1 ? "Tags" : "Tag"}`,
                    value: `\`${book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`).join("`, `") : "Not Provided"}\``
                }

            ],
            footer: {
                text: `⭐ ${book.favorites.toLocaleString()}`
            }
        } as EmbedOptions));

        this.embeds = embeds;

        const messageContent: AdvancedMessageContent = {
            embeds: [this.embeds[this.embed - 1]],
            components: [
                {
                    type: 1,
                    components: [
                        { style: 1, type: 2, custom_id: `first_result_${this.invoker.id}`, label: "First Result" },
                        { style: 2, type: 2, custom_id: `previous_result_${this.invoker.id}`, label: "Back" },
                        { style: 4, type: 2, custom_id: `kill_prop`, label: "Stop" },
                        { style: 2, type: 2, custom_id: `next_result_${this.invoker.id}`, label: "Next" },
                        { style: 1, type: 2, custom_id: `last_result_${this.invoker.id}`, label: "Last Result" }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { style: 1, type: 2, custom_id: `first_result_page_${this.invoker.id}`, label: "First Page" },
                        { style: 2, type: 2, custom_id: `previous_result_page_${this.invoker.id}`, label: "Back" },
                        { style: 4, type: 2, custom_id: `easter_kill_prop`, label: "Stop" },
                        { style: 2, type: 2, custom_id: `next_result_page_${this.invoker.id}`, label: "Next" },
                        { style: 1, type: 2, custom_id: `last_result_page_${this.invoker.id}`, label: "Last Page" }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { style: 1, type: 2, custom_id: `jumpto_result_${this.invoker.id}`, label: "Enter Result" },
                        { style: 1, type: 2, custom_id: `jumpto_result_page_${this.invoker.id}`, label: "Enter Page" }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { style: 1, type: 2, custom_id: `read_prop_${this.invoker.id}`, label: "Read" },
                        { style: 2, type: 2, custom_id: "bookmark_prop", label: "Bookmark" },
                        { style: 1, type: 2, custom_id: `show_book_cover_${this.invoker.id}`, label: "Show Cover" }
                    ]
                }
            ]
        };

        if (this.invoker.author.id === this.client.user.id) {
            this.message = await this.invoker.edit(messageContent);
        } else {
            this.message = await this.invoker.channel.createMessage(messageContent);
        }

        this.update();
    }

    /**
     * Update the embed content and its components
     */
    update(): void {
        this.message.edit({
            embeds: [this.embeds[this.embed - 1]],
            components: [
                {
                    type: 1,
                    components: [
                        { style: 1, type: 2, custom_id: `first_result_${this.invoker.id}`, label: "First Result" },
                        { style: 2, type: 2, custom_id: `previous_result_${this.invoker.id}`, label: "Back" },
                        { style: 4, type: 2, custom_id: `kill_prop`, label: "Stop" },
                        { style: 2, type: 2, custom_id: `next_result_${this.invoker.id}`, label: "Next" },
                        { style: 1, type: 2, custom_id: `last_result_${this.invoker.id}`, label: "Last Result" }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { style: 1, type: 2, custom_id: `first_result_page_${this.invoker.id}`, label: "First Page" },
                        { style: 2, type: 2, custom_id: `previous_result_page_${this.invoker.id}`, label: "Back" },
                        { style: 4, type: 2, custom_id: `easter_kill_prop`, label: "Stop" },
                        { style: 2, type: 2, custom_id: `next_result_page_${this.invoker.id}`, label: "Next" },
                        { style: 1, type: 2, custom_id: `last_result_page_${this.invoker.id}`, label: "Last Page" }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { style: 1, type: 2, custom_id: `jumpto_result_${this.invoker.id}`, label: "Enter Result" },
                        { style: 1, type: 2, custom_id: `jumpto_result_page_${this.invoker.id}`, label: "Enter Page" }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { style: 1, type: 2, custom_id: `read_prop_${this.invoker.id}`, label: "Read" },
                        { style: 2, type: 2, custom_id: "bookmark_prop", label: "Bookmark" },
                        { style: 1, type: 2, custom_id: `show_book_cover_${this.invoker.id}`, label: "Show Cover" }
                    ]
                }
            ]
        });
    }

    /**
     * Run the main event via `interactionCreate` that helps navigating the content to other pages
     */
    run(): void {
        this.client.on("interactionCreate", async (interaction: ComponentInteraction<TextableChannel>) => {
            if (interaction.member.bot) return;

            let embed = new RichEmbed(interaction.message.embeds[0]);

            switch (interaction.data.custom_id) {
                case `see_detail_${this.authorMessage.id}`:
                    interaction.acknowledge();
                    this.init();
                    break;
                case `show_book_cover_${this.invoker.id}`:
                    const hideComponent: ActionRow[] = [
                        {
                            type: 1,
                            components: [
                                { style: 1, type: 2, custom_id: `first_result_${this.invoker.id}`, label: "First Result" },
                                { style: 2, type: 2, custom_id: `previous_result_${this.invoker.id}`, label: "Back" },
                                { style: 4, type: 2, custom_id: `kill_prop`, label: "Stop" },
                                { style: 2, type: 2, custom_id: `next_result_${this.invoker.id}`, label: "Next" },
                                { style: 1, type: 2, custom_id: `last_result_${this.invoker.id}`, label: "Last Result" }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                { style: 1, type: 2, custom_id: `first_result_page_${this.invoker.id}`, label: "First Page" },
                                { style: 2, type: 2, custom_id: `previous_result_page_${this.invoker.id}`, label: "Back" },
                                { style: 4, type: 2, custom_id: `easter_kill_prop`, label: "Stop" },
                                { style: 2, type: 2, custom_id: `next_result_page_${this.invoker.id}`, label: "Next" },
                                { style: 1, type: 2, custom_id: `last_result_page_${this.invoker.id}`, label: "Last Page" }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                { style: 1, type: 2, custom_id: `jumpto_result_${this.invoker.id}`, label: "Enter Result" },
                                { style: 1, type: 2, custom_id: `jumpto_result_page_${this.invoker.id}`, label: "Enter Page" }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                { style: 1, type: 2, custom_id: `read_prop_${this.invoker.id}`, label: "Read" },
                                { style: 2, type: 2, custom_id: "bookmark_prop", label: "Bookmark" },
                                { style: 1, type: 2, custom_id: `hide_book_cover_${this.invoker.id}`, label: "Hide Cover" }
                            ]
                        }
                    ]

                    embed.setImage(this.api.getImageURL((await this.api.getBook(parseInt(interaction.message.embeds[0].author.name))).cover))

                    interaction.acknowledge();
                    this.invoker.edit({ embed, components: hideComponent });
                    break;
                case `hide_book_cover_${this.invoker.id}`:
                    const showComponent: ActionRow[] = [
                        {
                            type: 1,
                            components: [
                                { style: 1, type: 2, custom_id: `first_result_${this.invoker.id}`, label: "First Result" },
                                { style: 2, type: 2, custom_id: `previous_result_${this.invoker.id}`, label: "Back" },
                                { style: 4, type: 2, custom_id: `kill_prop`, label: "Stop" },
                                { style: 2, type: 2, custom_id: `next_result_${this.invoker.id}`, label: "Next" },
                                { style: 1, type: 2, custom_id: `last_result_${this.invoker.id}`, label: "Last Result" }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                { style: 1, type: 2, custom_id: `first_result_page_${this.invoker.id}`, label: "First Page" },
                                { style: 2, type: 2, custom_id: `previous_result_page_${this.invoker.id}`, label: "Back" },
                                { style: 4, type: 2, custom_id: `easter_kill_prop`, label: "Stop" },
                                { style: 2, type: 2, custom_id: `next_result_page_${this.invoker.id}`, label: "Next" },
                                { style: 1, type: 2, custom_id: `last_result_page_${this.invoker.id}`, label: "Last Page" }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                { style: 1, type: 2, custom_id: `jumpto_result_${this.invoker.id}`, label: "Enter Result" },
                                { style: 1, type: 2, custom_id: `jumpto_result_page_${this.invoker.id}`, label: "Enter Page" }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                { style: 1, type: 2, custom_id: `read_prop_${this.invoker.id}`, label: "Read" },
                                { style: 2, type: 2, custom_id: "bookmark_prop", label: "Bookmark" },
                                { style: 1, type: 2, custom_id: `show_book_cover_${this.invoker.id}`, label: "Show Cover" }
                            ]
                        }
                    ]

                    embed.setImage("");

                    interaction.acknowledge()
                    this.invoker.edit({ embed: embed, components: showComponent });
                    break;
                case `next_result_${this.invoker.id}`:
                    interaction.acknowledge();

                    if (this.embed < this.embeds.length) {
                        this.embed++
                        this.update();
                    }
                    break;
                case `previous_result_${this.invoker.id}`:
                    interaction.acknowledge();

                    if (this.embed > 1) {
                        this.embed--;
                        this.update();
                    }
                    break;
                case `first_result_${this.invoker.id}`:
                    interaction.acknowledge();

                    this.embed = 1;
                    this.update();
                    break;
                case `last_result_${this.invoker.id}`:
                    interaction.acknowledge();

                    this.embed = this.embeds.length;
                    this.update();
                    break;
                case `next_result_page_${this.invoker.id}`:
                    interaction.acknowledge();

                    if (parseInt(interaction.message.embeds[0].title.split("Page")[1].split("/")[0]) < this.search.pages) {
                        this.api.search(this.search.query, parseInt(interaction.message.embeds[0].title.split("Page")[1].split("/")[0]) + 1).then((search) => {
                            const title: string = search.books.map((book, index) => `**${index + 1}.** \`[${book.id}]\` - \`${book.title.pretty}\``).join("\n");
                            const embeds: EmbedOptions[] = search.books.map((book, index) =>
                            ({
                                author: {
                                    name: `${book.id}`,
                                    url: `https://nhentai.net/g/${book.id}/`,
                                    icon_url: "https://cdn.discordapp.com/attachments/755253854819582114/894895960931590174/845298862184726538.png"
                                },
                                title: `Page ${search.page.toLocaleString()} / ${this.search.pages.toLocaleString()}`,
                                description: `${title} \n\n\n Currently Viewing Result: **__${index + 1}__** | \`[${book.id}]\``,
                                color: this.client.config.COLOR,
                                thumbnail: {
                                    url: this.api.getImageURL(book.cover)
                                },
                                fields: [
                                    {
                                        name: "Title",
                                        value: `\`${book.title.pretty}\``
                                    },
                                    {
                                        name: "Pages",
                                        value: `\`${book.pages.length}\``
                                    },
                                    {
                                        name: "Date Released",
                                        value: `\`${moment(book.uploaded).format("On dddd, MMMM Do, YYYY h:mm A")}\``
                                    },
                                    {
                                        name: `${book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name).length > 1 ? "Languages" : "Language"}`,
                                        value: `\`${book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name).join("`, `") : "None"}\``
                                    },
                                    {
                                        name: `${book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name).length > 1 ? "Artists" : "Artist"}`,
                                        value: `\`${book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name).join("`, `") : "Not Provided"}\``
                                    },
                                    {
                                        name: `${book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name).length > 1 ? "Characters" : "Character"}`,
                                        value: `\`${book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name).join("`, `") : "Original"}\``
                                    },
                                    {
                                        name: "Parody",
                                        value: `\`${book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name).join("`, `") : "Not Provided"}\``
                                    },
                                    {
                                        name: `${book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => tag.name).length > 1 ? "Tags" : "Tag"}`,
                                        value: `\`${book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`).join("`, `") : "Not Provided"}\``
                                    }

                                ],
                                footer: {
                                    text: `⭐ ${book.favorites.toLocaleString()}`
                                }
                            } as EmbedOptions));

                            this.embeds = embeds;
                            this.embed = 1;
                            this.update();
                        });
                    }
                    break;
                case `previous_result_page_${this.invoker.id}`:
                    interaction.acknowledge();

                    if (parseInt(interaction.message.embeds[0].title.split("Page")[1].split("/")[0]) > 1) {
                        this.api.search(this.search.query, parseInt(interaction.message.embeds[0].title.split("Page")[1].split("/")[0]) - 1).then((search) => {
                            const title: string = search.books.map((book, index) => `**${index + 1}.** \`[${book.id}]\` - \`${book.title.pretty}\``).join("\n");
                            const embeds: EmbedOptions[] = search.books.map((book, index) =>
                            ({
                                author: {
                                    name: `${book.id}`,
                                    url: `https://nhentai.net/g/${book.id}/`,
                                    icon_url: "https://cdn.discordapp.com/attachments/755253854819582114/894895960931590174/845298862184726538.png"
                                },
                                title: `Page ${search.page.toLocaleString()} / ${this.search.pages.toLocaleString()}`,
                                description: `${title} \n\n\n Currently Viewing Result: **__${index + 1}__** | \`[${book.id}]\``,
                                color: this.client.config.COLOR,
                                thumbnail: {
                                    url: this.api.getImageURL(book.cover)
                                },
                                fields: [
                                    {
                                        name: "Title",
                                        value: `\`${book.title.pretty}\``
                                    },
                                    {
                                        name: "Pages",
                                        value: `\`${book.pages.length}\``
                                    },
                                    {
                                        name: "Date Released",
                                        value: `\`${moment(book.uploaded).format("On dddd, MMMM Do, YYYY h:mm A")}\``
                                    },
                                    {
                                        name: `${book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name).length > 1 ? "Languages" : "Language"}`,
                                        value: `\`${book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name).join("`, `") : "None"}\``
                                    },
                                    {
                                        name: `${book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name).length > 1 ? "Artists" : "Artist"}`,
                                        value: `\`${book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name).join("`, `") : "Not Provided"}\``
                                    },
                                    {
                                        name: `${book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name).length > 1 ? "Characters" : "Character"}`,
                                        value: `\`${book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name).join("`, `") : "Original"}\``
                                    },
                                    {
                                        name: "Parody",
                                        value: `\`${book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name).join("`, `") : "Not Provided"}\``
                                    },
                                    {
                                        name: `${book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => tag.name).length > 1 ? "Tags" : "Tag"}`,
                                        value: `\`${book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`).join("`, `") : "Not Provided"}\``
                                    }

                                ],
                                footer: {
                                    text: `⭐ ${book.favorites.toLocaleString()}`
                                }
                            } as EmbedOptions));

                            this.embeds = embeds;
                            this.embed = 1;
                            this.update();
                        });
                    }
                    break;
                case `first_result_page_${this.invoker.id}`:
                    interaction.acknowledge();

                    this.api.search(this.search.query, 1).then((search) => {
                        const title: string = search.books.map((book, index) => `**${index + 1}.** \`[${book.id}]\` - \`${book.title.pretty}\``).join("\n");
                        const embeds: EmbedOptions[] = search.books.map((book, index) =>
                        ({
                            author: {
                                name: `${book.id}`,
                                url: `https://nhentai.net/g/${book.id}/`,
                                icon_url: "https://cdn.discordapp.com/attachments/755253854819582114/894895960931590174/845298862184726538.png"
                            },
                            title: `Page ${search.page.toLocaleString()} / ${this.search.pages.toLocaleString()}`,
                            description: `${title} \n\n\n Currently Viewing Result: **__${index + 1}__** | \`[${book.id}]\``,
                            color: this.client.config.COLOR,
                            thumbnail: {
                                url: this.api.getImageURL(book.cover)
                            },
                            fields: [
                                {
                                    name: "Title",
                                    value: `\`${book.title.pretty}\``
                                },
                                {
                                    name: "Pages",
                                    value: `\`${book.pages.length}\``
                                },
                                {
                                    name: "Date Released",
                                    value: `\`${moment(book.uploaded).format("On dddd, MMMM Do, YYYY h:mm A")}\``
                                },
                                {
                                    name: `${book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name).length > 1 ? "Languages" : "Language"}`,
                                    value: `\`${book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name).join("`, `") : "None"}\``
                                },
                                {
                                    name: `${book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name).length > 1 ? "Artists" : "Artist"}`,
                                    value: `\`${book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name).join("`, `") : "Not Provided"}\``
                                },
                                {
                                    name: `${book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name).length > 1 ? "Characters" : "Character"}`,
                                    value: `\`${book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name).join("`, `") : "Original"}\``
                                },
                                {
                                    name: "Parody",
                                    value: `\`${book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name).join("`, `") : "Not Provided"}\``
                                },
                                {
                                    name: `${book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => tag.name).length > 1 ? "Tags" : "Tag"}`,
                                    value: `\`${book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`).join("`, `") : "Not Provided"}\``
                                }

                            ],
                            footer: {
                                text: `⭐ ${book.favorites.toLocaleString()}`
                            }
                        } as EmbedOptions));

                        this.embeds = embeds;
                        this.embed = 1;
                        this.update();
                    });
                    break;
                case `last_result_page_${this.invoker.id}`:
                    interaction.acknowledge();

                    this.api.search(this.search.query, this.search.pages).then((search) => {
                        const title: string = search.books.map((book, index) => `**${index + 1}.** \`[${book.id}]\` - \`${book.title.pretty}\``).join("\n");
                        const embeds: EmbedOptions[] = search.books.map((book, index) =>
                        ({
                            author: {
                                name: `${book.id}`,
                                url: `https://nhentai.net/g/${book.id}/`,
                                icon_url: "https://cdn.discordapp.com/attachments/755253854819582114/894895960931590174/845298862184726538.png"
                            },
                            title: `Page ${search.page.toLocaleString()} / ${this.search.pages.toLocaleString()}`,
                            description: `${title} \n\n\n Currently Viewing Result: **__${index + 1}__** | \`[${book.id}]\``,
                            color: this.client.config.COLOR,
                            thumbnail: {
                                url: this.api.getImageURL(book.cover)
                            },
                            fields: [
                                {
                                    name: "Title",
                                    value: `\`${book.title.pretty}\``
                                },
                                {
                                    name: "Pages",
                                    value: `\`${book.pages.length}\``
                                },
                                {
                                    name: "Date Released",
                                    value: `\`${moment(book.uploaded).format("On dddd, MMMM Do, YYYY h:mm A")}\``
                                },
                                {
                                    name: `${book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name).length > 1 ? "Languages" : "Language"}`,
                                    value: `\`${book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name).join("`, `") : "None"}\``
                                },
                                {
                                    name: `${book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name).length > 1 ? "Artists" : "Artist"}`,
                                    value: `\`${book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name).join("`, `") : "Not Provided"}\``
                                },
                                {
                                    name: `${book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name).length > 1 ? "Characters" : "Character"}`,
                                    value: `\`${book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name).join("`, `") : "Original"}\``
                                },
                                {
                                    name: "Parody",
                                    value: `\`${book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name).join("`, `") : "Not Provided"}\``
                                },
                                {
                                    name: `${book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => tag.name).length > 1 ? "Tags" : "Tag"}`,
                                    value: `\`${book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`).join("`, `") : "Not Provided"}\``
                                }

                            ],
                            footer: {
                                text: `⭐ ${book.favorites.toLocaleString()}`
                            }
                        } as EmbedOptions));

                        this.embeds = embeds;
                        this.embed = 1;
                        this.update();
                    });
                    break;
                case `jumpto_result_page_${this.invoker.id}`:
                    interaction.createMessage({
                        embeds: [
                            {
                                description: `This search result has a total pages of **${this.search.pages.toLocaleString()}**, please enter the number page you want to jump. You only got **30 Seconds** before I ignore you.`,
                                color: this.client.config.COLOR
                            }
                        ],
                        flags: 64
                    });

                    const collectorFilter = (m: Message<TextableChannel>) => {
                        if (m.author.bot) return;
                        if (m.author.id !== interaction.member.id) return;
                        if (isNaN(parseInt(m.content))) {
                            m.delete();
                            interaction.createMessage({
                                embeds: [
                                    {
                                        description: "Please enter a valid number page!",
                                        color: this.client.config.COLOR
                                    }
                                ],
                                flags: 64
                            });
                            return false;
                        }
                        if (parseInt(m.content) > this.search.pages) {
                            m.delete();
                            interaction.createMessage({
                                embeds: [
                                    {
                                        description: `This search result only has **1-${this.search.pages.toLocaleString()}** pages, what'd you think?`,
                                        color: this.client.config.COLOR
                                    }
                                ],
                                flags: 64
                            });
                            return false;
                        }
                        if (parseInt(m.content) <= 0) {
                            m.delete();
                            interaction.createMessage({
                                embeds: [
                                    {
                                        description: `This search result only has **1-${this.search.pages.toLocaleString()}** pages, what'd you think?`,
                                        color: this.client.config.COLOR
                                    }
                                ],
                                flags: 64
                            });
                            return false;
                        }
                        else return true;
                    }

                    const collectorResponse = await this.client.awaitChannelMessages(interaction.channel, { timeout: 30000, count: 1, filter: collectorFilter });

                    if (collectorResponse.message) {
                        collectorResponse.message.delete();
                        this.api.search(this.search.query, parseInt(collectorResponse.message.content)).then((search) => {
                            const title: string = search.books.map((book, index) => `**${index + 1}.** \`[${book.id}]\` - \`${book.title.pretty}\``).join("\n");
                            const embeds: EmbedOptions[] = search.books.map((book, index) =>
                            ({
                                author: {
                                    name: `${book.id}`,
                                    url: `https://nhentai.net/g/${book.id}/`,
                                    icon_url: "https://cdn.discordapp.com/attachments/755253854819582114/894895960931590174/845298862184726538.png"
                                },
                                title: `Page ${search.page} / ${this.search.pages.toLocaleString()}`,
                                description: `${title} \n\n\n Currently Viewing Result: **__${index + 1}__** | \`[${book.id}]\``,
                                color: this.client.config.COLOR,
                                thumbnail: {
                                    url: this.api.getImageURL(book.cover)
                                },
                                fields: [
                                    {
                                        name: "Title",
                                        value: `\`${book.title.pretty}\``
                                    },
                                    {
                                        name: "Pages",
                                        value: `\`${book.pages.length}\``
                                    },
                                    {
                                        name: "Date Released",
                                        value: `\`${moment(book.uploaded).format("On dddd, MMMM Do, YYYY h:mm A")}\``
                                    },
                                    {
                                        name: `${book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name).length > 1 ? "Languages" : "Language"}`,
                                        value: `\`${book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name).join("`, `") : "None"}\``
                                    },
                                    {
                                        name: `${book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name).length > 1 ? "Artists" : "Artist"}`,
                                        value: `\`${book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name).join("`, `") : "Not Provided"}\``
                                    },
                                    {
                                        name: `${book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name).length > 1 ? "Characters" : "Character"}`,
                                        value: `\`${book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name).join("`, `") : "Original"}\``
                                    },
                                    {
                                        name: "Parody",
                                        value: `\`${book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name).join("`, `") : "Not Provided"}\``
                                    },
                                    {
                                        name: `${book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => tag.name).length > 1 ? "Tags" : "Tag"}`,
                                        value: `\`${book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`).join("`, `") : "Not Provided"}\``
                                    }

                                ],
                                footer: {
                                    text: `⭐ ${book.favorites.toLocaleString()}`
                                }
                            } as EmbedOptions));

                            this.embeds = embeds;
                            this.embed = 1;
                            this.update();
                        });
                    } else {
                        return interaction.createMessage({
                            embeds: [
                                {
                                    description: "**30 Seconds** passed and I've not received any response from you... \n\n Click the **Enter Page** again to enter a valid page.",
                                    color: this.client.config.COLOR
                                }
                            ],
                            flags: 64
                        });
                    }
                    break;
                case `jumpto_result_${this.invoker.id}`:
                    interaction.createMessage({
                        embeds: [
                            {
                                description: `This page has a total results of **${this.embeds.length}**, please enter the number result you want to jump. You only got **30 Seconds** before I ignore you.`,
                                color: this.client.config.COLOR
                            }
                        ],
                        flags: 64
                    });

                    const filter = (m: Message<TextableChannel>) => {
                        if (m.author.bot) return;
                        if (m.author.id !== interaction.member.id) return;
                        if (isNaN(parseInt(m.content))) {
                            m.delete();
                            interaction.createMessage({
                                embeds: [
                                    {
                                        description: "Please enter a valid number results!",
                                        color: this.client.config.COLOR
                                    }
                                ],
                                flags: 64
                            });
                            return false;
                        }
                        if (parseInt(m.content) > this.embeds.length) {
                            m.delete();
                            interaction.createMessage({
                                embeds: [
                                    {
                                        description: `This page only has **1-${this.embeds.length}** results, what'd you think?`,
                                        color: this.client.config.COLOR
                                    }
                                ],
                                flags: 64
                            });
                            return false;
                        }
                        if (parseInt(m.content) <= 0) {
                            m.delete();
                            interaction.createMessage({
                                embeds: [
                                    {
                                        description: `This page only has **1-${this.embeds.length}** results, what'd you think?`,
                                        color: this.client.config.COLOR
                                    }
                                ],
                                flags: 64
                            });
                            return false;
                        }
                        else return true;
                    }

                    const response = await this.client.awaitChannelMessages(interaction.channel, { timeout: 30000, count: 1, filter: filter });

                    if (response.message) {
                        response.message.delete();
                        this.embed = parseInt(response.message.content);
                        this.update();
                    } else {
                        return interaction.createMessage({
                            embeds: [
                                {
                                    description: "**30 Seconds** passed and I've not received any response from you... \n\n Click the **Enter Result** again to enter a valid result.",
                                    color: this.client.config.COLOR
                                }
                            ],
                            flags: 64
                        });
                    }
                    break;
                case `read_prop_${this.invoker.id}`:
                    interaction.acknowledge();

                    this.api.getBook(parseInt(this.embeds[this.embed - 1].author.name)).then(async (book) => {
                        const paginationEmbed = new ButtonNavigator(this.client, book, this.message, this.authorMessage);
                        await paginationEmbed.init();
                        paginationEmbed.run();
                    });
                    break;
            }
        });
    }
}

class BookmarkButtonNavigator {
    api: API;
    authorMessage?: Message<TextableChannel>;
    books: Book[];
    client: Reader;
    embed: number;
    embeds: EmbedOptions[];
    guildLanguage: GuildLanguage;
    invoker: Message<TextableChannel>;
    message: Message<TextableChannel>;
    constructor(client: Reader, books: Book[], message: Message<TextableChannel>, authorMessage?: Message<TextableChannel>) {
        this.api = new API();
        this.authorMessage = authorMessage;
        this.books = books;
        this.client = client;
        this.embed = 1;
        this.embeds = []
        this.guildLanguage = (LanguageConstants[client.database.fetch(`Database.${message.guildID}.Language`) || "ENGLISH"] as GuildLanguage);
        this.invoker = message;
    }

    async init() {
        const title: string = this.books.map((book, index) => `**${index + 1}.** \`[${book.id}]\` - \`${book.title.pretty}\``).join("\n");
        const embeds: EmbedOptions[] = this.books.map((book, index) => ({
            author: {
                name: `${book.id}`,
                url: `https://nhentai.net/g/${book.id}/`,
                icon_url: "https://cdn.discordapp.com/attachments/755253854819582114/894895960931590174/845298862184726538.png"
            },
            title: this.guildLanguage.MAIN.BOOKMARK.TITLE.replace("{user}", this.authorMessage.author.username),
            description: `${title} \n\n\n Currently Viewing Result: **__${index + 1}__** | \`[${book.id}]\``,
            color: this.client.config.COLOR,
            thumbnail: {
                url: this.api.getImageURL(book.cover)
            },
            fields: [
                {
                    name: "Title",
                    value: `\`${book.title.pretty}\``
                },
                {
                    name: "Pages",
                    value: `\`${book.pages.length}\``
                },
                {
                    name: "Date Released",
                    value: `\`${moment(book.uploaded).format("On dddd, MMMM Do, YYYY h:mm A")}\``
                },
                {
                    name: `${book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name).length > 1 ? "Languages" : "Language"}`,
                    value: `\`${book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name).join("`, `") : "None"}\``
                },
                {
                    name: `${book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name).length > 1 ? "Artists" : "Artist"}`,
                    value: `\`${book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name).join("`, `") : "Not Provided"}\``
                },
                {
                    name: `${book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name).length > 1 ? "Characters" : "Character"}`,
                    value: `\`${book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name).join("`, `") : "Original"}\``
                },
                {
                    name: "Parody",
                    value: `\`${book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name).join("`, `") : "Not Provided"}\``
                },
                {
                    name: `${book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => tag.name).length > 1 ? "Tags" : "Tag"}`,
                    value: `\`${book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`).length !== 0 ? book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`).join("`, `") : "Not Provided"}\``
                }

            ],
            footer: {
                text: `⭐ ${book.favorites.toLocaleString()}`
            }
        } as EmbedOptions));

        this.embeds = embeds;

        const messageContent: AdvancedMessageContent = {
            embeds: [this.embeds[this.embed - 1]],
            components: [
                {
                    type: 1,
                    components: [
                        { style: 1, type: 2, custom_id: `first_result_${this.invoker.id}`, label: "First Result" },
                        { style: 2, type: 2, custom_id: `previous_result_${this.invoker.id}`, label: "Back" },
                        { style: 4, type: 2, custom_id: `kill_prop`, label: "Stop" },
                        { style: 2, type: 2, custom_id: `next_result_${this.invoker.id}`, label: "Next" },
                        { style: 1, type: 2, custom_id: `last_result_${this.invoker.id}`, label: "Last Result" }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { style: 1, type: 2, custom_id: `jumpto_result_${this.invoker.id}`, label: "Enter Result" },
                        { style: 1, type: 2, custom_id: `read_prop_${this.invoker.id}`, label: "Read" },
                        { style: 2, type: 2, custom_id: "bookmark_prop", label: "Bookmark" },
                        { style: 1, type: 2, custom_id: `show_book_cover_${this.invoker.id}`, label: "Show Cover" }
                    ]
                }
            ]
        };

        if (this.invoker.author.id === this.client.user.id) {
            this.message = await this.invoker.edit(messageContent);
        } else {
            this.message = await this.invoker.channel.createMessage(messageContent);
        }

        this.update();
    }

    update() {
        this.message.edit({
            embeds: [this.embeds[this.embed - 1]],
            components: [
                {
                    type: 1,
                    components: [
                        { style: 1, type: 2, custom_id: `first_result_${this.invoker.id}`, label: "First Result" },
                        { style: 2, type: 2, custom_id: `previous_result_${this.invoker.id}`, label: "Back" },
                        { style: 4, type: 2, custom_id: `kill_prop`, label: "Stop" },
                        { style: 2, type: 2, custom_id: `next_result_${this.invoker.id}`, label: "Next" },
                        { style: 1, type: 2, custom_id: `last_result_${this.invoker.id}`, label: "Last Result" }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { style: 1, type: 2, custom_id: `jumpto_result_${this.invoker.id}`, label: "Enter Result" },
                        { style: 1, type: 2, custom_id: `read_prop_${this.invoker.id}`, label: "Read" },
                        { style: 2, type: 2, custom_id: "bookmark_prop", label: "Bookmark" },
                        { style: 1, type: 2, custom_id: `show_book_cover_${this.invoker.id}`, label: "Show Cover" }
                    ]
                }
            ]
        });
    }

    run() {
        this.client.on("interactionCreate", async (interaction: ComponentInteraction<TextableChannel>) => {
            if (interaction.member.bot) return;

            let embed = new RichEmbed(interaction.message.embeds[0]);

            switch (interaction.data.custom_id) {
                case `see_detail_${this.authorMessage.id}`:
                    interaction.acknowledge();
                    this.init();
                    break;
                case `show_book_cover_${this.invoker.id}`:
                    const hideComponent: ActionRow[] = [
                        {
                            type: 1,
                            components: [
                                { style: 1, type: 2, custom_id: `first_result_${this.invoker.id}`, label: "First Result" },
                                { style: 2, type: 2, custom_id: `previous_result_${this.invoker.id}`, label: "Back" },
                                { style: 4, type: 2, custom_id: `kill_prop`, label: "Stop" },
                                { style: 2, type: 2, custom_id: `next_result_${this.invoker.id}`, label: "Next" },
                                { style: 1, type: 2, custom_id: `last_result_${this.invoker.id}`, label: "Last Result" }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                { style: 1, type: 2, custom_id: `jumpto_result_${this.invoker.id}`, label: "Enter Result" },
                                { style: 1, type: 2, custom_id: `read_prop_${this.invoker.id}`, label: "Read" },
                                { style: 2, type: 2, custom_id: "bookmark_prop", label: "Bookmark" },
                                { style: 1, type: 2, custom_id: `hide_book_cover_${this.invoker.id}`, label: "Hide Cover" }
                            ]
                        }
                    ]

                    embed.setImage(this.api.getImageURL((await this.api.getBook(parseInt(interaction.message.embeds[0].author.name))).cover));

                    interaction.acknowledge();
                    this.invoker.edit({ embed: embed, components: hideComponent });
                    break;
                case `hide_book_cover_${this.invoker.id}`:
                    const showComponent: ActionRow[] = [
                        {
                            type: 1,
                            components: [
                                { style: 1, type: 2, custom_id: `first_result_${this.invoker.id}`, label: "First Result" },
                                { style: 2, type: 2, custom_id: `previous_result_${this.invoker.id}`, label: "Back" },
                                { style: 4, type: 2, custom_id: `kill_prop`, label: "Stop" },
                                { style: 2, type: 2, custom_id: `next_result_${this.invoker.id}`, label: "Next" },
                                { style: 1, type: 2, custom_id: `last_result_${this.invoker.id}`, label: "Last Result" }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                { style: 1, type: 2, custom_id: `jumpto_result_${this.invoker.id}`, label: "Enter Result" },
                                { style: 1, type: 2, custom_id: `read_prop_${this.invoker.id}`, label: "Read" },
                                { style: 2, type: 2, custom_id: "bookmark_prop", label: "Bookmark" },
                                { style: 1, type: 2, custom_id: `show_book_cover_${this.invoker.id}`, label: "Show Cover" }
                            ]
                        }
                    ]

                    embed.setImage("");

                    interaction.acknowledge();
                    this.invoker.edit({ embed: embed, components: showComponent });
                    break;
                case `next_result_${this.invoker.id}`:
                    interaction.acknowledge();

                    if (this.embed < this.embeds.length) {
                        this.embed++;
                        this.update();
                    }
                    break;
                case `previous_result_${this.invoker.id}`:
                    interaction.acknowledge();

                    if (this.embed > 1) {
                        this.embed--;
                        this.update();
                    }
                    break;
                case `first_result_${this.invoker.id}`:
                    interaction.acknowledge();

                    this.embed = 1;
                    this.update();
                    break;
                case `last_result_${this.invoker.id}`:
                    interaction.acknowledge();

                    this.embed = this.embeds.length;
                    this.update();
                    break;
                case `jumpto_result_${this.invoker.id}`:
                    interaction.createMessage({
                        embeds: [
                            {
                                description: `This page has a total results of **${this.embeds.length}**, please enter the number result you want to jump. You only got **30 Seconds** before I ignore you.`,
                                color: this.client.config.COLOR
                            }
                        ],
                        flags: 64
                    });

                    const filter = (m: Message<TextableChannel>) => {
                        if (m.author.bot) return;
                        if (m.author.id !== interaction.member.id) return;
                        if (isNaN(parseInt(m.content))) {
                            m.delete();
                            interaction.createMessage({
                                embeds: [
                                    {
                                        description: "Please enter a valid number results!",
                                        color: this.client.config.COLOR
                                    }
                                ],
                                flags: 64
                            });
                            return false;
                        }
                        if (parseInt(m.content) > this.embeds.length) {
                            m.delete();
                            interaction.createMessage({
                                embeds: [
                                    {
                                        description: `This page only has **1-${this.embeds.length}** results, what'd you think?`,
                                        color: this.client.config.COLOR
                                    }
                                ],
                                flags: 64
                            });
                            return false;
                        }
                        if (parseInt(m.content) <= 0) {
                            m.delete();
                            interaction.createMessage({
                                embeds: [
                                    {
                                        description: `This page only has **1-${this.embeds.length}** results, what'd you think?`,
                                        color: this.client.config.COLOR
                                    }
                                ],
                                flags: 64
                            });
                            return false;
                        }
                        else return true;
                    }

                    const response = await this.client.awaitChannelMessages(interaction.channel, { timeout: 30000, count: 1, filter: filter });

                    if (response.message) {
                        response.message.delete();
                        this.embed = parseInt(response.message.content);
                        this.update();
                    } else {
                        return interaction.createMessage({
                            embeds: [
                                {
                                    description: "**30 Seconds** passed and I've not received any response from you... \n\n Click the **Enter Result** again to enter a valid result.",
                                    color: this.client.config.COLOR
                                }
                            ],
                            flags: 64
                        });
                    }
                    break;
                case `read_prop_${this.invoker.id}`:
                    interaction.acknowledge();

                    this.api.getBook(parseInt(this.embeds[this.embed - 1].author.name)).then(async (book) => {
                        const paginationEmbed = new ButtonNavigator(this.client, book, this.message, this.authorMessage);
                        await paginationEmbed.init();
                        paginationEmbed.run();
                    });
                    break;
            }
        });
    }
}

export async function createBookmarkButtonNavigator(client: Reader, books: Book[], message: Message<TextableChannel>, authorMessage?: Message<TextableChannel>) {
    const paginationEmbed = new BookmarkButtonNavigator(client, books, message, authorMessage);
    paginationEmbed.run();

    return Promise.resolve(paginationEmbed.message);
}

export async function createPaginationEmbed(client: Reader, book: Book, message: Message<TextableChannel>, authorMessage?: Message<TextableChannel>) {
    const paginationEmbed = new ButtonNavigator(client, book, message, authorMessage);
    paginationEmbed.run();

    return Promise.resolve(paginationEmbed.message);
}

export async function createSearchResultPaginationEmbed(client: Reader, search: Search, message: Message<TextableChannel>, authorMessage?: Message<TextableChannel>) {
    const paginationEmbed = new SearchDetailButtonNavigator(client, search, message, authorMessage);
    paginationEmbed.run();

    return Promise.resolve(paginationEmbed.message);
}
