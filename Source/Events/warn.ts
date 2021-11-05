"use strict";

import { Event } from "../Interfaces";
import Logger from "../Extensions/logger";

export const event: Event = {
    name: "warn",
    run: async (client, message: string, id?: number) => {
        Logger.warn("WARNING", `ShardID: ${id || "N/A"} | ${message}`);
    }
}