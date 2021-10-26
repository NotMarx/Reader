"use strict";

import { Event } from "../Interfaces";
import Logger from "../Extensions/logger";

export const event: Event = {
    name: "ready",
    run: async (client) => {
        client.editStatus("dnd", { name: "Reading...", type: 0 });
        Logger.success(`DISCORD`, `${client.user.username} Has Connected!`);
    }
}
