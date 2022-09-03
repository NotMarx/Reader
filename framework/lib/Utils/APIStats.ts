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
                    headers: {
                        "Authorization": authToken,
                        "Content-Type": "application/json",
                        "ServerCount": this.client.guilds.size,
                        "ShardCount": this.client.shards.size
                    },
                    method: "POST"
                });

                break;
            case "top.gg":
                break;
            default:
                this.client.logger.error({ message: "Invalid Bot List", subTitle: "NReaderFramework::APIStats::postStats", title: "ERROR" });

                break;
        }
    }
}
