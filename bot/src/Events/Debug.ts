import { NReaderEvent, NReaderInterface } from "nreader-framework";

export const event: NReaderInterface.IEvent = {
    name: "debug",
    run: async (client, message: string, id: number) => {
        return new NReaderEvent<string, number, any, any>(client, message, id).debugEvent();
    }
};
