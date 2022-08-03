import { ReaderCommand, ReaderInterface } from "reader-framework";

export const command: ReaderInterface.ICommand = {
    name: "search",
    description: "Search for NHentai doujin",
    nsfwOnly: true,
    options: [
        {
            name: "query",
            description: "The title query of the doujin",
            type: 3,
            channel_types: 0,
            required: true
        },
        {
            name: "page",
            description: "Page of the results",
            type: 4,
            channel_types: 0
        }
    ],
    type: 1,
    run: (payload) => {
        return new ReaderCommand(payload).searchCommand();
    }
}