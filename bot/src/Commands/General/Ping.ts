import { ReaderCommand, ReaderInterface } from "reader-framework";

export const command: ReaderInterface.ICommand = {
    description: "Ping the bot",
    name: "ping",
    type: 1,
    run: async (payload) => {
        return new ReaderCommand(payload).pingCommand();
    }
}
