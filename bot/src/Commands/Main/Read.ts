import { ReaderCommand, ReaderInterface } from "reader-framework";

export const command: ReaderInterface.ICommand = {
    description: "Read a doujin from NHentai",
    name: "read",
    type: 1,
    options: [
        {
            name: "id",
            description: "The ID of the NHentai doujin",
            type: 4,
            channel_types: 0,
            required: true
        }
    ],
    run: async (payload) => {
        return new ReaderCommand(payload).readCommand();
    }
}
