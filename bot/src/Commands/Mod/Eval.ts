import { NReaderCommand, NReaderInterface } from "nreader-framework/lib";

export const command: NReaderInterface.ICommand = {
    name: "eval",
    description: "Evaluate a code",
    adminOnly: true,
    type: 1,
    options: [
        {
            name: "code",
            description: "The code to evaluate",
            type: 3,
            required: true
        }
    ],
    run: async (payload) => {
        return new NReaderCommand(payload).evalCommand();
    }
};
