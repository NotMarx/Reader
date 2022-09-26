import { NReaderConstant } from "../Constant";
import { NReaderClient } from "../Client";
import { TBotList } from "../Types/TBotList";
import fetch from "node-fetch";

export class APIStats {
    client: NReaderClient;

    constructor(client: NReaderClient) {
        this.client = client;
    }

    public async postStats(botList: TBotList, authToken: string) {
        switch (botList) {
            case "bhbotlist.tech":
                fetch(NReaderConstant.BHBotList.STATS(), {
                    // @ts-ignore
                    headers: {
                        Authorization: authToken,
                        "Content-Type": "application/json",
                        ServerCount: this.client.guilds.size,
                        ShardCount: this.client.shards.size,
                    },
                    method: "POST",
                });

                break;
            case "top.gg":
                fetch(NReaderConstant.TopGG.STATS(this.client.user.id), {
                    body: JSON.stringify({
                        server_count: this.client.guilds.size,
                        shard_count: this.client.shards.size,
                    }),
                    headers: {
                        Authorization: authToken,
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                });

                break;
            default:
                this.client.logger.error({
                    message: "Invalid Bot List",
                    subTitle: "NReaderFramework::APIStats::postStats",
                    title: "ERROR",
                });

                break;
        }
    }
}
