declare module "vanjs" {
    import { type Van } from "vanjs-core";
    import * as vanExt from "vanjs-ext";
    export const van: Van;
    export const vanX: typeof vanExt;
}
