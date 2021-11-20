"use strict";

import { Event } from "../Interfaces";
import Logger from "../Extensions/logger";

export const event: Event = {
    name: "error",
    run: async (client, err: string, id?: number) => {
        Logger.error("ERROR", `Shard ID: ${id || "N/A"} | ${err}`);
    }
}

process.on("unhandledRejection", (err: string) => {
    Logger.error("ERROR", err);
});
