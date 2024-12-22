import { dummyVanX } from "mini-van-plate/shared";
import vanPlate from "mini-van-plate/van-plate";
import vanCore from "vanjs-core";
import * as vanX from "vanjs-ext";

const vansSetup = {
  get isServer () { return typeof window === "undefined" },
  get van () { return this.isServer ? vanPlate : vanCore },
  get vanX () { return this.isServer ? dummyVanX : vanX },
}

export default vansSetup;
