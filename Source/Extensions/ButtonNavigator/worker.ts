"use strict";

import { AdvancedMessageContent, ComponentInteraction, EmbedOptions, Message, TextableChannel } from "eris";
import { API, Book } from "nhentai-api";
import Reader from "../client";

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
        this.embeds = book.pages.map((page) => ({ author: { name: `${book.id}`, url: `https://nhentai.net/g/${book.id}/`, icon_url: "https://cdn.discordapp.com/attachments/755253854819582114/894895960931590174/845298862184726538.png" }, title: book.title.pretty, image: { url: this.api.getImageURL(page) }, thumbnail: { url: this.api.getImageURL(book.cover) }, color: this.client.config.COLOUR, footer: { text: `Requested By: ${message.member.username}#${message.member.discriminator}` } } as EmbedOptions));;
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
                        { style: 1, type: 2, custom_id: `previous_page_${this.invoker.id}`, label: "Back" },
                        { style: 4, type: 2, custom_id: `kill_prop`, label: "Stop" },
                        { style: 1, type: 2, custom_id: `next_page_${this.invoker.id}`, label: "Next" },
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
                        { style: 1, type: 2, custom_id: `previous_page_${this.invoker.id}`, label: "Back" },
                        { style: 4, type: 2, custom_id: `kill_prop`, label: "Stop" },
                        { style: 1, type: 2, custom_id: `next_page_${this.invoker.id}`, label: "Next" },
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
                                    description: `This doujin has a total pages **${this.embeds.length}**, please enter the number page you want to jump. You only got **30 Seconds** before I ignore you.`,
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

export async function createPaginationEmbed(client: Reader, book: Book, message: Message<TextableChannel>, authorMessage?: Message<TextableChannel>) {
    const paginationEmbed = new ButtonNavigator(client, book, message, authorMessage);
    paginationEmbed.run();

    return Promise.resolve(paginationEmbed.message);
}
