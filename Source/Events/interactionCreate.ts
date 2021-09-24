"use strict";

import { Event } from "../Interfaces";
import { ActionRowComponents, ComponentInteraction, EmbedOptions, TextableChannel } from "eris";
import API from "../Extensions/API";
import ButtonNavigator from "../Extensions/ButtonNavigator/worker";

export const event: Event = {
    name: "interactionCreate",
    run: async (client, interaction: ComponentInteraction<TextableChannel>) => {
        if (interaction.type === 3 && interaction.data.component_type === 2) {
            switch (interaction.data.custom_id) {
                case "agree_privacy":
                    const agreeComponent: ActionRowComponents[] = [
                        {
                            type: 2,
                            custom_id: "agree_privacy",
                            label: "Agree",
                            style: 3,
                            disabled: true
                        },
                        {
                            type: 2,
                            custom_id: "disagree_policy",
                            label: "Disagree",
                            style: 4,
                            disabled: true
                        }
                    ];

                    const agreeEmbed: EmbedOptions = {
                        title: "First Experience [APPROVED]",
                        description: `You've agreed to the **Privacy Policy**! You may start using the commands. If you're completely new, type \`${client.database.fetch(`Database.${interaction.guildID}.Prefix`) || client.config.PREFIX}help\``,
                        color: client.config.COLOUR
                    }

                    client.createInteractionResponse(interaction.id, interaction.token, {
                        type: 7,
                        data: {
                            embeds: [agreeEmbed],
                            components: [
                                {
                                    type: 1,
                                    components: agreeComponent
                                }
                            ]
                        }
                    });
                    client.database.set(`Database.${interaction.member.id}.Experience`, true);
                    break;
                case "disagree_privacy":
                    const disagreeComponent: ActionRowComponents[] = [
                        {
                            type: 2,
                            custom_id: "agree_privacy",
                            label: "Agree",
                            style: 3,
                            disabled: true
                        },
                        {
                            type: 2,
                            custom_id: "disagree_policy",
                            label: "Disagree",
                            style: 4,
                            disabled: true
                        }
                    ];

                    const disagreeEmbed: EmbedOptions = {
                        title: "First Experience [DISAPPROVED]",
                        description: `You've **NOT** agree to the **Privacy Policy**! You're not permitted to use any commands unless you click **Agree**.`,
                        color: client.config.COLOUR
                    }

                    client.createInteractionResponse(interaction.id, interaction.token, {
                        type: 7,
                        data: {
                            embeds: [disagreeEmbed],
                            components: [
                                {
                                    type: 1,
                                    components: disagreeComponent
                                }
                            ]
                        }
                    });
                    client.database.set(`Database.${interaction.member.id}.Experience`, false);
                    break;
                case "read_prop":
                    const code: string = await client.database.fetch(`Database.${interaction.guildID}.${interaction.member.id}.Book`);

                    API.getCode(code).then(async (res) => {
                        const embeds: EmbedOptions[] = res.pages.map((url: string) => ({ title: res.title, image: { url: url }, thumbnail: { url: res.thumbnails[0] }, color: client.config.COLOUR, footer: { text: `Requested By: ${interaction.member.username}#${interaction.member.discriminator}` } } as EmbedOptions));
            
                        await ButtonNavigator(client, interaction, embeds, [
                            {
                                style: 1, 
                                type: 2,   
                                label: "Back",
                                custom_id: "previousPage"
                            },
                            {
                                style: 4,
                                type: 2,
                                label: "Stop",
                                custom_id: "stopPage"
                            },
                            {
                                style: 1,      
                                label: "Next",
                                type: 2,
                                custom_id: "nextPage"
                            }
                        ]);
                    });
                    break;
                case "kill_prop":
                    await client.database.delete(`Database.${interaction.guildID}.${interaction.member.id}.Book`);
                    await client.deleteMessage(interaction.channel.id, interaction.message.id).catch(() => { });
                    break;
            }
        }
    }
}
