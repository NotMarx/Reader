import { NReaderCommand, NReaderInterface, NReaderOceanic } from "nreader-framework/lib";

type TSubCommand = "history" | "view";

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
        },
        {
            name: "history",
            description: "Configure your profile history settings",
            type: NReaderOceanic.Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [
                {
                    name: "history",
                    description: "Enable or disable history",
                    type: NReaderOceanic.Constants.ApplicationCommandOptionTypes.BOOLEAN,
                    required: true
                }
            ]
        }
    ],
    type: NReaderOceanic.Constants.ApplicationCommandTypes.CHAT_INPUT,
    run: async (payload) => {
        const command = new NReaderCommand(payload);
        const subCommand = payload.interaction.data.options.getSubCommand()[0] as TSubCommand;

        switch (subCommand) {
            case "history":
                command.profileEditCommand();
                break;
            case "view":
                command.profileCommand();
                break;
        }
    }
};
