import { dummyVanX, registerEnv } from "mini-van-plate/shared";

const vanX = {
  ...dummyVanX,
  get default() {
    return dummyVanX;
  },
};

registerEnv({ vanX });

export default vanX;
