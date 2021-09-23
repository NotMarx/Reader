"use strict";

import { Event } from "../Interfaces";
import Logger from "../Extensions/logger";

export const event: Event = {
    name: "shardPreReady",
    run: async (client, id?: number) => {
        const latency = client.shards.get(id).latency;

        Logger.log(`SHARD READY | ID: ${id}`, `Shard #${id+ 1} Successfully Connected In ${(((id + 1) / client.shards.size) * 100).toFixed(1)}% With Ping: ${latency}ms`, "#FFA500");
    }
}
