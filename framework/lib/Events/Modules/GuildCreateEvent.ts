import { ReaderClient } from "../../Client";
import { Guild } from "eris";
import { GuildModel } from "../../Models";
import { IGuildSchemaSettings } from "../../Interfaces";

export async function guildCreateEvent(client: ReaderClient, guild: Guild) {
    const commands = client.commands.map((command) => command);
    const guildData = await GuildModel.findOne({ id: guild.id });

    if (guild) {
        client.logger.info({ message: `Guild ${guild.name} (${guild.id}) Has Joined`, subTitle: "ReaderFramework::Events::GuildCreate", title: "GUILDS" });

        if (!guildData) {
            GuildModel.create({
                createdAt: new Date(),
                id: guild.id,
                settings: ({
                    locale: "en"
                } as IGuildSchemaSettings)
            })
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
