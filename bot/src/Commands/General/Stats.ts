import { ReaderCommand, ReaderInterface } from "reader-framework";

export const command: ReaderInterface.ICommand = {
    name: "stats",
    description: "View the bot's statistics",
    type: 1,
    run: async (payload) => {
        return new ReaderCommand(payload).statsCommand();
    }
}
