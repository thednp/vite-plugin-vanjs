import setup from "./index.mjs";

declare module "@vanjs/setup" {
    export default setup;
}
declare module "@vanjs/van" {
    import v from "vite-plugin-vanjs/setup";
    export default v.van;
}
declare module "@vanjs/vanX" {
    import v from "vite-plugin-vanjs/setup";
    export default v.vanX;
}
