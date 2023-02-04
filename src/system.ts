import {TimeInfo} from "./time";

export interface System {
    tick(time:TimeInfo):void
}
