"use strict";

import { Command } from "../../Interfaces";
import { inspect } from "util";
import { API } from "nhentai-api";

export const command: Command = {
    name: "eval",
    description: "Evaluate JavaScript/TypeScript Code",
    aliases: ["evaluate"],
    category: "Admin",
    adminOnly: true,
    run: async (client, message, args) => {
        const api = new API();

        try {
            const evaluated = inspect(eval(args.join(" ")), { depth: 0 });

            message.addReaction("✅");
            client.logger.system({ message: "Code Evaluated", subTitle: "Reader::Commands::Eval", title: "CODE EVAL" });
            console.log(evaluated);
        } catch (err) {
            message.addReaction("❎");
            client.logger.error({ message: err, subTitle: "Reader::Commands::Eval", title: "CODE EVAL"});
        }
    }
};
