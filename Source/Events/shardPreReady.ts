"use strict";

import { Event } from "../Interfaces";
import Logger from "../Extensions/logger";

export const event: Event = {
    name: "shardPreReady",
    run: async (client, id?: number) => {
        const latency = client.shards.get(id).latency;

        client.shards.get(id).editStatus("dnd", { name: "Reading...", type: 0 });
        Logger.log(`SHARD READY | ID: ${id}`, `Shard #${id+ 1} Successfully Connected In ${(((id + 1) / client.shards.size) * 100).toFixed(1)}% With Ping: ${latency === Infinity ? "N/A" : latency}ms`, "#FFA500");
    }
};
