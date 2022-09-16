import { NReaderClient } from "../Client";
import { ClientEvents } from "oceanic.js";

export interface IEventRun {
    (client: NReaderClient, ...args: any);
}

export interface IEvent {
    name: keyof ClientEvents;
    run: IEventRun;
}
