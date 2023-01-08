import { NReaderClient } from "../../Client";

export function shardDisconnectEvent(
    client: NReaderClient,
    err: Error,
    id: number
) {
    if (client.shards.get(id)) {
        client.logger.error({
            message: err.message,
            subTitle: "NReaderFramework::Events::ShardDisconnect",
            title: `SHARD ${id}`,
        });
    }
}
