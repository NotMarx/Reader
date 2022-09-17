import { NReaderClient } from "../../Client";

export function readyEvent(client: NReaderClient) {
    if (client.ready) {
        const commands = client.commands.map((command) => command);

        if (commands) {
            commands.forEach((command) => {
                client.rest.applicationCommands.createGlobalCommand(client.application.id, {
                    description: command.description,
                    name: command.name,
                    options: command.options,
                    type: command.type
                }).catch(() => { });
            });
        }

        if (client.config.LIST.ENABLED) {
            client.apiStats.postStats("bhbotlist.tech", client.config.LIST.BHBOTLIST.AUTH);
            client.apiStats.postStats("top.gg", client.config.LIST.TOPGG.AUTH);
        }

        client.editStatus("dnd", [{
            name: "Reading...",
            type: 0
        }]);

        client.logger.info({ message: `${client.user.username}#${client.user.discriminator} Is Online`, subTitle: "NReaderFramework::Events::Ready", title: "GATEWAY" });
    }
}
