import { NReaderEvent, NReaderInterface } from "nreader-framework/lib";

export const event: NReaderInterface.IEvent = {
    name: "ready",
    run: (client) => {
        return new NReaderEvent(client).readyEvent();
    }
};
