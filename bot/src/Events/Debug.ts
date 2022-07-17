import { ReaderEvent, ReaderInterface } from "reader-framework";

export const event: ReaderInterface.IEvent = {
    name: "debug",
    run: async (client, message: string, id: number) => {
        return new ReaderEvent(client, message, id).debugEvent();
    }
}
