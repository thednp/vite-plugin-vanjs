export default function VitePluginVanJS() {
  return {
    name: "vanjs",
    enforce: "pre",
    resolveId(id) {
      if (id === "vanjs/ssr") {
        return "\0vanjs/ssr";
      }
      return null;
    },
    load(id) {
      if (id === "\0vanjs/ssr") {
        return `// vite-plugin-vanjs
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
`;
      }
      return null;
    },
  };
}
