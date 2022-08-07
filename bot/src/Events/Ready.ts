import { NReaderEvent, NReaderInterface } from "nreader-framework";

export const event: NReaderInterface.IEvent = {
    name: "ready",
    run: (client) => {
        return new NReaderEvent(client).readyEvent();
    }
};
