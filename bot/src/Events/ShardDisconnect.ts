import { NReaderEvent, NReaderInterface } from "nreader-framework/lib";

export const event: NReaderInterface.IEvent = {
    name: "shardDisconnect",
    run: (client, err: string, id: number) => {
        return new NReaderEvent(client, err, id).shardDisconnectEvent();
    }
};
