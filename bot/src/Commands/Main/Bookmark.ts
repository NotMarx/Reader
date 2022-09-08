import { NReaderCommand, NReaderInterface } from "nreader-framework";

export const command: NReaderInterface.ICommand = {
    name: "bookmark",
    description: "Check the user bookmark library",
    type: 1,
    nsfwOnly: true,
    options: [
        {
            name: "user",
            description: "The user to check",
            type: 6,
            required: false
        }
    ],
    run: async (payload) => {
        return new NReaderCommand(payload).bookmarkCommand();
    }
};
