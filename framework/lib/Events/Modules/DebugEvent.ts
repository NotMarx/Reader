import { NReaderClient } from "../../Client";

export function debugEvent(client: NReaderClient, message: string, id: number) {
    if (client.config.BOT.DEBUG) {
        return client.logger.log({ color: "#FFDD1C", message, subTitle: "NReaderFramework::Events::Debug", title: `SHARD ${id || "N/A"}`, type: "DEBUG" });
    }
}
