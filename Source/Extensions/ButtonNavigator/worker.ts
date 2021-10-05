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
                        { style: 4, type: 2, custom_id: `destroy_page`, label: "Stop" },
                        { style: 1, type: 2, custom_id: `next_page_${this.invoker.id}`, label: "Next" },
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
                        { style: 4, type: 2, custom_id: `destroy_page`, label: "Stop" },
                        { style: 1, type: 2, custom_id: `next_page_${this.invoker.id}`, label: "Next" },
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
                    case `destroy_page`:
                        interaction.acknowledge();
                        this.message.delete();
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

/* "use strict";

import { ComponentInteraction, EmbedOptions, TextableChannel, InteractionButton } from "eris";
import Reader from "../client";

export default async function ButtonNavigator(client: Reader, interaction: ComponentInteraction<TextableChannel>, embeds: EmbedOptions[], buttons: InteractionButton[]): Promise<void> {

    interaction.editParent({
            content: `Page 1 / ${embeds.length}`,
            components: [
                {
                    type: 1,
                    components: buttons
                }
            ],
            embeds: [embeds[0]]
        });

    client.on("interactionCreate", async (interaction: ComponentInteraction<TextableChannel>) => {
        if (interaction.type === 3 && interaction.data.component_type === 2) {

            console.log(interaction.message);

            let i: number = await (interaction.message.content.split("Page")[1].split("/")[0] as any) - 1 // (fetchMsg.content.split("Page")[1].split("/")[0] as any) - 1;

            switch (interaction.data.custom_id) {
                case "previousPage":
                    i > 0 ? --i : embeds.length - 1;
                    break;
                case "nextPage":
                    i + 1 < embeds.length ? ++i : 0;
                    break;
                case "stopPage":
                    client.database.delete(`Database.${interaction.guildID}.${interaction.member.id}.BookEmbed`);
                    client.database.delete(`Database.${interaction.guildID}.${interaction.member.id}.Book`);
                    client.deleteMessage(interaction.channel.id, interaction.message.id).catch(() => { });
                    break;
            }

            client.createInteractionResponse(interaction.id, interaction.token, {
                type: 7,
                data: {
                    content: `Page ${i + 1} / ${embeds.length}`,
                    embeds: [embeds[i]],
                    components: [
                        {
                            type: 1,
                            components: buttons
                        }
                    ]
                }
            });
        }
    });
} */
 