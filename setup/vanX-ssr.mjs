import { dummyVanX, registerEnv } from "mini-van-plate/shared";

const vanX = { ...dummyVanX, default: dummyVanX };
registerEnv({ vanX });

export default vanX;
