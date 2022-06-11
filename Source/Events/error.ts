"use strict";

import { Event } from "../Interfaces";
import { Logger } from "../Extensions/logger";

export const event: Event = {
    name: "error",
    run: async (client, err: string, id?: number) => {
        client.logger.error({ message: err, subTitle: "Reader::Gateway::Error", title: `SHARD ${id ? id : "N/A"}` });
    }
};

process.on("unhandledRejection", (err: string) => {
    new Logger().error({ message: err, subTitle: "TypeScript::Error", title: "UNHANDLED REJECTION"});
});
