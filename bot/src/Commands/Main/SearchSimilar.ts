import { ReaderCommand, ReaderInterface } from "reader-framework";

export const command: ReaderInterface.ICommand = {
    name: "search-similar",
    description: "Search for similar NHentai doujin",
    options: [
        {
            name: "id",
            description: "The ID of the NHentai doujin",
            type: 4,
            required: true,
            channel_types: 0
        }
    ],
    type: 1,
    run: (payload) => {
        return new ReaderCommand(payload).searchSimilarCommand();
    }
}
