import { NReaderCommand, NReaderInterface } from "nreader-framework/lib";

export const command: NReaderInterface.ICommand = {
    description: "Display the help menu",
    name: "help",
    type: 1,
    run: async (payload) => {
        return new NReaderCommand(payload).helpCommand();
    }
};
