import { NReaderCommand, NReaderInterface, NReaderOceanic } from "nreader-framework/lib";

export const command: NReaderInterface.ICommand = {
    name: "profile",
    description: "Check a user's profile",
    options: [
        {
            name: "view",
            description: "View a user's profile",
            type: NReaderOceanic.Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [
                {
                    name: "user",
                    description: "The user to view",
                    type: NReaderOceanic.Constants.ApplicationCommandOptionTypes.USER,
                    required: false
                }
            ]
        }
    ],
    type: NReaderOceanic.Constants.ApplicationCommandTypes.CHAT_INPUT,
    run: async (payload) => {
        return new NReaderCommand(payload).profileCommand();
    }
}
