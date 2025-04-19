import { dummyVanX, registerEnv } from "mini-van-plate/shared";

const vanX = {
  ...dummyVanX,
  get default() {
    return vanX;
  },
};

registerEnv({ vanX });

export default vanX;
