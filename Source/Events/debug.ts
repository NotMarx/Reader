"use strict";

import { Event } from "../Interfaces";

export const event: Event = {
    name: "debug",
    run: async (client, message: string, id: number) => {
        if (client.config.DEBUG_MODE) {
            return client.logger.log({ colour: "#FFDD1C", message, subTitle: "Reader::Gateway::Debug", title: `SHARD ${id ?? "N/A"}`, type: "ERIS" });
        } else {
            return;
        }
    }
};
