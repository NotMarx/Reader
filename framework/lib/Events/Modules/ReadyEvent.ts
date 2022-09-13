import { NReaderClient } from "../../Client";

export function readyEvent(client: NReaderClient) {
    if (client.ready) {
        if (client.config.LIST.ENABLED) {
            client.apiStats.postStats("bhbotlist.tech", client.config.LIST.BHBOTLIST.AUTH);
            client.apiStats.postStats("top.gg", client.config.LIST.TOPGG.AUTH);
        }

        client.logger.info({ message: `${client.user.username}#${client.user.discriminator} Is Online`, subTitle: "NReaderFramework::Events::Ready", title: "GATEWAY" });
    }
}
