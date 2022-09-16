import { NReaderClient } from "../../Client";
import { Guild } from "oceanic.js";

export function guildDeleteEvent(client: NReaderClient, guild: Guild) {
    client.logger.info({ message: `Guild ${guild.name} (${guild.id}) Has Left`, subTitle: "NReaderFramework::Events::GuildDelete", title: "GUILDS" });
}
