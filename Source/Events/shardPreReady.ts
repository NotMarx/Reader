"use strict";

import { Event } from "../Interfaces";;

export const event: Event = {
    name: "shardPreReady",
    run: async (client, id?: number) => {
        const latency = client.shards.get(id).latency;

        client.shards.get(id).editStatus("dnd", { name: "Reading...", type: 0 });
        client.logger.log({ colour: "#FFA500", message: `Shard #${id + 1} Succesfully Connected In ${((( id + 1)  / client.shards.size) * 100).toFixed(1)}% With Ping ${latency === Infinity ? "N/A" : latency}ms`, subTitle: "Reader::Gateway::ShardPreReady", title: `SHARD ${id ?? "N/A"}`, type: "SYSTEM" });
    }
};
