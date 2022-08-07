import { NReaderCommand, NReaderInterface } from "nreader-framework";

export const command: NReaderInterface.ICommand = {
    name: "stats",
    description: "View the bot's statistics",
    type: 1,
    run: async (payload) => {
        return new NReaderCommand(payload).statsCommand();
    }
};
