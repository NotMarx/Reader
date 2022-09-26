import { NReaderCommand, NReaderInterface, NReaderOceanic } from "nreader-framework/lib";

export const command: NReaderInterface.ICommand = {
    name: "search",
    description: "Search for NHentai doujins",
    nsfwOnly: true,
    options: [
        {
            name: "query",
            description: "Search doujins by the query",
            type: NReaderOceanic.Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [

                {
                    name: "query",
                    description: "The title query",
                    type: NReaderOceanic.Constants.ApplicationCommandOptionTypes.STRING,
                    required: true
                },
                {
                    name: "page",
                    description: "Page of the results",
                    type: NReaderOceanic.Constants.ApplicationCommandOptionTypes.INTEGER,
                },
                {
                    name: "sort",
                    description: "Sort results based on the sort mode",
                    type: NReaderOceanic.Constants.ApplicationCommandOptionTypes.STRING,
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
            ]
        },
        {
            name: "similar",
            description: "Search for similar doujins",
            type: NReaderOceanic.Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [
                {
                    name: "id",
                    description: "The ID of the doujin",
                    type: NReaderOceanic.Constants.ApplicationCommandOptionTypes.INTEGER,
                    required: true
                }
            ]
        }
    ],
    type: 1,
    run: (payload) => {
        const command = new NReaderCommand(payload);
        const interaction = payload.interaction;
        const query = interaction.data.options.getString("query");
        const id = interaction.data.options.getInteger("id");

        if (query) {
            return command.searchCommand();
        }

        if (id) {
            return command.searchSimilarCommand();
        }
    }
};
