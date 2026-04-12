/*!
* vite-plugin-vanjs VanX v0.2.0 (https://github.com/thednp/vite-plugin-vanjs#README)
* Copyright 2025-2026 © thednp
* Licensed under MIT (https://github.com/thednp/vite-plugin-vanjs/blob/master/LICENSE)
*/
import { calc, compact, list, noreactive, raw, reactive, replace, stateFields } from "vanjs-ext";
//#region src/setup/vanX.ts
const vanX = {
	calc,
	reactive,
	noreactive,
	stateFields,
	raw,
	list,
	replace,
	compact,
	get default() {
		return vanX;
	}
};
//#endregion
export { calc, compact, vanX as default, list, noreactive, raw, reactive, replace, stateFields };

//# sourceMappingURL=van-ext.mjs.map