"use strict";

import { Command } from "../../Interfaces";
import RichEmbed from "../../Extensions/embed";

export const command: Command = {
    name: "sweep",
    description: "Clean up the whole messages",
    aliases: ["cleanup", "purge"],
    category: "Admin",
    adminOnly: true,
    run: async (client, message, args) => {
        const messageArray: string[] = (await client.getMessages(message.channel.id, { limit: 75 })).map((m) => m.id);

        // Clean up the entire messages
        client.deleteMessages(message.channel.id, messageArray).then(() => {
            const embed = new RichEmbed()
                .setDescription(`Swept **${messageArray.length}** messages!`)
                .setColor(client.config.COLOUR);

            return message.channel.createMessage({ embeds: [embed] }).then((m) => {
                setTimeout(() => {
                    m.delete();
                }, 2500);
            });
        });
    }
}
