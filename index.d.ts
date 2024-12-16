import { type Plugin } from 'vite';
// import { type Van } from "vanjs-core";
import van from "vanjs-core";

// declare module "vanjs/ssr" {
//     export default Van;
// }

declare module 'vanjs/ssr' {
    export default van;

    // Add any necessary declarations for the vanjs/ssr module here
}

declare global {
    export const van = "vanjs/ssr"; // Or specify the correct type if known
}

declare function vanjsPlugin(): Plugin;
export default vanjsPlugin;