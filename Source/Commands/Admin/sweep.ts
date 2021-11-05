"use strict";

import { Command } from "../../Interfaces";
import RichEmbed from "../../Extensions/embed";
import yargs from "yargs/yargs";

export const command: Command = {
    name: "sweep",
    description: "Clean up the whole messages",
    aliases: ["cleanup", "purge"],
    category: "Admin",
    adminOnly: true,
    run: async (client, message, args) => {
        const flag = await yargs(args.slice(0)).array(["limit"]).argv;
        const messageArray: string[] = (await client.getMessages(message.channel.id, { limit: flag.limit ? flag.limit[0] as number : 75 })).filter((m) => !m.pinned).map((m) => m.id);

        // Clean up the entire messages
        client.deleteMessages(message.channel.id, messageArray).then(() => {
            const embed = new RichEmbed()
                .setDescription(`Swept **${messageArray.length}** messages!`)
                .setColor(client.config.COLOR);

            return message.channel.createMessage({ embeds: [embed] }).then((m) => {
                setTimeout(() => {
                    m.delete();
                }, 2500);
            });
        });
    }
}
