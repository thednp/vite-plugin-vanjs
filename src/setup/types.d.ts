import { dummyVanX } from "mini-van-plate/shared";
import vanPlate from "mini-van-plate/van-plate";
import vanCore from "vanjs-core";
import * as vanX from "vanjs-ext";

// I think we need a separate set of aliases for test purposes, we must ignore setup/setup.ts or similar. we removed it
type VansSetup = {
  isServer: boolean;
  van: typeof vanPlate & typeof vanCore;
  vanX: typeof dummyVanX | typeof vanX;
};

export default VansSetup;
