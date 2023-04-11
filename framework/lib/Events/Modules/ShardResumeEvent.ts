import { NReaderClient } from "../../Client";

export function shardResumeEvent(client: NReaderClient, id: number) {
    if (client.shards.get(id)) {
        client.logger.success({
            message: `Shard ${id} Has Resumed!`,
            subTitle: "NReaderFramework::Events::ShardResume",
            title: "SHARD",
        });
    }
}
