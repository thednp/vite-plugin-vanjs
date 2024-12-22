// import setup from "./index.mjs";
// export * from "./global";

import { dummyVanX } from "mini-van-plate/shared";
import vanPlate from "mini-van-plate/van-plate";
import vanCore from "vanjs-core";
import * as vanX from "vanjs-ext";

type VansSetup = {
    isServer: boolean,
    van: typeof vanPlate & typeof vanCore,
    vanX: typeof dummyVanX | typeof vanX,
}

export declare module "@vanjs/setup" {
    export default VansSetup;
}
export declare module "@vanjs/van" {
    import v from "vite-plugin-vanjs/setup";
    export default v.van;
}
export declare module "@vanjs/vanX" {
    import v from "vite-plugin-vanjs/setup";
    export default v.vanX;
}

export default VansSetup;
