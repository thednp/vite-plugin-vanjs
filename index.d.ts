import { Plugin } from 'vite';
import * as Van from 'vanjs-core';

declare function vanjsPlugin(): Plugin;
export default vanjsPlugin;

declare module 'vanjs/ssr' {
    export = Van;
}
