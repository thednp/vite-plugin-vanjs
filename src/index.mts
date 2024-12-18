// import path from 'node:path';
// import process from "node:process";

export default function vanjsPlugin() {
  // let root = process.cwd();

  // const resolve = (p: string) => path.resolve(root, p);

  return {
    name: 'vanjs',
    enforce: 'pre',

    // config(userConfig: { root: string; }) {
    //   root = userConfig.root;
    // },

    resolveId(id: string) {
      // console.log('resolveId', {id, });
      if (id === 'vanjs') return id;
      // if (id.includes('vite-plugin-vanjs/jsx-')) {
        
      //   console.log({[id]: resolve(id)});
      //   // return null;
      //   return resolve(id);
      // }
      return null
    },

    load (id: string) {
      // console.log('load', {id});
      if (id === "vanjs") {
        return `// vanjs
import { dummyVanX } from "mini-van-plate/shared";
import vanPlate from "mini-van-plate/van-plate";
import vanCore from "vanjs-core";
import * as vanExt from "vanjs-ext";

const isServer = () => typeof window === "undefined";
const van = isServer() ? vanPlate : vanCore;
const vanX = isServer() ? dummyVanX : vanExt;

// console.log({van, vanX});

export { van, vanX };
`;
      }
      return null
    },
  };
}