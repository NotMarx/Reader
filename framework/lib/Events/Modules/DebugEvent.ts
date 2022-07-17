import { ReaderClient } from "../../Client";

export function debugEvent(client: ReaderClient, message: string, id: number) {
    if (client.config.BOT.DEBUG) {
        return client.logger.log({ color: "#FFDD1C", message, subTitle: "ReaderFramework::Events::Debug", title: `SHARD ${id || "N/A"}`, type: "DEBUG" });
    }
}
