import { ReaderClient } from "../Client";
import { ClientEvents } from "eris";

export interface IEventRun {
    (client: ReaderClient, ...args: any);
}

export interface IEvent {
    name: keyof ClientEvents;
    run: IEventRun;
}
