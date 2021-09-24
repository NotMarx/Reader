"use strict";

import { Command } from "../../Interfaces";

export const command: Command = {
    name: "sweep",
    description: "Clean up the whole messages",
    aliases: ["cleanup", "purge"],
    category: "Admin",
    adminOnly: true,
    run: async (client, message, args) => {
        const messageArray: string[] = (await client.getMessages(message.channel.id)).map((m) => m.id);

        // Clean up the entire messages
        client.deleteMessages(message.channel.id, messageArray).then(() => {
            return message.channel.createMessage({ content: "Content Cleaned!" }).then((m) => {
                setTimeout(() => {
                    m.delete();
                }, 2500);
            });
        });
    }
}
