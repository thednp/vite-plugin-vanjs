import { type Plugin } from 'vite';
import { type Van } from "vanjs-core";

declare module "vanjs/ssr" {
    export default Van;
}

declare function vanjsPlugin(): Plugin;
export default vanjsPlugin;