import { dummyVanX, registerEnv } from "mini-van-plate/shared";
import vanPlate from "mini-van-plate/van-plate";
import vanCore from "vanjs-core/debug";
import * as vanX from "vanjs-ext";

const vanXObject = { ...vanX, default: vanX };
const dummyObject = { ...dummyVanX, default: dummyVanX };

const setup = {
  isServer: typeof window === "undefined",
  get van() {
    return this.isServer ? vanPlate : vanCore;
  },
  get vanX() {
    return this.isServer ? dummyObject : vanXObject;
  },
};

registerEnv(setup);

export default setup;
