/// <reference path="global.d.ts" />

import { dummyVanX } from "mini-van-plate/shared";
import vanPlate from "mini-van-plate/van-plate";
import vanCore from "vanjs-core";
import * as vanX from "vanjs-ext";

type VansSetup = {
    isServer: boolean,
    van: typeof vanPlate & typeof vanCore,
    vanX: typeof dummyVanX | typeof vanX,
}

export default VansSetup;
