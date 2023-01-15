import { NReaderClient } from "../../Client";

export function shardDisconnectEvent(
    client: NReaderClient,
    err: string,
    id: number
) {
    if (client.shards.get(id)) {
        client.logger.error({
            message: err,
            subTitle: "NReaderFramework::Events::ShardDisconnect",
            title: `SHARD ${id}`,
        });
    }
}
