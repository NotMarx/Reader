import { NReaderEvent, NReaderInterface } from "nreader-framework";

export const event: NReaderInterface.IEvent = {
    name: "error",
    run: (client, err: string, id: number) => {
        return new NReaderEvent<string, number, any, any>(client, err, id).errorEvent();
    }
};

process.on("unhandledRejection", (err: string) => {
    return new NReaderEvent<string, any, any, any>(null, err).tsError();
});
