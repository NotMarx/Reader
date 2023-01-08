import { NReaderEvent, NReaderInterface } from "nreader-framework/lib";

export const event: NReaderInterface.IEvent = {
    name: "shardReady",
    run: (client, id: number) => {
        return new NReaderEvent(client, id).shardReadyEvent();
    }
}
