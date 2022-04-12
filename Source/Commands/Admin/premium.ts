import { Command } from "../../Interfaces";

export const command: Command = {
    name: "premium",
    aliases: [],
    description: "Configure Premium Stuff",
    category: "Admin",
    adminOnly: true,
    run: async (client, message, args) => {
        const user = message.member.guild.members.find((member) => member.id === args[1]) || message.member.guild.members.find((member) => member.username === args[1]) || message.mentions[0];
        const userIsPremium: boolean = client.database.fetch(`Database.${user.id}.Premium`);

        if (!args[0]) {
            return message.channel.createMessage({ content: "Please choose the correct option: `add`, `remove`", messageReference: { messageID: message.id } });
        }

        if (args[0] === "add") {
            if (!user) {
                return message.channel.createMessage({ content: "Cannot find that user, please try again!", messageReference: { messageID: message.id } });
            }

            if (userIsPremium) {
                return message.channel.createMessage({ content: `**${user.username}#${user.discriminator}** is already a Premium User!`, messageReference: { messageID: message.id } });
            } else {
                client.database.set(`Database.${user.id}.Premium`, true);
                return message.channel.createMessage({ content: `**${user.username}#${user.discriminator}** (\`${user.id}\`) is now a Premium User!`, messageReference: { messageID: message.id } });
            }
        }

        if (args[0] === "remove") {
            if (!user) {
                return message.channel.createMessage({ content: "Cannot find that user, please try again!", messageReference: { messageID: message.id } });
            }

            if (!userIsPremium) {
                return message.channel.createMessage({ content: `**${user.username}#${user.discriminator}** isn't a Premium User at first!`, messageReference: { messageID: message.id } });
            } else {
                client.database.set(`Database.${user.id}.Premium`, false);
            return message.channel.createMessage({ content: `**${user.username}** (\`${user.id}\`) is now a Normal User!`, messageReference: { messageID: message.id } });
            }
        }
    }
};
