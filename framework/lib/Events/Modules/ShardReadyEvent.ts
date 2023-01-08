import { NReaderClient } from "../../Client";

export function shardReadyEvent(client: NReaderClient, id: number) {
    if (client.shards.get(id)) {
        client.logger.success({
            message: `Shard ${id} Has Connected!`,
            subTitle: "NReaderFramework::Events::ShardReady",
            title: "SHARD",
        });
    }
}
