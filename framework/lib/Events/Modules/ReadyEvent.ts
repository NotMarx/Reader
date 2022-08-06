import { NReaderClient } from "../../Client";

export function readyEvent(client: NReaderClient) {
    if (client.ready) {
        client.logger.info({ message: `${client.user.username}#${client.user.discriminator} Is Online`, subTitle: "NReaderFramework::Events::Ready", title: "GATEWAY" });
    }
}
