import { registerEnv, dummyVanX } from "mini-van-plate/shared";
import vanPlate from "mini-van-plate/van-plate";
import vanCore from "vanjs-core";
import * as vanX from "vanjs-ext";

const setup = {
  isServer: typeof window === "undefined",
  get van() { 
    return this.isServer ? vanPlate : vanCore;
  },
  get vanX() {
    return this.isServer ? dummyVanX : vanX;
  }
};

registerEnv(setup);

export default setup;
