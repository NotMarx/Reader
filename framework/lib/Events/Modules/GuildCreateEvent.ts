import { NReaderClient } from "../../Client";
import { Guild } from "eris";
import { GuildModel } from "../../Models";
import { IGuildSchemaSettings } from "../../Interfaces";

export async function guildCreateEvent(client: NReaderClient, guild: Guild) {
    const commands = client.commands.map((command) => command);
    const guildData = await GuildModel.findOne({ id: guild.id });

    if (guild) {
        if (client.config.LIST.ENABLED) {
            client.apiStats.postStats("bhbotlist.tech", client.config.LIST.BHBOTLIST.AUTH);
            client.apiStats.postStats("top.gg", client.config.LIST.TOPGG.AUTH);
        }

        client.logger.info({ message: `Guild ${guild.name} (${guild.id}) Has Joined`, subTitle: "NReaderFramework::Events::GuildCreate", title: "GUILDS" });

        if (!guildData) {
            GuildModel.create({
                createdAt: new Date(),
                id: guild.id,
                settings: ({
                    blacklisted: false,
                    locale: "en",
                    whitelisted: false
                } as IGuildSchemaSettings)
            });
        }

        commands.forEach((command) => {
            client.createGuildCommand(guild.id, {
                description: command.description,
                name: command.name,
                options: command.options,
                type: command.type
            }).catch(() => { });
        });
    }
}
