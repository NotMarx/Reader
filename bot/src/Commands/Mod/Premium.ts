import { NReaderCommand, NReaderInterface, NReaderOceanic } from "nreader-framework/lib";

export const command: NReaderInterface.ICommand = {
    name: "premium",
    description: "Manage premium users",
    adminOnly: true,
    type: 1,
    options: [
        {
            name: "user",
            description: "Manage a user",
            type: NReaderOceanic.Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [
                {
                    name: "user",
                    description: "The user to manage",
                    type: NReaderOceanic.Constants.ApplicationCommandOptionTypes.USER,
                    required: true
                },
                {
                    name: "premium",
                    description: "Whether to enable or disable the user's premium",
                    type: NReaderOceanic.Constants.ApplicationCommandOptionTypes.BOOLEAN,
                    required: true
                }
            ]

        },
        {
            name: "temporary",
            description: "Manage temporary premium for all users",
            type: NReaderOceanic.Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [
                {
                    name: "premium",
                    description: "Whether to enable or disable the user's temporary premium",
                    type: NReaderOceanic.Constants.ApplicationCommandOptionTypes.BOOLEAN,
                    required: true
                }
            ]
        }
    ],
    run: async (payload) => {
        return new NReaderCommand(payload).premiumCommand();
    }
};
