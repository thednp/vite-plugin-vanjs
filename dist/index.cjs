"use strict";const i=(t={})=>{const n=[...["src/entry-client","src/entry-server"],...t.entries||[]];return{name:"vanjs",enforce:"pre",transform(e,r){return!r||!n.some(s=>r.includes(s))?{code:e,map:null}:{code:`// vite-loader
// import v from "vite-plugin-vanjs/setup";
import v from "@vanjs/setup";
import { registerEnv } from "mini-van-plate/shared";
registerEnv(v);
${e}`,map:null}}}};module.exports=i;
//# sourceMappingURL=index.cjs.map
