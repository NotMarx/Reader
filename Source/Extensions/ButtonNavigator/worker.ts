"use strict";

import { AdvancedMessageContent, ComponentInteraction, EmbedOptions, Message, TextableChannel } from "eris";
import Reader from "../client";

class ButtonNavigator {
    client: Reader;
    embeds: EmbedOptions[];
    embed: number;
    invoker: Message<TextableChannel>;
    message: Message<TextableChannel>;
    constructor(client: Reader, message: Message<TextableChannel>, embeds: EmbedOptions[]) {
        this.client = client;
        this.embeds = embeds;
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
        this.message.channel.client.on("interactionCreate", async (interaction: ComponentInteraction<TextableChannel>) => {
                switch (interaction.data.custom_id) {
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
                            response.message.delete();
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
                }
        });
    }
}

export async function createPaginationEmbed(client: Reader, message: Message<TextableChannel>, embeds: EmbedOptions[]) {
    const paginationEmbed = new ButtonNavigator(client, message, embeds);
    await paginationEmbed.init();
    paginationEmbed.run();

    return Promise.resolve(paginationEmbed.message);
}
