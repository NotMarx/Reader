import {  NReaderCommand, NReaderInterface } from "nreader-framework/lib";

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
                    choices: [
                        {
                            name: "Bahasa Indonesia",
                            value: "id"
                        },
                        {
                            name: "English",
                            value: "en"
                        },
                        {
                            name: "Esperanto",
                            value: "eo"
                        },
                        {
                            name: "日本語",
                            value: "ja"
                        },
                        {
                            name: "中文",
                            value: "zh"
                        }
                    ]
                }
            ]
        }
    ],
    run: async (payload) => {
        return new NReaderCommand(payload).configCommand();
    }
};
