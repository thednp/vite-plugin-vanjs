import { Plugin } from 'vite';
import * as Van from 'vanjs-core';

declare function vanjsPlugin(): Plugin;
export default vanjsPlugin;

export { Van };