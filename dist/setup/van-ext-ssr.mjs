/*!
* vite-plugin-vanjs VanX SSR v0.2.0 (https://github.com/thednp/vite-plugin-vanjs#README)
* Copyright 2025-2026 © thednp
* Licensed under MIT (https://github.com/thednp/vite-plugin-vanjs/blob/master/LICENSE)
*/
import { dummyVanX, registerEnv } from "mini-van-plate/shared";
//#region src/setup/vanX-ssr.ts
const { calc, compact, list, noreactive, raw, reactive, replace, stateFields } = dummyVanX;
const vanX = {
	calc,
	compact,
	list,
	noreactive,
	raw,
	reactive,
	replace,
	stateFields,
	get default() {
		return vanX;
	}
};
registerEnv({ vanX });
//#endregion
export { calc, compact, vanX as default, list, noreactive, raw, reactive, replace, stateFields };

//# sourceMappingURL=van-ext-ssr.mjs.map