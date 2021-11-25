"use strict";

import { Event } from "../Interfaces";
import Logger from "../Extensions/logger";

export const event: Event = {
    name: "ready",
    run: async (client) => {
        Logger.success(`DISCORD`, `${client.user.username} Has Connected!`);
    }
}
