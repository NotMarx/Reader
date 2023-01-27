import { NReaderCommand, NReaderInterface } from "nreader-framework/lib";

export const command: NReaderInterface.ICommand  = {
    name: "donate",
    description: "Donate to the bot",
    type: 1,
    run: async (payload) => {
        return new NReaderCommand(payload).donateCommand();
    }
};
