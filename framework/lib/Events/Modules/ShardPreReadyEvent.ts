import { NReaderClient } from "../../Client";

export function shardPreReadyEvent(client: NReaderClient, id: number) {
    if (client.shards.get(id)) {
        client.logger.system({
            message: `Shard ${id} Is Processing...`,
            subTitle: "NReaderFramework::Events::ShardPreReady",
            title: "SHARD",
        });
    }
}
