import { ReaderEvent, ReaderInterface } from "reader-framework";

export const event: ReaderInterface.IEvent = {
    name: "error",
    run: (client, err: string, id: number) => {
        return new ReaderEvent(client, err, id).errorEvent();
    }
}

process.on("unhandledRejection", (err: string) => {
    return new ReaderEvent(null, err).tsError();
});
