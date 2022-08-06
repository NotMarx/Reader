import {  NReaderCommand, NReaderInterface } from "nreader-framework";

export const command: NReaderInterface.ICommand = {
    name: "config",
    description: "Configure the bot settings",
    guildModOnly: true,
    type: 1,
    options: [
        {
            name: "language",
            description: "Configure the language used in this guild",
            type: 1,
            options: [
                {
                    name: "language",
                    description: "The language to set",
                    type: 3,
                    required: true,
                    /* @ts-ignore */
                    choices: [
                        {
                            name: "English",
                            value: "en"
                        },
                        {
                            name: "Japanese",
                            value: "ja"
                        }
                    ]
                }
            ]
        }
    ],
    run: async (payload) => {
        return new NReaderCommand(payload).configCommand();
    }
}
