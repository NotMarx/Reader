import { NReaderClient } from "../../Client";
import { Guild } from "oceanic.js";
import { GuildModel } from "../../Models";
import { IGuildSchemaSettings } from "../../Interfaces";

export async function guildCreateEvent(client: NReaderClient, guild: Guild) {
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
    }
}
