import { NReaderCommand, NReaderInterface } from "nreader-framework/lib";
import { Constants } from "oceanic.js";

export const command: NReaderInterface.ICommand = {
    name: "premium",
    description: "Manage premium users",
    adminOnly: true,
    type: 1,
    options: [
        {
            name: "user",
            description: "Manage a user",
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [
                {
                    name: "user",
                    description: "The user to manage",
                    type: Constants.ApplicationCommandOptionTypes.USER,
                    required: true
                },
                {
                    name: "premium",
                    description: "Whether to enable or disable the user's premium",
                    type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
                    required: true
                }
            ]

        },
        {
            name: "temporary",
            description: "Manage temporary premium for all users",
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [
                {
                    name: "premium",
                    description: "Whether to enable or disable the user's temporary premium",
                    type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
                    required: true
                }
            ]
        }
    ],
    run: async (payload) => {
        return new NReaderCommand(payload).premiumCommand();
    }
};
