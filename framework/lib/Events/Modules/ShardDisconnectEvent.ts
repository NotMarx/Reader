import { NReaderClient } from "../../Client";

export function shardDisconnectEvent(
    client: NReaderClient,
    err: string,
    id: number
) {
    const shard = client.shards.get(id);

    if (shard && shard.status === "disconnected") {
        client.logger.error({
            message: err,
            subTitle: "NReaderFramework::Events::ShardDisconnect",
            title: `SHARD ${id}`,
        });

        shard.resume();
    }
}
