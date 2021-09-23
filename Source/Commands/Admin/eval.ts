"use strict";

import { Command } from "../../Interfaces";
import { inspect } from "util";
import Logger from "../../Extensions/logger";

export const command: Command = {
    name: "eval",
    description: "Evaluate JavaScript/TypeScript Code",
    aliases: ["evaluate"],
    category: "Admin",
    adminOnly: true,
    run: async (client, message, args) => {
        try {
            const evaluated = inspect(eval(args.join(" ")), { depth: 0 });

            message.addReaction("✅");
            Logger.success("EVAL", "Code Successfully Evaluated!");
            console.log(evaluated);
        } catch (err) {
            message.addReaction("❎");
            Logger.error("EVAL", err);
        }
    }
}
