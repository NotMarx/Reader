import { NReaderCommand, NReaderInterface } from "nreader-framework/lib";

export const command: NReaderInterface.ICommand = {
    name: "search-similar",
    description: "Search for similar NHentai doujin",
    nsfwOnly: true,
    options: [
        {
            name: "id",
            description: "The ID of the NHentai doujin",
            type: 4,
            required: true,
        }
    ],
    type: 1,
    run: (payload) => {
        return new NReaderCommand(payload).searchSimilarCommand();
    }
};
