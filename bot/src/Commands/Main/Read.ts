import { NReaderCommand, NReaderInterface } from "nreader-framework";

export const command: NReaderInterface.ICommand = {
    description: "Read a doujin from NHentai",
    name: "read",
    nsfwOnly: true,
    type: 1,
    options: [
        {
            name: "id",
            description: "The ID of the NHentai doujin",
            type: 4,
            required: true
        }
    ],
    run: async (payload) => {
        return new NReaderCommand(payload).readCommand();
    }
};
