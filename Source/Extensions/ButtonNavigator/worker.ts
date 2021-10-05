"use strict";

import { AdvancedMessageContent, ComponentInteraction, EmbedOptions, Message, TextableChannel } from "eris";

class ButtonNavigator {
    embeds: EmbedOptions[];
    embed: number;
    invoker: Message<TextableChannel>;
    message: Message<TextableChannel>;
    constructor(message: Message<TextableChannel>, embeds: EmbedOptions[]) {
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
                        { style: 1, type: 2, custom_id: `previous_page_${this.invoker.id}`, label: "Back" },
                        { style: 4, type: 2, custom_id: `kill_prop`, label: "Stop" },
                        { style: 1, type: 2, custom_id: `next_page_${this.invoker.id}`, label: "Next" },
                    ]
                },
                {
                    type: 1,
                    components: [
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
                        { style: 1, type: 2, custom_id: `previous_page_${this.invoker.id}`, label: "Back" },
                        { style: 4, type: 2, custom_id: `kill_prop`, label: "Stop" },
                        { style: 1, type: 2, custom_id: `next_page_${this.invoker.id}`, label: "Next" },
                    ]
                },
                {
                    type: 1,
                    components: [
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
                }
        });
    }
}

export default async function createPaginationEmbed(message: Message<TextableChannel>, embeds: EmbedOptions[]) {
    const paginationEmbed = new ButtonNavigator(message, embeds);
    await paginationEmbed.init();
    paginationEmbed.run();

    return Promise.resolve(paginationEmbed.message);
}
