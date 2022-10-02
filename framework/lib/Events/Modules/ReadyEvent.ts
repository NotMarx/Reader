import { NReaderClient } from "../../Client";

export function readyEvent(client: NReaderClient) {
    if (client.ready) {
        const commands = client.commands.map((command) => command);

        client.logger.success({
            message: `Loaded ${client.commands.size} Commands`,
            subTitle: "NReaderFramework::Collections::Commands",
            title: "COLLECTION",
        });

        client.logger.success({
            message: `Loaded ${client.events.size} Events`,
            subTitle: "NReaderFramework::Collections::Events",
            title: "COLLECTION",
        });

        if (commands) {
            commands
                .filter((command) => command.adminOnly !== true)
                .forEach((command) => {
                    client.application
                        .createGlobalCommand({
                            description: command.description,
                            name: command.name,
                            options: command.options,
                            type: command.type,
                        })
                        .catch(() => {});
                });

            commands
                .filter((command) => command.adminOnly === true)
                .forEach((command) => {
                    client.application
                        .createGuildCommand(client.config.BOT.GUILD, {
                            defaultMemberPermissions: "8",
                            description: command.description,
                            name: command.name,
                            options: command.options,
                            type: command.type,
                        })
                        .catch(() => {});
                });
        }

        if (client.config.LIST.ENABLED) {
            client.apiStats.postStats(
                "bhbotlist.tech",
                client.config.LIST.BHBOTLIST.AUTH
            );
            client.apiStats.postStats("top.gg", client.config.LIST.TOPGG.AUTH);
        }

        client.editStatus("dnd", [
            {
                name: "Reading...",
                type: 0,
            },
        ]);

        client.logger.info({
            message: `${client.user.username}#${client.user.discriminator} Is Online`,
            subTitle: "NReaderFramework::Events::Ready",
            title: "GATEWAY",
        });
    }
}
