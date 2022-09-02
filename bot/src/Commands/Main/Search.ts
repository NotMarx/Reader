import { NReaderCommand, NReaderInterface } from "nreader-framework";

export const command: NReaderInterface.ICommand = {
    name: "search",
    description: "Search for NHentai doujin",
    nsfwOnly: true,
    options: [
        {
            name: "query",
            description: "The title query of the doujin",
            type: 3,
            required: true
        },
        {
            name: "page",
            description: "Page of the results",
            type: 4,
        },
        {
            name: "sort",
            description: "Sort results based on the sort mode",
            type: 3,
            /* @ts-ignore */
            choices: [
                {
                    name: "Popular All Time",
                    value: "popular"
                },
                {
                    name: "Popular Today",
                    value: "popular-today"
                },
                {
                    name: "Popular This Week",
                    value: "popular-week"
                },
                {
                    name: "Popular This Month",
                    value: "popular-month"
                }
            ]
        }
    ],
    type: 1,
    run: (payload) => {
        return new NReaderCommand(payload).searchCommand();
    }
};
