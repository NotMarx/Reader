"use strict";

import { AdvancedMessageContent, ComponentInteraction, EmbedOptions, Message, TextableChannel } from "eris";
import { API, Book, Search } from "nhentai-api";
import Reader from "../client";
import moment from "moment";

class ButtonNavigator {
    api: API;
    embeds: EmbedOptions[]
    embed: number;
    client: Reader
    book: Book;
    invoker: Message<TextableChannel>;
    message: Message<TextableChannel>;
    authorMessage: Message<TextableChannel>;
    constructor(client: Reader, book: Book, message: Message<TextableChannel>, authorMessage?: Message<TextableChannel>) {
        this.api = new API();
        this.authorMessage = authorMessage;
        this.book = book;
        this.client = client;
        this.embeds = book.pages.map((page) => ({ author: { name: `${book.id}`, url: `https://nhentai.net/g/${book.id}/`, icon_url: "https://cdn.discordapp.com/attachments/755253854819582114/894895960931590174/845298862184726538.png" }, title: book.title.pretty, image: { url: this.api.getImageURL(page) }, thumbnail: { url: this.api.getImageURL(book.cover) }, color: this.client.config.COLOUR, footer: { text: `Requested By: ${authorMessage.member.username}#${authorMessage.member.discriminator}` } } as EmbedOptions));;
        this.embed = 1;
        this.invoker = message;
    }

    async init() {
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

        if (this.invoker.author.id === this.invoker.channel.client.user.id) {
            this.message = await this.invoker.edit(messageContent);
        } else {
            this.message = await this.invoker.channel.createMessage(messageContent);
        }
    }

    update() {
        this.message.edit({
            content: `Page **${this.embed}** / **${this.embeds.length}**`,
            embed: this.embeds[this.embed - 1],
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

    run() {
        this.client.on("interactionCreate", async (interaction: ComponentInteraction<TextableChannel>) => {
            if (interaction.member.bot) return;

            switch (interaction.data.custom_id) {
                case `read_prop_${this.authorMessage.id}`:
                    interaction.acknowledge();
                    this.init();
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
                                color: this.client.config.COLOUR
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
                                        color: this.client.config.COLOUR
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
                                        color: this.client.config.COLOUR
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
                                        color: this.client.config.COLOUR
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
                                    color: this.client.config.COLOUR
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

    async init() {
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
            color: this.client.config.COLOUR,
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
                text: `⭐ ${book.favorites}`
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
                        { style: 2, type: 2, custom_id: "bookmark_prop", label: "Bookmark" }
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
                        { style: 2, type: 2, custom_id: "bookmark_prop", label: "Bookmark" }
                    ]
                }
            ]
        });
    }

    run() {
        this.client.on("interactionCreate", async (interaction: ComponentInteraction<TextableChannel>) => {
            if (interaction.member.bot) return;

            switch (interaction.data.custom_id) {
                case `see_detail_${this.authorMessage.id}`:
                    interaction.acknowledge();
                    this.init();
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
                                color: this.client.config.COLOUR,
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
                                    text: `⭐ ${book.favorites}`
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
                                color: this.client.config.COLOUR,
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
                                    text: `⭐ ${book.favorites}`
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
                            color: this.client.config.COLOUR,
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
                                text: `⭐ ${book.favorites}`
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
                            color: this.client.config.COLOUR,
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
                                text: `⭐ ${book.favorites}`
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
                                color: this.client.config.COLOUR
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
                                        color: this.client.config.COLOUR
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
                                        color: this.client.config.COLOUR
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
                                        color: this.client.config.COLOUR
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
                                color: this.client.config.COLOUR,
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
                                    text: `⭐ ${book.favorites}`
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
                                    color: this.client.config.COLOUR
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
                                color: this.client.config.COLOUR
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
                                        color: this.client.config.COLOUR
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
                                        color: this.client.config.COLOUR
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
                                        color: this.client.config.COLOUR
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
                                    color: this.client.config.COLOUR
                                }
                            ],
                            flags: 64
                        });
                    }
                    break;
                case `read_prop_${this.invoker.id}`:
                    this.api.getBook(parseInt(this.embeds[this.embed - 1].author.name)).then(async (book) => {
                        const paginationEmbed = new ButtonNavigator(this.client, book, this.message, this.authorMessage);
                        await paginationEmbed.init();
                        paginationEmbed.run();
                    });
            }
        });
    }
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
