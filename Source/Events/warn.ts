"use strict";

import { Event } from "../Interfaces";
import Logger from "../Extensions/logger";

export const event: Event = {
    name: "warn",
    run: async (client, message: string, id?: number) => {
        Logger.warn("WARNING", `Shard ID: ${id || "N/A"} | ${message || "N/A"}`);
    }
};
