function n() {
  return {
    name: "vanjs",
    enforce: "pre",
    resolveId(e) {
      return e === "vanjs/ssr" ? "\0vanjs/ssr" : null;
    },
    load(e) {
      return e === "\0vanjs/ssr" ? `// vite-plugin-vanjs
import vanPlate from "mini-van-plate/van-plate";
import vanCore from "vanjs-core";

const isServer = () => typeof window === "undefined";
const getVanJS = () => {
  if (isServer()) {
    return vanPlate;
  } else {
    return vanCore;
  }
};

export default getVanJS();
` : null;
    }
  };
}
export {
  n as default
};
//# sourceMappingURL=index.mjs.map
