"use strict";

import { Event } from "../Interfaces";

export const event: Event = {
    name: "warn",
    run: async (client, message: string, id?: number) => {
        client.logger.warn({ message, subTitle: "Reader::Gateway::Warn", title: `SHARD ${id ? id : "N/A"}` });
    }
};
