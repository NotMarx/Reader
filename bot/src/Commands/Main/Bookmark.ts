import { ReaderCommand, ReaderInterface } from "reader-framework";

export const command: ReaderInterface.ICommand = {
    name: "bookmark",
    description: "Check the user bookmark library",
    type: 1,
    nsfwOnly: true,
    options: [
        {
            name: "user",
            description: "The user to check",
            type: 6,
            required: false,
            /* @ts-ignore */
            channel_types: 0
        }
    ],
    run: async (payload) => {
        return new ReaderCommand(payload).bookmarkCommand();
    }
}
