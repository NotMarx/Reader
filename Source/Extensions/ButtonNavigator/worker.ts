"use strict";

import { ComponentInteraction, EmbedOptions, TextableChannel, InteractionButton } from "eris";
import Reader from "../client";

export default async function ButtonNavigator(client: Reader, interaction: ComponentInteraction<TextableChannel>, embeds: EmbedOptions[], buttons: InteractionButton[]): Promise<void> {

    client.createInteractionResponse(interaction.id, interaction.token, {
        type: 7,
        data: {
            content: `Page 1 / ${embeds.length}`,
            components: [
                {
                    type: 1,
                    components: buttons
                }
            ],
            embeds: [embeds[0]]
        }
    });

    client.on("interactionCreate", async (interaction: ComponentInteraction<TextableChannel>) => {
        if (interaction.type === 3 && interaction.data.component_type === 2) {
            const fetchMsg = await client.getMessage(interaction.channel.id, interaction.message.id);

            let i: number = (fetchMsg.content.split("Page")[1].split("/")[0] as any) - 1;

            switch (interaction.data.custom_id) {
                case "previousPage":
                    i > 0 ? --i : embeds.length - 1;
                    break;
                case "nextPage":
                    i + 1 < embeds.length ? ++i : 0;
                    break;
                default:
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
}
