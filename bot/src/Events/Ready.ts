import { ReaderEvent, ReaderInterface } from "reader-framework";

export const event: ReaderInterface.IEvent = {
    name: "ready",
    run: (client) => {
        return new ReaderEvent(client).readyEvent();
    }
}
