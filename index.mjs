import vanPlate from "mini-van-plate/van-plate";
import vanCore from "vanjs-core";

const isServer = () => typeof window === "undefined";

export { vanCore, vanPlate };

export default isServer() ? vanPlate : vanCore;
