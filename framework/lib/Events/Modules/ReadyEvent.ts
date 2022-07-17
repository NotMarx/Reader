import { ReaderClient } from "../../Client";
import { GuildModel } from "../../Models";

export function readyEvent(client: ReaderClient) {
    if (client.ready) {
        client.logger.info({ message: `${client.user.username}#${client.user.discriminator} Is Online`, subTitle: "ReaderFramework::Events::Ready", title: "GATEWAY" });
    }

    const guilds = client.guilds.map((guild) => guild.id);
    const commands = client.commands.map((command) => command);

    if (commands) {
        commands.forEach(async (command) => {
            for (let i = 0; i < guilds.length; i++) {
                const guildData = await GuildModel.findOne({ id: guilds[i] });

                if (!guildData) {
                    GuildModel.create({
                        createdAt: new Date(),
                        id: guilds[i],
                        settings: {
                            locale: "en"
                        }
                    });
                }

                client.createGuildCommand(guilds[i], {
                    description: command.description,
                    name: command.name,
                    options: command.options,
                    type: command.type
                } as any).catch(() => { });
            }
        });
    }


}
