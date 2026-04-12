/*!
* vite-plugin-vanjs Core SSR v0.2.0 (https://github.com/thednp/vite-plugin-vanjs#README)
* Copyright 2025-2026 © thednp
* Licensed under MIT (https://github.com/thednp/vite-plugin-vanjs/blob/master/LICENSE)
*/
import { ChildDom, State, StateView } from "vanjs-core";
import { Properties, PropertiesHyphen, SvgProperties, SvgPropertiesHyphen } from "csstype";
import { ResolvedConfig } from "vite";

//#region src/server/types.d.ts
// FILE SYSTEM ROUTER
type PageFile = {
  path: string;
  routePath: string;
};
type LayoutFile = {
  id: string;
  path: string;
};
type RouteFile = PageFile & {
  layouts: Array<LayoutFile>;
};
type PluginConfig = {
  routesDir: string;
  extensions: string[];
};
//#endregion
//#region src/types/global.d.ts
declare module "virtual:@vanjs/routes" {}
declare module "@vanjs/van" {
  import type { Van } from "vanjs-core";
  const van: Van;
  export default van;
}
declare module "@vanjs/vanX" {
  import { calc, compact, list, noreactive, raw, reactive, replace, stateFields } from "vanjs-ext";
  import type { VanXObj } from "mini-van-plate/shared"; // Define the vanX object type
  interface VanXObject {
    calc: typeof calc;
    reactive: typeof reactive;
    noreactive: typeof noreactive;
    stateFields: typeof stateFields;
    raw: typeof raw;
    list: typeof list;
    replace: typeof replace;
    compact: typeof compact;
    readonly default: VanXObject;
  }
  interface VanXPlate extends VanXObj {
    readonly default: VanXObj;
  }
  const vanX: VanXObject | VanXPlate;
  export default vanX;
}
declare module "@vanjs/server" {
  export type * from "vite-plugin-vanjs/server";
  export * from "vite-plugin-vanjs/server";
}
declare module "@vanjs/router" {
  export type * from "vite-plugin-vanjs/router";
  export * from "vite-plugin-vanjs/router";
}
declare module "@vanjs/meta" {
  export type * from "vite-plugin-vanjs/meta";
  export * from "vite-plugin-vanjs/meta";
}
declare module "@vanjs/jsx" {
  export type * from "vite-plugin-vanjs";
  export * from "vite-plugin-vanjs/jsx-runtime";
}
declare module "@vanjs/jsx/jsx-runtime" {
  export type * from "vite-plugin-vanjs/jsx-runtime";
  export * from "vite-plugin-vanjs/jsx-runtime";
}
declare module "@vanjs/jsx/jsx-dev-runtime" {
  export type * from "vite-plugin-vanjs/jsx-dev-runtime";
  export * from "vite-plugin-vanjs/jsx-dev-runtime";
}
declare module "@vanjs/client" {
  export * from "vite-plugin-vanjs/client";
  export type * from "vite-plugin-vanjs/client";
}
//#endregion
//#region src/types/types.d.ts
type Accessor<T> = () => T;
type StateMaybe<T = unknown> = Accessor<T> | StateView<T> | T | undefined;
type DOMElement = HTMLElement | SVGElement;
type Primitive = string | number | boolean | bigint;
// export type ValidChildDomValue = Primitive | Node | null | undefined
// export type BindingFunc = ((dom?: Node) => ValidChildDomValue) | ((dom?: Element) => Element)
// export type ChildDom = ValidChildDomValue | StateView<Primitive | null | undefined> | BindingFunc | readonly ChildDom[]
type MaybeChildNode = Primitive | Node | DOMElement;
//#endregion
//#region src/types/dom-types.d.ts
type AllCSSProperties = Properties & PropertiesHyphen & SvgProperties & SvgPropertiesHyphen;
type CSSProperties = { // [key: `-${string}`]: StateMaybe<AllCSSProperties[K]>
[K in keyof AllCSSProperties]: StateMaybe<AllCSSProperties[K]> };
type ElementUnion = ChildDom & (MaybeChildNode | MaybeChildNode[]);
interface EventHandler<T, E = Event> {
  (e: E & {
    currentTarget: T;
    target: EventTarget & DOMElement;
  }): void;
}
interface BoundEventHandler<T, E extends Event> {
  0: (data: unknown, e: E & {
    currentTarget: T;
    target: EventTarget & DOMElement;
  }) => void;
  1: unknown;
}
type EventHandlerUnion<T, E extends Event> = EventHandler<T, E> | BoundEventHandler<T, E>;
declare const SERIALIZABLE: unique symbol = undefined;
interface SerializableAttributeValue {
  toString(): string;
  [SERIALIZABLE]: never;
}
interface CustomAttributes<T> {}
interface DOMAttributes<T> extends CustomAttributes<T>, CustomEventHandlersCamelCase<T>, CustomEventHandlersLowerCase<T> {
  ref?: State<{
    current?: Element;
  }>;
  children?: ElementUnion;
  innerHTML?: string;
  innerText?: string | number;
  textContent?: string | number; // camel case events
  onCopy?: EventHandlerUnion<T, ClipboardEvent>;
  onCut?: EventHandlerUnion<T, ClipboardEvent>;
  onPaste?: EventHandlerUnion<T, ClipboardEvent>;
  onCompositionEnd?: EventHandlerUnion<T, CompositionEvent>;
  onCompositionStart?: EventHandlerUnion<T, CompositionEvent>;
  onCompositionUpdate?: EventHandlerUnion<T, CompositionEvent>;
  onFocusOut?: EventHandlerUnion<T, FocusEvent>;
  onFocusIn?: EventHandlerUnion<T, FocusEvent>;
  onEncrypted?: EventHandlerUnion<T, Event>;
  onDragExit?: EventHandlerUnion<T, DragEvent>; // lower case events
  oncopy?: EventHandlerUnion<T, ClipboardEvent>;
  oncut?: EventHandlerUnion<T, ClipboardEvent>;
  onpaste?: EventHandlerUnion<T, ClipboardEvent>;
  oncompositionend?: EventHandlerUnion<T, CompositionEvent>;
  oncompositionstart?: EventHandlerUnion<T, CompositionEvent>;
  oncompositionupdate?: EventHandlerUnion<T, CompositionEvent>;
  onfocusout?: EventHandlerUnion<T, FocusEvent>;
  onfocusin?: EventHandlerUnion<T, FocusEvent>;
  onencrypted?: EventHandlerUnion<T, Event>;
  ondragexit?: EventHandlerUnion<T, DragEvent>;
}
interface CustomEventHandlersCamelCase<T> {
  onAbort?: EventHandlerUnion<T, Event>;
  onAnimationEnd?: EventHandlerUnion<T, AnimationEvent>;
  onAnimationIteration?: EventHandlerUnion<T, AnimationEvent>;
  onAnimationStart?: EventHandlerUnion<T, AnimationEvent>;
  onAuxClick?: EventHandlerUnion<T, MouseEvent>;
  onBeforeInput?: EventHandlerUnion<T, InputEvent>;
  onBeforeToggle?: EventHandlerUnion<T, ToggleEvent>;
  onBlur?: EventHandlerUnion<T, FocusEvent>;
  onCanPlay?: EventHandlerUnion<T, Event>;
  onCanPlayThrough?: EventHandlerUnion<T, Event>;
  onChange?: EventHandlerUnion<T, Event>;
  onClick?: EventHandlerUnion<T, MouseEvent>;
  onContextMenu?: EventHandlerUnion<T, MouseEvent>;
  onDblClick?: EventHandlerUnion<T, MouseEvent>;
  onDrag?: EventHandlerUnion<T, DragEvent>;
  onDragEnd?: EventHandlerUnion<T, DragEvent>;
  onDragEnter?: EventHandlerUnion<T, DragEvent>;
  onDragLeave?: EventHandlerUnion<T, DragEvent>;
  onDragOver?: EventHandlerUnion<T, DragEvent>;
  onDragStart?: EventHandlerUnion<T, DragEvent>;
  onDrop?: EventHandlerUnion<T, DragEvent>;
  onDurationChange?: EventHandlerUnion<T, Event>;
  onEmptied?: EventHandlerUnion<T, Event>;
  onEnded?: EventHandlerUnion<T, Event>;
  onError?: EventHandlerUnion<T, Event>;
  onFocus?: EventHandlerUnion<T, FocusEvent>;
  onGotPointerCapture?: EventHandlerUnion<T, PointerEvent>;
  onInput?: EventHandlerUnion<T, InputEvent>;
  onInvalid?: EventHandlerUnion<T, Event>;
  onKeyDown?: EventHandlerUnion<T, KeyboardEvent>;
  onKeyPress?: EventHandlerUnion<T, KeyboardEvent>;
  onKeyUp?: EventHandlerUnion<T, KeyboardEvent>;
  onLoad?: EventHandlerUnion<T, Event>;
  onLoadedData?: EventHandlerUnion<T, Event>;
  onLoadedMetadata?: EventHandlerUnion<T, Event>;
  onLoadStart?: EventHandlerUnion<T, Event>;
  onLostPointerCapture?: EventHandlerUnion<T, PointerEvent>;
  onMouseDown?: EventHandlerUnion<T, MouseEvent>;
  onMouseEnter?: EventHandlerUnion<T, MouseEvent>;
  onMouseLeave?: EventHandlerUnion<T, MouseEvent>;
  onMouseMove?: EventHandlerUnion<T, MouseEvent>;
  onMouseOut?: EventHandlerUnion<T, MouseEvent>;
  onMouseOver?: EventHandlerUnion<T, MouseEvent>;
  onMouseUp?: EventHandlerUnion<T, MouseEvent>;
  onPause?: EventHandlerUnion<T, Event>;
  onPlay?: EventHandlerUnion<T, Event>;
  onPlaying?: EventHandlerUnion<T, Event>;
  onPointerCancel?: EventHandlerUnion<T, PointerEvent>;
  onPointerDown?: EventHandlerUnion<T, PointerEvent>;
  onPointerEnter?: EventHandlerUnion<T, PointerEvent>;
  onPointerLeave?: EventHandlerUnion<T, PointerEvent>;
  onPointerMove?: EventHandlerUnion<T, PointerEvent>;
  onPointerOut?: EventHandlerUnion<T, PointerEvent>;
  onPointerOver?: EventHandlerUnion<T, PointerEvent>;
  onPointerUp?: EventHandlerUnion<T, PointerEvent>;
  onProgress?: EventHandlerUnion<T, Event>;
  onRateChange?: EventHandlerUnion<T, Event>;
  onReset?: EventHandlerUnion<T, Event>;
  onScroll?: EventHandlerUnion<T, Event>;
  onScrollEnd?: EventHandlerUnion<T, Event>;
  onSeeked?: EventHandlerUnion<T, Event>;
  onSeeking?: EventHandlerUnion<T, Event>;
  onSelect?: EventHandlerUnion<T, UIEvent>;
  onStalled?: EventHandlerUnion<T, Event>;
  onSubmit?: EventHandlerUnion<T, SubmitEvent>;
  onSuspend?: EventHandlerUnion<T, Event>;
  onTimeUpdate?: EventHandlerUnion<T, Event>;
  onToggle?: EventHandlerUnion<T, ToggleEvent>;
  onTouchCancel?: EventHandlerUnion<T, TouchEvent>;
  onTouchEnd?: EventHandlerUnion<T, TouchEvent>;
  onTouchMove?: EventHandlerUnion<T, TouchEvent>;
  onTouchStart?: EventHandlerUnion<T, TouchEvent>;
  onTransitionStart?: EventHandlerUnion<T, TransitionEvent>;
  onTransitionEnd?: EventHandlerUnion<T, TransitionEvent>;
  onTransitionRun?: EventHandlerUnion<T, TransitionEvent>;
  onTransitionCancel?: EventHandlerUnion<T, TransitionEvent>;
  onVolumeChange?: EventHandlerUnion<T, Event>;
  onWaiting?: EventHandlerUnion<T, Event>;
  onWheel?: EventHandlerUnion<T, WheelEvent>;
}
/** @export type {GlobalEventHandlers} */
interface CustomEventHandlersLowerCase<T> {
  onabort?: EventHandlerUnion<T, Event>;
  onanimationend?: EventHandlerUnion<T, AnimationEvent>;
  onanimationiteration?: EventHandlerUnion<T, AnimationEvent>;
  onanimationstart?: EventHandlerUnion<T, AnimationEvent>;
  onauxclick?: EventHandlerUnion<T, MouseEvent>;
  onbeforeinput?: EventHandlerUnion<T, InputEvent>;
  onbeforetoggle?: EventHandlerUnion<T, ToggleEvent>;
  onblur?: EventHandlerUnion<T, FocusEvent>;
  oncanplay?: EventHandlerUnion<T, Event>;
  oncanplaythrough?: EventHandlerUnion<T, Event>;
  onchange?: EventHandlerUnion<T, Event>;
  onclick?: EventHandlerUnion<T, MouseEvent>;
  oncontextmenu?: EventHandlerUnion<T, MouseEvent>;
  ondblclick?: EventHandlerUnion<T, MouseEvent>;
  ondrag?: EventHandlerUnion<T, DragEvent>;
  ondragend?: EventHandlerUnion<T, DragEvent>;
  ondragenter?: EventHandlerUnion<T, DragEvent>;
  ondragleave?: EventHandlerUnion<T, DragEvent>;
  ondragover?: EventHandlerUnion<T, DragEvent>;
  ondragstart?: EventHandlerUnion<T, DragEvent>;
  ondrop?: EventHandlerUnion<T, DragEvent>;
  ondurationchange?: EventHandlerUnion<T, Event>;
  onemptied?: EventHandlerUnion<T, Event>;
  onended?: EventHandlerUnion<T, Event>;
  onerror?: EventHandlerUnion<T, Event>;
  onfocus?: EventHandlerUnion<T, FocusEvent>;
  ongotpointercapture?: EventHandlerUnion<T, PointerEvent>;
  oninput?: EventHandlerUnion<T, InputEvent>;
  oninvalid?: EventHandlerUnion<T, Event>;
  onkeydown?: EventHandlerUnion<T, KeyboardEvent>;
  onkeypress?: EventHandlerUnion<T, KeyboardEvent>;
  onkeyup?: EventHandlerUnion<T, KeyboardEvent>;
  onload?: EventHandlerUnion<T, Event>;
  onloadeddata?: EventHandlerUnion<T, Event>;
  onloadedmetadata?: EventHandlerUnion<T, Event>;
  onloadstart?: EventHandlerUnion<T, Event>;
  onlostpointercapture?: EventHandlerUnion<T, PointerEvent>;
  onmousedown?: EventHandlerUnion<T, MouseEvent>;
  onmouseenter?: EventHandlerUnion<T, MouseEvent>;
  onmouseleave?: EventHandlerUnion<T, MouseEvent>;
  onmousemove?: EventHandlerUnion<T, MouseEvent>;
  onmouseout?: EventHandlerUnion<T, MouseEvent>;
  onmouseover?: EventHandlerUnion<T, MouseEvent>;
  onmouseup?: EventHandlerUnion<T, MouseEvent>;
  onpause?: EventHandlerUnion<T, Event>;
  onplay?: EventHandlerUnion<T, Event>;
  onplaying?: EventHandlerUnion<T, Event>;
  onpointercancel?: EventHandlerUnion<T, PointerEvent>;
  onpointerdown?: EventHandlerUnion<T, PointerEvent>;
  onpointerenter?: EventHandlerUnion<T, PointerEvent>;
  onpointerleave?: EventHandlerUnion<T, PointerEvent>;
  onpointermove?: EventHandlerUnion<T, PointerEvent>;
  onpointerout?: EventHandlerUnion<T, PointerEvent>;
  onpointerover?: EventHandlerUnion<T, PointerEvent>;
  onpointerup?: EventHandlerUnion<T, PointerEvent>;
  onprogress?: EventHandlerUnion<T, Event>;
  onratechange?: EventHandlerUnion<T, Event>;
  onreset?: EventHandlerUnion<T, Event>;
  onscroll?: EventHandlerUnion<T, Event>;
  onscrollend?: EventHandlerUnion<T, Event>;
  onseeked?: EventHandlerUnion<T, Event>;
  onseeking?: EventHandlerUnion<T, Event>;
  onselect?: EventHandlerUnion<T, UIEvent>;
  onstalled?: EventHandlerUnion<T, Event>;
  onsubmit?: EventHandlerUnion<T, SubmitEvent>;
  onsuspend?: EventHandlerUnion<T, Event>;
  ontimeupdate?: EventHandlerUnion<T, Event>;
  ontoggle?: EventHandlerUnion<T, ToggleEvent>;
  ontouchcancel?: EventHandlerUnion<T, TouchEvent>;
  ontouchend?: EventHandlerUnion<T, TouchEvent>;
  ontouchmove?: EventHandlerUnion<T, TouchEvent>;
  ontouchstart?: EventHandlerUnion<T, TouchEvent>;
  ontransitionstart?: EventHandlerUnion<T, TransitionEvent>;
  ontransitionend?: EventHandlerUnion<T, TransitionEvent>;
  ontransitionrun?: EventHandlerUnion<T, TransitionEvent>;
  ontransitioncancel?: EventHandlerUnion<T, TransitionEvent>;
  onvolumechange?: EventHandlerUnion<T, Event>;
  onwaiting?: EventHandlerUnion<T, Event>;
  onwheel?: EventHandlerUnion<T, WheelEvent>;
}
// export interface CSSProperties extends csstype.PropertiesHyphen {
//   // Override
//   [key: `-${string}`]:
//   | StateMaybe<string | number | undefined>
//   | string
//   | number
//   | undefined;
// }
type HTMLAutocapitalize = "off" | "none" | "on" | "sentences" | "words" | "characters";
type HTMLDir = "ltr" | "rtl" | "auto";
type HTMLFormEncType = "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain";
type HTMLFormMethod = "post" | "get" | "dialog";
type HTMLCrossorigin = "anonymous" | "use-credentials" | "";
type HTMLReferrerPolicy = "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
type HTMLIframeSandbox = "allow-downloads-without-user-activation" | "allow-downloads" | "allow-forms" | "allow-modals" | "allow-orientation-lock" | "allow-pointer-lock" | "allow-popups" | "allow-popups-to-escape-sandbox" | "allow-presentation" | "allow-same-origin" | "allow-scripts" | "allow-storage-access-by-user-activation" | "allow-top-navigation" | "allow-top-navigation-by-user-activation";
type HTMLLinkAs = "audio" | "document" | "embed" | "fetch" | "font" | "image" | "object" | "script" | "style" | "track" | "video" | "worker";
// All the WAI-ARIA 1.1 attributes from https://www.w3.org/TR/wai-aria-1.1/
interface AriaAttributes {
  /**
   * Identifies the currently active element when DOM focus is on a composite widget, textbox,
   * group, or application.
   */
  "aria-activedescendant"?: StateMaybe<string>;
  /**
   * Indicates whether assistive technologies will present all, or only parts of, the changed
   * region based on the change notifications defined by the aria-relevant attribute.
   */
  "aria-atomic"?: StateMaybe<boolean | "false" | "true">;
  /**
   * Indicates whether inputting text could trigger display of one or more predictions of the
   * user's intended value for an input and specifies how predictions would be presented if they
   * are made.
   */
  "aria-autocomplete"?: StateMaybe<"none" | "inline" | "list" | "both">;
  /**
   * Indicates an element is being modified and that assistive technologies MAY want to wait until
   * the modifications are complete before exposing them to the user.
   */
  "aria-busy"?: StateMaybe<boolean | "false" | "true">;
  /**
   * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
   *
   * @see aria-pressed @see aria-selected.
   */
  "aria-checked"?: StateMaybe<boolean | "false" | "mixed" | "true">;
  /**
   * Defines the total number of columns in a table, grid, or treegrid.
   *
   * @see aria-colindex.
   */
  "aria-colcount"?: StateMaybe<number | string>;
  /**
   * Defines an element's column index or position with respect to the total number of columns
   * within a table, grid, or treegrid.
   *
   * @see aria-colcount @see aria-colspan.
   */
  "aria-colindex"?: StateMaybe<number | string>;
  /**
   * Defines the number of columns spanned by a cell or gridcell within a table, grid, or
   * treegrid.
   *
   * @see aria-colindex @see aria-rowspan.
   */
  "aria-colspan"?: StateMaybe<number | string>;
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current
   * element.
   *
   * @see aria-owns.
   */
  "aria-controls"?: StateMaybe<string>;
  /**
   * Indicates the element that represents the current item within a container or set of related
   * elements.
   */
  "aria-current"?: StateMaybe<boolean | "false" | "true" | "page" | "step" | "location" | "date" | "time" | undefined>;
  /**
   * Identifies the element (or elements) that describes the object.
   *
   * @see aria-labelledby
   */
  "aria-describedby"?: StateMaybe<string>;
  /**
   * Identifies the element that provides a detailed, extended description for the object.
   *
   * @see aria-describedby.
   */
  "aria-details"?: StateMaybe<string>;
  /**
   * Indicates that the element is perceivable but disabled, so it is not editable or otherwise
   * operable.
   *
   * @see aria-hidden @see aria-readonly.
   */
  "aria-disabled"?: StateMaybe<boolean | "false" | "true">;
  /**
   * Indicates what functions can be performed when a dragged object is released on the drop
   * target.
   *
   * @deprecated In ARIA 1.1
   */
  "aria-dropeffect"?: StateMaybe<"none" | "copy" | "execute" | "link" | "move" | "popup">;
  /**
   * Identifies the element that provides an error message for the object.
   *
   * @see aria-invalid @see aria-describedby.
   */
  "aria-errormessage"?: StateMaybe<string>;
  /**
   * Indicates whether the element, or another grouping element it controls, is currently expanded
   * or collapsed.
   */
  "aria-expanded"?: StateMaybe<boolean | "false" | "true">;
  /**
   * Identifies the next element (or elements) in an alternate reading order of content which, at
   * the user's discretion, allows assistive technology to override the general default of reading
   * in document source order.
   */
  "aria-flowto"?: StateMaybe<string>;
  /**
   * Indicates an element's "grabbed" state in a drag-and-drop operation.
   *
   * @deprecated In ARIA 1.1
   */
  "aria-grabbed"?: StateMaybe<boolean | "false" | "true">;
  /**
   * Indicates the availability and export type of interactive popup element, such as menu or dialog,
   * that can be triggered by an element.
   */
  "aria-haspopup"?: StateMaybe<boolean | "false" | "true" | "menu" | "listbox" | "tree" | "grid" | "dialog">;
  /**
   * Indicates whether the element is exposed to an accessibility API.
   *
   * @see aria-disabled.
   */
  "aria-hidden"?: StateMaybe<boolean | "false" | "true">;
  /**
   * Indicates the entered value does not conform to the format expected by the application.
   *
   * @see aria-errormessage.
   */
  "aria-invalid"?: StateMaybe<boolean | "false" | "true" | "grammar" | "spelling">;
  /**
   * Indicates keyboard shortcuts that an author has implemented to activate or give focus to an
   * element.
   */
  "aria-keyshortcuts"?: StateMaybe<string>;
  /**
   * Defines a string value that labels the current element.
   *
   * @see aria-labelledby.
   */
  "aria-label"?: StateMaybe<string>;
  /**
   * Identifies the element (or elements) that labels the current element.
   *
   * @see aria-describedby.
   */
  "aria-labelledby"?: StateMaybe<string>;
  /** Defines the hierarchical level of an element within a structure. */
  "aria-level"?: StateMaybe<number | string>;
  /**
   * Indicates that an element will be updated, and describes the types of updates the user
   * agents, assistive technologies, and user can expect from the live region.
   */
  "aria-live"?: StateMaybe<"off" | "assertive" | "polite">;
  /** Indicates whether an element is modal when displayed. */
  "aria-modal"?: StateMaybe<boolean | "false" | "true">;
  /** Indicates whether a text box accepts multiple lines of input or only a single line. */
  "aria-multiline"?: StateMaybe<boolean | "false" | "true">;
  /**
   * Indicates that the user may select more than one item from the current selectable
   * descendants.
   */
  "aria-multiselectable"?: StateMaybe<boolean | "false" | "true">;
  /** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
  "aria-orientation"?: StateMaybe<"horizontal" | "vertical">;
  /**
   * Identifies an element (or elements) in order to define a visual, functional, or contextual
   * parent/child relationship between DOM elements where the DOM hierarchy cannot be used to
   * represent the relationship.
   *
   * @see aria-controls.
   */
  "aria-owns"?: StateMaybe<string>;
  /**
   * Defines a short hint (a word or short phrase) intended to aid the user with data entry when
   * the control has no value. A hint could be a sample value or a brief description of the
   * expected format.
   */
  "aria-placeholder"?: StateMaybe<string>;
  /**
   * Defines an element's number or position in the current set of listitems or treeitems. Not
   * required if all elements in the set are present in the DOM.
   *
   * @see aria-setsize.
   */
  "aria-posinset"?: StateMaybe<number | string>;
  /**
   * Indicates the current "pressed" state of toggle buttons.
   *
   * @see aria-checked @see aria-selected.
   */
  "aria-pressed"?: StateMaybe<boolean | "false" | "mixed" | "true">;
  /**
   * Indicates that the element is not editable, but is otherwise operable.
   *
   * @see aria-disabled.
   */
  "aria-readonly"?: StateMaybe<boolean | "false" | "true">;
  /**
   * Indicates what notifications the user agent will trigger when the accessibility tree within a
   * live region is modified.
   *
   * @see aria-atomic.
   */
  "aria-relevant"?: StateMaybe<"additions" | "additions removals" | "additions text" | "all" | "removals" | "removals additions" | "removals text" | "text" | "text additions" | "text removals">;
  /** Indicates that user input is required on the element before a form may be submitted. */
  "aria-required"?: StateMaybe<boolean | "false" | "true">;
  /** Defines a human-readable, author-localized description for the role of an element. */
  "aria-roledescription"?: StateMaybe<string>;
  /**
   * Defines the total number of rows in a table, grid, or treegrid.
   *
   * @see aria-rowindex.
   */
  "aria-rowcount"?: StateMaybe<number | string>;
  /**
   * Defines an element's row index or position with respect to the total number of rows within a
   * table, grid, or treegrid.
   *
   * @see aria-rowcount @see aria-rowspan.
   */
  "aria-rowindex"?: StateMaybe<number | string>;
  /**
   * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
   *
   * @see aria-rowindex @see aria-colspan.
   */
  "aria-rowspan"?: StateMaybe<number | string>;
  /**
   * Indicates the current "selected" state of various widgets.
   *
   * @see aria-checked @see aria-pressed.
   */
  "aria-selected"?: StateMaybe<boolean | "false" | "true">;
  /**
   * Defines the number of items in the current set of listitems or treeitems. Not required if all
   * elements in the set are present in the DOM.
   *
   * @see aria-posinset.
   */
  "aria-setsize"?: StateMaybe<number | string>;
  /** Indicates if items in a table or grid are sorted in ascending or descending order. */
  "aria-sort"?: StateMaybe<"none" | "ascending" | "descending" | "other">;
  /** Defines the maximum allowed value for a range widget. */
  "aria-valuemax"?: StateMaybe<number | string>;
  /** Defines the minimum allowed value for a range widget. */
  "aria-valuemin"?: StateMaybe<number | string>;
  /**
   * Defines the current value for a range widget.
   *
   * @see aria-valuetext.
   */
  "aria-valuenow"?: StateMaybe<number | string>;
  /** Defines the human readable text alternative of aria-valuenow for a range widget. */
  "aria-valuetext"?: StateMaybe<string>;
  role?: StateMaybe<"alert" | "alertdialog" | "application" | "article" | "banner" | "button" | "cell" | "checkbox" | "columnheader" | "combobox" | "complementary" | "contentinfo" | "definition" | "dialog" | "directory" | "document" | "feed" | "figure" | "form" | "grid" | "gridcell" | "group" | "heading" | "img" | "link" | "list" | "listbox" | "listitem" | "log" | "main" | "marquee" | "math" | "menu" | "menubar" | "menuitem" | "menuitemcheckbox" | "menuitemradio" | "meter" | "navigation" | "none" | "note" | "option" | "presentation" | "progressbar" | "radio" | "radiogroup" | "region" | "row" | "rowgroup" | "rowheader" | "scrollbar" | "search" | "searchbox" | "separator" | "slider" | "spinbutton" | "status" | "switch" | "tab" | "table" | "tablist" | "tabpanel" | "term" | "textbox" | "timer" | "toolbar" | "tooltip" | "tree" | "treegrid" | "treeitem">;
}
interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
  ref?: State<{
    current?: Element;
  }>;
  accessKey?: StateMaybe<string>;
  class?: StateMaybe<string> | undefined;
  contenteditable?: StateMaybe<boolean | "plaintext-only" | "inherit">;
  contextmenu?: StateMaybe<string>;
  dir?: StateMaybe<HTMLDir>;
  draggable?: StateMaybe<boolean>;
  hidden?: StateMaybe<boolean>;
  id?: StateMaybe<string>;
  is?: StateMaybe<string>;
  inert?: StateMaybe<boolean>;
  lang?: StateMaybe<string>;
  spellcheck?: StateMaybe<boolean>;
  style?: StateMaybe<CSSProperties | string | null>;
  tabindex?: StateMaybe<number | string>;
  title?: StateMaybe<string>;
  translate?: StateMaybe<"yes" | "no">;
  about?: StateMaybe<string>;
  datatype?: StateMaybe<string>;
  inlist?: StateMaybe<unknown>;
  popover?: StateMaybe<boolean | "manual" | "auto">;
  prefix?: StateMaybe<string>;
  property?: StateMaybe<string>;
  resource?: StateMaybe<string>;
  typeof?: StateMaybe<string>;
  vocab?: StateMaybe<string>;
  autocapitalize?: StateMaybe<HTMLAutocapitalize>;
  slot?: StateMaybe<string>;
  color?: StateMaybe<string>;
  itemprop?: StateMaybe<string>;
  itemscope?: StateMaybe<boolean>;
  itemtype?: StateMaybe<string>;
  itemid?: StateMaybe<string>;
  itemref?: StateMaybe<string>;
  part?: StateMaybe<string>;
  exportparts?: StateMaybe<string>;
  inputmode?: StateMaybe<"none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search">;
  contentEditable?: StateMaybe<boolean | "plaintext-only" | "inherit">;
  contextMenu?: StateMaybe<string>;
  tabIndex?: StateMaybe<number | string>;
  autoCapitalize?: StateMaybe<HTMLAutocapitalize>;
  itemProp?: StateMaybe<string>;
  itemScope?: StateMaybe<boolean>;
  itemType?: StateMaybe<string>;
  itemId?: StateMaybe<string>;
  itemRef?: StateMaybe<string>;
  exportParts?: StateMaybe<string>;
  inputMode?: StateMaybe<"none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search">;
}
interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
  download?: StateMaybe<unknown>;
  href?: StateMaybe<string>;
  hreflang?: StateMaybe<string>;
  media?: StateMaybe<string>;
  ping?: StateMaybe<string>;
  referrerpolicy?: StateMaybe<HTMLReferrerPolicy>;
  rel?: StateMaybe<string>;
  target?: StateMaybe<string>;
  type?: StateMaybe<string>;
  referrerPolicy?: StateMaybe<HTMLReferrerPolicy>;
  ariaCurrent?: StateMaybe<string>;
}
interface AudioHTMLAttributes<T> extends MediaHTMLAttributes<T> {}
interface AreaHTMLAttributes<T> extends HTMLAttributes<T> {
  alt?: StateMaybe<string>;
  coords?: StateMaybe<string>;
  download?: StateMaybe<unknown>;
  href?: StateMaybe<string>;
  hreflang?: StateMaybe<string>;
  ping?: StateMaybe<string>;
  referrerpolicy?: StateMaybe<HTMLReferrerPolicy>;
  rel?: StateMaybe<string>;
  shape?: StateMaybe<"rect" | "circle" | "poly" | "default">;
  target?: StateMaybe<string>;
  referrerPolicy?: StateMaybe<HTMLReferrerPolicy>;
}
interface BaseHTMLAttributes<T> extends HTMLAttributes<T> {
  href?: StateMaybe<string>;
  target?: StateMaybe<string>;
}
interface BlockquoteHTMLAttributes<T> extends HTMLAttributes<T> {
  cite?: StateMaybe<string>;
}
interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
  autofocus?: StateMaybe<boolean>;
  disabled?: StateMaybe<boolean>;
  form?: StateMaybe<string>;
  formaction?: StateMaybe<string | SerializableAttributeValue>;
  formenctype?: StateMaybe<HTMLFormEncType>;
  formmethod?: StateMaybe<HTMLFormMethod>;
  formnovalidate?: StateMaybe<boolean>;
  formtarget?: StateMaybe<string>;
  popovertarget?: StateMaybe<string>;
  popovertargetaction?: StateMaybe<"hide" | "show" | "toggle">;
  name?: StateMaybe<string>;
  type?: StateMaybe<"submit" | "reset" | "button">;
  value?: StateMaybe<string>;
  formAction?: StateMaybe<string | SerializableAttributeValue>;
  formEnctype?: StateMaybe<HTMLFormEncType>;
  formMethod?: StateMaybe<HTMLFormMethod>;
  formNoValidate?: StateMaybe<boolean>;
  formTarget?: StateMaybe<string>;
  popoverTarget?: StateMaybe<string>;
  popoverTargetAction?: StateMaybe<"hide" | "show" | "toggle">;
}
interface CanvasHTMLAttributes<T> extends HTMLAttributes<T> {
  width?: StateMaybe<number | string>;
  height?: StateMaybe<number | string>;
}
interface CustomElementHTMLAttributes<T> extends HTMLAttributes<T> {
  tagName: Readonly<Uppercase<string & `${string}-${string}`>>;
  nodeName: Readonly<Uppercase<string & `${string}-${string}`>>;
}
interface ColHTMLAttributes<T> extends HTMLAttributes<T> {
  span?: StateMaybe<number | string>;
  width?: StateMaybe<number | string>;
}
interface ColgroupHTMLAttributes<T> extends HTMLAttributes<T> {
  span?: StateMaybe<number | string>;
}
interface DataHTMLAttributes<T> extends HTMLAttributes<T> {
  value?: StateMaybe<string | string[] | number>;
}
interface DetailsHtmlAttributes<T> extends HTMLAttributes<T> {
  open?: StateMaybe<boolean>;
  onToggle?: EventHandlerUnion<T, Event>;
  ontoggle?: EventHandlerUnion<T, Event>;
}
interface DialogHtmlAttributes<T> extends HTMLAttributes<T> {
  open?: StateMaybe<boolean>;
}
interface EmbedHTMLAttributes<T> extends HTMLAttributes<T> {
  height?: StateMaybe<number | string>;
  src?: StateMaybe<string>;
  type?: StateMaybe<string>;
  width?: StateMaybe<number | string>;
}
interface FieldsetHTMLAttributes<T> extends HTMLAttributes<T> {
  disabled?: StateMaybe<boolean>;
  form?: StateMaybe<string>;
  name?: StateMaybe<string>;
}
interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
  "accept-charset"?: StateMaybe<string>;
  action?: StateMaybe<string | SerializableAttributeValue>;
  autocomplete?: StateMaybe<string>;
  encoding?: StateMaybe<HTMLFormEncType>;
  enctype?: StateMaybe<HTMLFormEncType>;
  method?: StateMaybe<HTMLFormMethod>;
  name?: StateMaybe<string>;
  novalidate?: StateMaybe<boolean>;
  target?: StateMaybe<string>;
  noValidate?: StateMaybe<boolean>;
}
interface IframeHTMLAttributes<T> extends HTMLAttributes<T> {
  allow?: StateMaybe<string>;
  allowfullscreen?: StateMaybe<boolean>;
  height?: StateMaybe<number | string>;
  name?: StateMaybe<string>;
  referrerpolicy?: StateMaybe<HTMLReferrerPolicy>;
  sandbox?: HTMLIframeSandbox | string;
  src?: StateMaybe<string>;
  srcdoc?: StateMaybe<string>;
  width?: StateMaybe<number | string>;
  loading?: StateMaybe<"eager" | "lazy">;
  referrerPolicy?: StateMaybe<HTMLReferrerPolicy>;
}
interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
  alt?: StateMaybe<string>;
  crossorigin?: StateMaybe<HTMLCrossorigin>;
  decoding?: StateMaybe<"sync" | "async" | "auto">;
  height?: StateMaybe<number | string>;
  ismap?: StateMaybe<boolean>;
  isMap?: StateMaybe<boolean>;
  loading?: StateMaybe<"eager" | "lazy">;
  referrerpolicy?: StateMaybe<HTMLReferrerPolicy>;
  referrerPolicy?: StateMaybe<HTMLReferrerPolicy>;
  sizes?: StateMaybe<string>;
  src?: StateMaybe<string>;
  srcset?: StateMaybe<string>;
  srcSet?: StateMaybe<string>;
  usemap?: StateMaybe<string>;
  useMap?: StateMaybe<string>;
  width?: StateMaybe<number | string>;
  crossOrigin?: StateMaybe<HTMLCrossorigin>;
}
interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
  accept?: StateMaybe<string>;
  alt?: StateMaybe<string>;
  autocomplete?: StateMaybe<string>;
  autofocus?: StateMaybe<boolean>;
  capture?: StateMaybe<boolean | string>;
  checked?: StateMaybe<boolean>;
  crossorigin?: StateMaybe<HTMLCrossorigin>;
  disabled?: StateMaybe<boolean>;
  form?: StateMaybe<string>;
  formaction?: StateMaybe<string | SerializableAttributeValue>;
  formenctype?: StateMaybe<HTMLFormEncType>;
  formmethod?: StateMaybe<HTMLFormMethod>;
  formnovalidate?: StateMaybe<boolean>;
  formtarget?: StateMaybe<string>;
  height?: StateMaybe<number | string>;
  list?: StateMaybe<string>;
  max?: StateMaybe<number | string>;
  maxlength?: StateMaybe<number | string>;
  min?: StateMaybe<number | string>;
  minlength?: StateMaybe<number | string>;
  multiple?: StateMaybe<boolean>;
  name?: StateMaybe<string>;
  pattern?: StateMaybe<string>;
  placeholder?: StateMaybe<string>;
  readonly?: StateMaybe<boolean>;
  required?: StateMaybe<boolean>;
  size?: StateMaybe<number | string>;
  src?: StateMaybe<string>;
  step?: StateMaybe<number | string>;
  type?: StateMaybe<string>;
  value?: StateMaybe<string | string[] | number>;
  width?: StateMaybe<number | string>;
  crossOrigin?: StateMaybe<HTMLCrossorigin>;
  formAction?: StateMaybe<string | SerializableAttributeValue>;
  formEnctype?: StateMaybe<HTMLFormEncType>;
  formMethod?: StateMaybe<HTMLFormMethod>;
  formNoValidate?: StateMaybe<boolean>;
  formTarget?: StateMaybe<string>;
  maxLength?: StateMaybe<number | string>;
  minLength?: StateMaybe<number | string>;
  readOnly?: StateMaybe<boolean>;
}
interface InsHTMLAttributes<T> extends HTMLAttributes<T> {
  cite?: StateMaybe<string>;
  dateTime?: StateMaybe<string>;
}
interface KeygenHTMLAttributes<T> extends HTMLAttributes<T> {
  autofocus?: StateMaybe<boolean>;
  challenge?: StateMaybe<string>;
  disabled?: StateMaybe<boolean>;
  form?: StateMaybe<string>;
  keytype?: StateMaybe<string>;
  keyparams?: StateMaybe<string>;
  name?: StateMaybe<string>;
}
interface LabelHTMLAttributes<T> extends HTMLAttributes<T> {
  for?: StateMaybe<string>;
  form?: StateMaybe<string>;
}
interface LiHTMLAttributes<T> extends HTMLAttributes<T> {
  value?: StateMaybe<number | string>;
}
interface LinkHTMLAttributes<T> extends HTMLAttributes<T> {
  as?: StateMaybe<HTMLLinkAs>;
  crossorigin?: StateMaybe<HTMLCrossorigin>;
  disabled?: StateMaybe<boolean>;
  fetchpriority?: StateMaybe<"high" | "low" | "auto">;
  href?: StateMaybe<string>;
  hreflang?: StateMaybe<string>;
  imagesizes?: StateMaybe<string>;
  imagesrcset?: StateMaybe<string>;
  integrity?: StateMaybe<string>;
  media?: StateMaybe<string>;
  referrerpolicy?: StateMaybe<HTMLReferrerPolicy>;
  rel?: StateMaybe<string>;
  sizes?: StateMaybe<string>;
  type?: StateMaybe<string>;
  crossOrigin?: StateMaybe<HTMLCrossorigin>;
  referrerPolicy?: StateMaybe<HTMLReferrerPolicy>;
}
interface MapHTMLAttributes<T> extends HTMLAttributes<T> {
  name?: StateMaybe<string>;
}
interface MediaHTMLAttributes<T> extends HTMLAttributes<T> {
  autoplay?: StateMaybe<boolean>;
  controls?: StateMaybe<boolean>;
  crossorigin?: StateMaybe<HTMLCrossorigin>;
  loop?: StateMaybe<boolean>;
  mediagroup?: StateMaybe<string>;
  muted?: StateMaybe<boolean>;
  preload?: StateMaybe<"none" | "metadata" | "auto" | "">;
  src?: StateMaybe<string>;
  crossOrigin?: StateMaybe<HTMLCrossorigin>;
  mediaGroup?: StateMaybe<string>;
}
interface MenuHTMLAttributes<T> extends HTMLAttributes<T> {
  label?: StateMaybe<string>;
  type?: StateMaybe<"context" | "toolbar">;
}
interface MetaHTMLAttributes<T> extends HTMLAttributes<T> {
  charset?: StateMaybe<string>;
  content?: StateMaybe<string>;
  "http-equiv"?: StateMaybe<string>;
  name?: StateMaybe<string>;
  media?: StateMaybe<string>;
}
interface MeterHTMLAttributes<T> extends HTMLAttributes<T> {
  form?: StateMaybe<string>;
  high?: StateMaybe<number | string>;
  low?: StateMaybe<number | string>;
  max?: StateMaybe<number | string>;
  min?: StateMaybe<number | string>;
  optimum?: StateMaybe<number | string>;
  value?: StateMaybe<string | string[] | number>;
}
interface QuoteHTMLAttributes<T> extends HTMLAttributes<T> {
  cite?: StateMaybe<string>;
}
interface ObjectHTMLAttributes<T> extends HTMLAttributes<T> {
  data?: StateMaybe<string>;
  form?: StateMaybe<string>;
  height?: StateMaybe<number | string>;
  name?: StateMaybe<string>;
  type?: StateMaybe<string>;
  usemap?: StateMaybe<string>;
  width?: StateMaybe<number | string>;
  useMap?: StateMaybe<string>;
}
interface OlHTMLAttributes<T> extends HTMLAttributes<T> {
  reversed?: StateMaybe<boolean>;
  start?: StateMaybe<number | string>;
  type?: StateMaybe<"1" | "a" | "A" | "i" | "I">;
}
interface OptgroupHTMLAttributes<T> extends HTMLAttributes<T> {
  disabled?: StateMaybe<boolean>;
  label?: StateMaybe<string>;
}
interface OptionHTMLAttributes<T> extends HTMLAttributes<T> {
  disabled?: StateMaybe<boolean>;
  label?: StateMaybe<string>;
  selected?: StateMaybe<boolean>;
  value?: StateMaybe<string | string[] | number>;
}
interface OutputHTMLAttributes<T> extends HTMLAttributes<T> {
  form?: StateMaybe<string>;
  for?: StateMaybe<string>;
  name?: StateMaybe<string>;
}
interface ParamHTMLAttributes<T> extends HTMLAttributes<T> {
  name?: StateMaybe<string>;
  value?: StateMaybe<string | string[] | number>;
}
interface ProgressHTMLAttributes<T> extends HTMLAttributes<T> {
  max?: StateMaybe<number | string>;
  value?: StateMaybe<string | string[] | number>;
}
interface ScriptHTMLAttributes<T> extends HTMLAttributes<T> {
  async?: StateMaybe<boolean>;
  charset?: StateMaybe<string>;
  crossorigin?: StateMaybe<HTMLCrossorigin>;
  defer?: StateMaybe<boolean>;
  integrity?: StateMaybe<string>;
  nomodule?: StateMaybe<boolean>;
  nonce?: StateMaybe<string>;
  referrerpolicy?: StateMaybe<HTMLReferrerPolicy>;
  src?: StateMaybe<string>;
  type?: StateMaybe<string>;
  crossOrigin?: StateMaybe<HTMLCrossorigin>;
  noModule?: StateMaybe<boolean>;
  referrerPolicy?: StateMaybe<HTMLReferrerPolicy>;
}
interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {
  autocomplete?: StateMaybe<string>;
  autofocus?: StateMaybe<boolean>;
  disabled?: StateMaybe<boolean>;
  form?: StateMaybe<string>;
  multiple?: StateMaybe<boolean>;
  name?: StateMaybe<string>;
  required?: StateMaybe<boolean>;
  size?: StateMaybe<number | string>;
  value?: StateMaybe<string | string[] | number>;
}
interface HTMLSlotElementAttributes<T = HTMLSlotElement> extends HTMLAttributes<T> {
  name?: StateMaybe<string>;
}
interface SourceHTMLAttributes<T> extends HTMLAttributes<T> {
  media?: StateMaybe<string>;
  sizes?: StateMaybe<string>;
  src?: StateMaybe<string>;
  srcset?: StateMaybe<string>;
  type?: StateMaybe<string>;
  width?: StateMaybe<number | string>;
  height?: StateMaybe<number | string>;
}
interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
  media?: StateMaybe<string>;
  nonce?: StateMaybe<string>;
  scoped?: StateMaybe<boolean>;
  type?: StateMaybe<string>;
}
interface TdHTMLAttributes<T> extends HTMLAttributes<T> {
  colspan?: StateMaybe<number | string>;
  headers?: StateMaybe<string>;
  rowspan?: StateMaybe<number | string>;
  colSpan?: StateMaybe<number | string>;
  rowSpan?: StateMaybe<number | string>;
}
interface TemplateHTMLAttributes<T extends HTMLTemplateElement> extends HTMLAttributes<T> {
  content?: StateMaybe<DocumentFragment>;
}
interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {
  autocomplete?: StateMaybe<string>;
  autofocus?: StateMaybe<boolean>;
  cols?: StateMaybe<number | string>;
  dirname?: StateMaybe<string>;
  disabled?: StateMaybe<boolean>;
  form?: StateMaybe<string>;
  maxlength?: StateMaybe<number | string>;
  minlength?: StateMaybe<number | string>;
  name?: StateMaybe<string>;
  placeholder?: StateMaybe<string>;
  readonly?: StateMaybe<boolean>;
  required?: StateMaybe<boolean>;
  rows?: StateMaybe<number | string>;
  value?: StateMaybe<string | string[] | number>;
  wrap?: StateMaybe<"hard" | "soft" | "off">;
  maxLength?: StateMaybe<number | string>;
  minLength?: StateMaybe<number | string>;
  readOnly?: StateMaybe<boolean>;
}
interface ThHTMLAttributes<T> extends HTMLAttributes<T> {
  colspan?: StateMaybe<number | string>;
  headers?: StateMaybe<string>;
  rowspan?: StateMaybe<number | string>;
  colSpan?: StateMaybe<number | string>;
  rowSpan?: StateMaybe<number | string>;
  scope?: StateMaybe<"col" | "row" | "rowgroup" | "colgroup">;
}
interface TimeHTMLAttributes<T> extends HTMLAttributes<T> {
  datetime?: StateMaybe<string>;
  dateTime?: StateMaybe<string>;
}
interface TrackHTMLAttributes<T> extends HTMLAttributes<T> {
  default?: StateMaybe<boolean>;
  kind?: StateMaybe<"subtitles" | "captions" | "descriptions" | "chapters" | "metadata">;
  label?: StateMaybe<string>;
  src?: StateMaybe<string>;
  srclang?: StateMaybe<string>;
}
interface VideoHTMLAttributes<T> extends MediaHTMLAttributes<T> {
  height?: StateMaybe<number | string>;
  playsinline?: StateMaybe<boolean>;
  poster?: StateMaybe<string>;
  width?: StateMaybe<number | string>;
  disablepictureinpicture?: StateMaybe<boolean>;
}
type SVGPreserveAspectRatio = "none" | "xMinYMin" | "xMidYMin" | "xMaxYMin" | "xMinYMid" | "xMidYMid" | "xMaxYMid" | "xMinYMax" | "xMidYMax" | "xMaxYMax" | "xMinYMin meet" | "xMidYMin meet" | "xMaxYMin meet" | "xMinYMid meet" | "xMidYMid meet" | "xMaxYMid meet" | "xMinYMax meet" | "xMidYMax meet" | "xMaxYMax meet" | "xMinYMin slice" | "xMidYMin slice" | "xMaxYMin slice" | "xMinYMid slice" | "xMidYMid slice" | "xMaxYMid slice" | "xMinYMax slice" | "xMidYMax slice" | "xMaxYMax slice";
type ImagePreserveAspectRatio = SVGPreserveAspectRatio | "defer none" | "defer xMinYMin" | "defer xMidYMin" | "defer xMaxYMin" | "defer xMinYMid" | "defer xMidYMid" | "defer xMaxYMid" | "defer xMinYMax" | "defer xMidYMax" | "defer xMaxYMax" | "defer xMinYMin meet" | "defer xMidYMin meet" | "defer xMaxYMin meet" | "defer xMinYMid meet" | "defer xMidYMid meet" | "defer xMaxYMid meet" | "defer xMinYMax meet" | "defer xMidYMax meet" | "defer xMaxYMax meet" | "defer xMinYMin slice" | "defer xMidYMin slice" | "defer xMaxYMin slice" | "defer xMinYMid slice" | "defer xMidYMid slice" | "defer xMaxYMid slice" | "defer xMinYMax slice" | "defer xMidYMax slice" | "defer xMaxYMax slice";
type SVGUnits = "userSpaceOnUse" | "objectBoundingBox";
interface CoreSVGAttributes<T> extends AriaAttributes, DOMAttributes<T> {
  id?: StateMaybe<string>;
  lang?: StateMaybe<string>;
  tabIndex?: StateMaybe<number | string>;
  tabindex?: StateMaybe<number | string>;
}
interface StylableSVGAttributes {
  class?: StateMaybe<string> | undefined;
  style?: StateMaybe<CSSProperties | string | null>;
}
interface TransformableSVGAttributes {
  transform?: StateMaybe<string>;
}
interface ConditionalProcessingSVGAttributes {
  requiredExtensions?: StateMaybe<string>;
  requiredFeatures?: StateMaybe<string>;
  systemLanguage?: StateMaybe<string>;
}
interface ExternalResourceSVGAttributes {
  externalResourcesRequired?: StateMaybe<"true" | "false">;
}
interface AnimationTimingSVGAttributes {
  begin?: StateMaybe<string>;
  dur?: StateMaybe<string>;
  end?: StateMaybe<string>;
  min?: StateMaybe<string>;
  max?: StateMaybe<string>;
  restart?: StateMaybe<"always" | "whenNotActive" | "never">;
  repeatCount?: StateMaybe<number | "indefinite">;
  repeatDur?: StateMaybe<string>;
  fill?: StateMaybe<"freeze" | "remove">;
}
interface AnimationValueSVGAttributes {
  calcMode?: StateMaybe<"discrete" | "linear" | "paced" | "spline">;
  values?: StateMaybe<string>;
  keyTimes?: StateMaybe<string>;
  keySplines?: StateMaybe<string>;
  from?: StateMaybe<number | string>;
  to?: StateMaybe<number | string>;
  by?: StateMaybe<number | string>;
}
interface AnimationAdditionSVGAttributes {
  attributeName?: StateMaybe<string>;
  additive?: StateMaybe<"replace" | "sum">;
  accumulate?: StateMaybe<"none" | "sum">;
}
interface AnimationAttributeTargetSVGAttributes {
  attributeName?: StateMaybe<string>;
  attributeType?: StateMaybe<"CSS" | "XML" | "auto">;
}
interface PresentationSVGAttributes {
  "alignment-baseline"?: "auto" | "baseline" | "before-edge" | "text-before-edge" | "middle" | "central" | "after-edge" | "text-after-edge" | "ideographic" | "alphabetic" | "hanging" | "mathematical" | "inherit";
  "baseline-shift"?: StateMaybe<number | string>;
  clip?: StateMaybe<string>;
  "clip-path"?: StateMaybe<string>;
  "clip-rule"?: "nonzero" | "evenodd" | "inherit";
  color?: StateMaybe<string>;
  "color-interpolation"?: "auto" | "sRGB" | "linearRGB" | "inherit";
  "color-interpolation-filters"?: "auto" | "sRGB" | "linearRGB" | "inherit";
  "color-profile"?: StateMaybe<string>;
  "color-rendering"?: "auto" | "optimizeSpeed" | "optimizeQuality" | "inherit";
  cursor?: StateMaybe<string>;
  direction?: "ltr" | "rtl" | "inherit";
  display?: StateMaybe<string>;
  "dominant-baseline"?: "auto" | "text-bottom" | "alphabetic" | "ideographic" | "middle" | "central" | "mathematical" | "hanging" | "text-top" | "inherit";
  "enable-background"?: StateMaybe<string>;
  fill?: StateMaybe<string>;
  "fill-opacity"?: StateMaybe<number | string | "inherit">;
  "fill-rule"?: StateMaybe<"nonzero" | "evenodd" | "inherit">;
  filter?: StateMaybe<string>;
  "flood-color"?: StateMaybe<string>;
  "flood-opacity"?: StateMaybe<number | string | "inherit">;
  "font-family"?: StateMaybe<string>;
  "font-size"?: StateMaybe<string>;
  "font-size-adjust"?: StateMaybe<number | string>;
  "font-stretch"?: StateMaybe<string>;
  "font-style"?: StateMaybe<"normal" | "italic" | "oblique" | "inherit">;
  "font-variant"?: StateMaybe<string>;
  "font-weight"?: StateMaybe<number | string>;
  "glyph-orientation-horizontal"?: StateMaybe<string>;
  "glyph-orientation-vertical"?: StateMaybe<string>;
  "image-rendering"?: StateMaybe<"auto" | "optimizeQuality" | "optimizeSpeed" | "inherit">;
  kerning?: StateMaybe<string>;
  "letter-spacing"?: StateMaybe<number | string>;
  "lighting-color"?: StateMaybe<string>;
  "marker-end"?: StateMaybe<string>;
  "marker-mid"?: StateMaybe<string>;
  "marker-start"?: StateMaybe<string>;
  mask?: StateMaybe<string>;
  opacity?: StateMaybe<number | string | "inherit">;
  overflow?: StateMaybe<"visible" | "hidden" | "scroll" | "auto" | "inherit">;
  pathLength?: StateMaybe<string | number>;
  "pointer-events"?: StateMaybe<"bounding-box" | "visiblePainted" | "visibleFill" | "visibleStroke" | "visible" | "painted" | "color" | "fill" | "stroke" | "all" | "none" | "inherit">;
  "shape-rendering"?: StateMaybe<"auto" | "optimizeSpeed" | "crispEdges" | "geometricPrecision" | "inherit">;
  "stop-color"?: StateMaybe<string>;
  "stop-opacity"?: StateMaybe<number | string | "inherit">;
  stroke?: StateMaybe<string>;
  "stroke-dasharray"?: StateMaybe<string>;
  "stroke-dashoffset"?: StateMaybe<number | string>;
  "stroke-linecap"?: StateMaybe<"butt" | "round" | "square" | "inherit">;
  "stroke-linejoin"?: StateMaybe<"arcs" | "bevel" | "miter" | "miter-clip" | "round" | "inherit">;
  "stroke-miterlimit"?: StateMaybe<number | string | "inherit">;
  "stroke-opacity"?: StateMaybe<number | string | "inherit">;
  "stroke-width"?: StateMaybe<number | string>;
  "text-anchor"?: StateMaybe<"start" | "middle" | "end" | "inherit">;
  "text-decoration"?: StateMaybe<"none" | "underline" | "overline" | "line-through" | "blink" | "inherit">;
  "text-rendering"?: StateMaybe<"auto" | "optimizeSpeed" | "optimizeLegibility" | "geometricPrecision" | "inherit">;
  "unicode-bidi"?: StateMaybe<string>;
  visibility?: StateMaybe<"visible" | "hidden" | "collapse" | "inherit">;
  "word-spacing"?: StateMaybe<number | string>;
  "writing-mode"?: StateMaybe<"lr-tb" | "rl-tb" | "tb-rl" | "lr" | "rl" | "tb" | "inherit">;
}
interface AnimationElementSVGAttributes<T> extends CoreSVGAttributes<T>, ExternalResourceSVGAttributes, ConditionalProcessingSVGAttributes {}
interface ContainerElementSVGAttributes<T> extends CoreSVGAttributes<T>, ShapeElementSVGAttributes<T>, Pick<PresentationSVGAttributes, "clip-path" | "mask" | "cursor" | "opacity" | "filter" | "enable-background" | "color-interpolation" | "color-rendering"> {}
interface FilterPrimitiveElementSVGAttributes<T> extends CoreSVGAttributes<T>, Pick<PresentationSVGAttributes, "color-interpolation-filters"> {
  x?: StateMaybe<number | string>;
  y?: StateMaybe<number | string>;
  width?: StateMaybe<number | string>;
  height?: StateMaybe<number | string>;
  result?: StateMaybe<string>;
}
interface SingleInputFilterSVGAttributes {
  in?: StateMaybe<string>;
}
interface DoubleInputFilterSVGAttributes {
  in?: StateMaybe<string>;
  in2?: StateMaybe<string>;
}
interface FitToViewBoxSVGAttributes {
  viewBox?: StateMaybe<string>;
  preserveAspectRatio?: StateMaybe<SVGPreserveAspectRatio>;
}
interface GradientElementSVGAttributes<T> extends CoreSVGAttributes<T>, ExternalResourceSVGAttributes, StylableSVGAttributes {
  gradientUnits?: StateMaybe<SVGUnits>;
  gradientTransform?: StateMaybe<string>;
  spreadMethod?: StateMaybe<"pad" | "reflect" | "repeat">;
  href?: StateMaybe<string>;
}
interface GraphicsElementSVGAttributes<T> extends CoreSVGAttributes<T>, Pick<PresentationSVGAttributes, "clip-rule" | "mask" | "pointer-events" | "cursor" | "opacity" | "filter" | "display" | "visibility" | "color-interpolation" | "color-rendering"> {}
interface LightSourceElementSVGAttributes<T> extends CoreSVGAttributes<T> {}
interface NewViewportSVGAttributes<T> extends CoreSVGAttributes<T>, Pick<PresentationSVGAttributes, "overflow" | "clip"> {
  viewBox?: StateMaybe<string>;
}
interface ShapeElementSVGAttributes<T> extends CoreSVGAttributes<T>, Pick<PresentationSVGAttributes, "color" | "fill" | "fill-rule" | "fill-opacity" | "stroke" | "stroke-width" | "stroke-linecap" | "stroke-linejoin" | "stroke-miterlimit" | "stroke-dasharray" | "stroke-dashoffset" | "stroke-opacity" | "shape-rendering" | "pathLength"> {}
interface TextContentElementSVGAttributes<T> extends CoreSVGAttributes<T>, Pick<PresentationSVGAttributes, "font-family" | "font-style" | "font-variant" | "font-weight" | "font-stretch" | "font-size" | "font-size-adjust" | "kerning" | "letter-spacing" | "word-spacing" | "text-decoration" | "glyph-orientation-horizontal" | "glyph-orientation-vertical" | "direction" | "unicode-bidi" | "text-anchor" | "dominant-baseline" | "color" | "fill" | "fill-rule" | "fill-opacity" | "stroke" | "stroke-width" | "stroke-linecap" | "stroke-linejoin" | "stroke-miterlimit" | "stroke-dasharray" | "stroke-dashoffset" | "stroke-opacity"> {}
interface ZoomAndPanSVGAttributes {
  zoomAndPan?: StateMaybe<"disable" | "magnify">;
}
interface AnimateSVGAttributes<T> extends AnimationElementSVGAttributes<T>, AnimationAttributeTargetSVGAttributes, AnimationTimingSVGAttributes, AnimationValueSVGAttributes, AnimationAdditionSVGAttributes, Pick<PresentationSVGAttributes, "color-interpolation" | "color-rendering"> {}
interface AnimateMotionSVGAttributes<T> extends AnimationElementSVGAttributes<T>, AnimationTimingSVGAttributes, AnimationValueSVGAttributes, AnimationAdditionSVGAttributes {
  path?: StateMaybe<string>;
  keyPoints?: StateMaybe<string>;
  rotate?: StateMaybe<number | string | "auto" | "auto-reverse">;
  origin?: StateMaybe<"default">;
}
interface AnimateTransformSVGAttributes<T> extends AnimationElementSVGAttributes<T>, AnimationAttributeTargetSVGAttributes, AnimationTimingSVGAttributes, AnimationValueSVGAttributes, AnimationAdditionSVGAttributes {
  type?: StateMaybe<"translate" | "scale" | "rotate" | "skewX" | "skewY">;
}
interface CircleSVGAttributes<T> extends GraphicsElementSVGAttributes<T>, ShapeElementSVGAttributes<T>, ConditionalProcessingSVGAttributes, StylableSVGAttributes, TransformableSVGAttributes {
  cx?: StateMaybe<number | string>;
  cy?: StateMaybe<number | string>;
  r?: StateMaybe<number | string>;
}
interface ClipPathSVGAttributes<T> extends CoreSVGAttributes<T>, ConditionalProcessingSVGAttributes, ExternalResourceSVGAttributes, StylableSVGAttributes, TransformableSVGAttributes, Pick<PresentationSVGAttributes, "clip-path"> {
  clipPathUnits?: StateMaybe<SVGUnits>;
}
interface DefsSVGAttributes<T> extends ContainerElementSVGAttributes<T>, ConditionalProcessingSVGAttributes, ExternalResourceSVGAttributes, StylableSVGAttributes, TransformableSVGAttributes {}
interface DescSVGAttributes<T> extends CoreSVGAttributes<T>, StylableSVGAttributes {}
interface EllipseSVGAttributes<T> extends GraphicsElementSVGAttributes<T>, ShapeElementSVGAttributes<T>, ConditionalProcessingSVGAttributes, ExternalResourceSVGAttributes, StylableSVGAttributes, TransformableSVGAttributes {
  cx?: StateMaybe<number | string>;
  cy?: StateMaybe<number | string>;
  rx?: StateMaybe<number | string>;
  ry?: StateMaybe<number | string>;
}
interface FeBlendSVGAttributes<T> extends FilterPrimitiveElementSVGAttributes<T>, DoubleInputFilterSVGAttributes, StylableSVGAttributes {
  mode?: StateMaybe<"normal" | "multiply" | "screen" | "darken" | "lighten">;
}
interface FeColorMatrixSVGAttributes<T> extends FilterPrimitiveElementSVGAttributes<T>, SingleInputFilterSVGAttributes, StylableSVGAttributes {
  type?: StateMaybe<"matrix" | "saturate" | "hueRotate" | "luminanceToAlpha">;
  values?: StateMaybe<string>;
}
interface FeComponentTransferSVGAttributes<T> extends FilterPrimitiveElementSVGAttributes<T>, SingleInputFilterSVGAttributes, StylableSVGAttributes {}
interface FeCompositeSVGAttributes<T> extends FilterPrimitiveElementSVGAttributes<T>, DoubleInputFilterSVGAttributes, StylableSVGAttributes {
  operator?: StateMaybe<"over" | "in" | "out" | "atop" | "xor" | "arithmetic">;
  k1?: StateMaybe<number | string>;
  k2?: StateMaybe<number | string>;
  k3?: StateMaybe<number | string>;
  k4?: StateMaybe<number | string>;
}
interface FeConvolveMatrixSVGAttributes<T> extends FilterPrimitiveElementSVGAttributes<T>, SingleInputFilterSVGAttributes, StylableSVGAttributes {
  order?: StateMaybe<number | string>;
  kernelMatrix?: StateMaybe<string>;
  divisor?: StateMaybe<number | string>;
  bias?: StateMaybe<number | string>;
  targetX?: StateMaybe<number | string>;
  targetY?: StateMaybe<number | string>;
  edgeMode?: StateMaybe<"duplicate" | "wrap" | "none">;
  kernelUnitLength?: StateMaybe<number | string>;
  preserveAlpha?: StateMaybe<"true" | "false">;
}
interface FeDiffuseLightingSVGAttributes<T> extends FilterPrimitiveElementSVGAttributes<T>, SingleInputFilterSVGAttributes, StylableSVGAttributes, Pick<PresentationSVGAttributes, "color" | "lighting-color"> {
  surfaceScale?: StateMaybe<number | string>;
  diffuseConstant?: StateMaybe<number | string>;
  kernelUnitLength?: StateMaybe<number | string>;
}
interface FeDisplacementMapSVGAttributes<T> extends FilterPrimitiveElementSVGAttributes<T>, DoubleInputFilterSVGAttributes, StylableSVGAttributes {
  scale?: StateMaybe<number | string>;
  xChannelSelector?: StateMaybe<"R" | "G" | "B" | "A">;
  yChannelSelector?: StateMaybe<"R" | "G" | "B" | "A">;
}
interface FeDistantLightSVGAttributes<T> extends LightSourceElementSVGAttributes<T> {
  azimuth?: StateMaybe<number | string>;
  elevation?: StateMaybe<number | string>;
}
interface FeDropShadowSVGAttributes<T> extends CoreSVGAttributes<T>, FilterPrimitiveElementSVGAttributes<T>, StylableSVGAttributes, Pick<PresentationSVGAttributes, "color" | "flood-color" | "flood-opacity"> {
  dx?: StateMaybe<number | string>;
  dy?: StateMaybe<number | string>;
  stdDeviation?: StateMaybe<number | string>;
}
interface FeFloodSVGAttributes<T> extends FilterPrimitiveElementSVGAttributes<T>, StylableSVGAttributes, Pick<PresentationSVGAttributes, "color" | "flood-color" | "flood-opacity"> {}
interface FeFuncSVGAttributes<T> extends CoreSVGAttributes<T> {
  type?: "identity" | "table" | "discrete" | "linear" | "gamma";
  tableValues?: StateMaybe<string>;
  slope?: StateMaybe<number | string>;
  intercept?: StateMaybe<number | string>;
  amplitude?: StateMaybe<number | string>;
  exponent?: StateMaybe<number | string>;
  offset?: StateMaybe<number | string>;
}
interface FeGaussianBlurSVGAttributes<T> extends FilterPrimitiveElementSVGAttributes<T>, SingleInputFilterSVGAttributes, StylableSVGAttributes {
  stdDeviation?: StateMaybe<number | string>;
}
interface FeImageSVGAttributes<T> extends FilterPrimitiveElementSVGAttributes<T>, ExternalResourceSVGAttributes, StylableSVGAttributes {
  preserveAspectRatio?: StateMaybe<SVGPreserveAspectRatio>;
  href?: StateMaybe<string>;
}
interface FeMergeSVGAttributes<T> extends FilterPrimitiveElementSVGAttributes<T>, StylableSVGAttributes {}
interface FeMergeNodeSVGAttributes<T> extends CoreSVGAttributes<T>, SingleInputFilterSVGAttributes {}
interface FeMorphologySVGAttributes<T> extends FilterPrimitiveElementSVGAttributes<T>, SingleInputFilterSVGAttributes, StylableSVGAttributes {
  operator?: StateMaybe<"erode" | "dilate">;
  radius?: StateMaybe<number | string>;
}
interface FeOffsetSVGAttributes<T> extends FilterPrimitiveElementSVGAttributes<T>, SingleInputFilterSVGAttributes, StylableSVGAttributes {
  dx?: StateMaybe<number | string>;
  dy?: StateMaybe<number | string>;
}
interface FePointLightSVGAttributes<T> extends LightSourceElementSVGAttributes<T> {
  x?: StateMaybe<number | string>;
  y?: StateMaybe<number | string>;
  z?: StateMaybe<number | string>;
}
interface FeSpecularLightingSVGAttributes<T> extends FilterPrimitiveElementSVGAttributes<T>, SingleInputFilterSVGAttributes, StylableSVGAttributes, Pick<PresentationSVGAttributes, "color" | "lighting-color"> {
  surfaceScale?: StateMaybe<string>;
  specularConstant?: StateMaybe<string>;
  specularExponent?: StateMaybe<string>;
  kernelUnitLength?: StateMaybe<number | string>;
}
interface FeSpotLightSVGAttributes<T> extends LightSourceElementSVGAttributes<T> {
  x?: StateMaybe<number | string>;
  y?: StateMaybe<number | string>;
  z?: StateMaybe<number | string>;
  pointsAtX?: StateMaybe<number | string>;
  pointsAtY?: StateMaybe<number | string>;
  pointsAtZ?: StateMaybe<number | string>;
  specularExponent?: StateMaybe<number | string>;
  limitingConeAngle?: StateMaybe<number | string>;
}
interface FeTileSVGAttributes<T> extends FilterPrimitiveElementSVGAttributes<T>, SingleInputFilterSVGAttributes, StylableSVGAttributes {}
interface FeTurbulanceSVGAttributes<T> extends FilterPrimitiveElementSVGAttributes<T>, StylableSVGAttributes {
  baseFrequency?: StateMaybe<number | string>;
  numOctaves?: StateMaybe<number | string>;
  seed?: StateMaybe<number | string>;
  stitchTiles?: StateMaybe<"stitch" | "noStitch">;
  type?: StateMaybe<"fractalNoise" | "turbulence">;
}
interface FilterSVGAttributes<T> extends CoreSVGAttributes<T>, ExternalResourceSVGAttributes, StylableSVGAttributes {
  filterUnits?: StateMaybe<SVGUnits>;
  primitiveUnits?: StateMaybe<SVGUnits>;
  x?: StateMaybe<number | string>;
  y?: StateMaybe<number | string>;
  width?: StateMaybe<number | string>;
  height?: StateMaybe<number | string>;
  filterRes?: StateMaybe<number | string>;
}
interface ForeignObjectSVGAttributes<T> extends NewViewportSVGAttributes<T>, ConditionalProcessingSVGAttributes, ExternalResourceSVGAttributes, StylableSVGAttributes, TransformableSVGAttributes, Pick<PresentationSVGAttributes, "display" | "visibility"> {
  x?: StateMaybe<number | string>;
  y?: StateMaybe<number | string>;
  width?: StateMaybe<number | string>;
  height?: StateMaybe<number | string>;
}
interface GSVGAttributes<T> extends ContainerElementSVGAttributes<T>, ConditionalProcessingSVGAttributes, ExternalResourceSVGAttributes, StylableSVGAttributes, TransformableSVGAttributes, Pick<PresentationSVGAttributes, "display" | "visibility"> {}
interface ImageSVGAttributes<T> extends NewViewportSVGAttributes<T>, GraphicsElementSVGAttributes<T>, ConditionalProcessingSVGAttributes, StylableSVGAttributes, TransformableSVGAttributes, Pick<PresentationSVGAttributes, "color-profile" | "image-rendering"> {
  x?: StateMaybe<number | string>;
  y?: StateMaybe<number | string>;
  width?: StateMaybe<number | string>;
  height?: StateMaybe<number | string>;
  preserveAspectRatio?: StateMaybe<ImagePreserveAspectRatio>;
  href?: StateMaybe<string>;
}
interface LineSVGAttributes<T> extends GraphicsElementSVGAttributes<T>, ShapeElementSVGAttributes<T>, ConditionalProcessingSVGAttributes, ExternalResourceSVGAttributes, StylableSVGAttributes, TransformableSVGAttributes, Pick<PresentationSVGAttributes, "marker-start" | "marker-mid" | "marker-end"> {
  x1?: StateMaybe<number | string>;
  y1?: StateMaybe<number | string>;
  x2?: StateMaybe<number | string>;
  y2?: StateMaybe<number | string>;
}
interface LinearGradientSVGAttributes<T> extends GradientElementSVGAttributes<T> {
  x1?: StateMaybe<number | string>;
  x2?: StateMaybe<number | string>;
  y1?: StateMaybe<number | string>;
  y2?: StateMaybe<number | string>;
}
interface MarkerSVGAttributes<T> extends ContainerElementSVGAttributes<T>, ExternalResourceSVGAttributes, StylableSVGAttributes, FitToViewBoxSVGAttributes, Pick<PresentationSVGAttributes, "overflow" | "clip"> {
  markerUnits?: StateMaybe<"strokeWidth" | "userSpaceOnUse">;
  refX?: StateMaybe<number | string>;
  refY?: StateMaybe<number | string>;
  markerWidth?: StateMaybe<number | string>;
  markerHeight?: StateMaybe<number | string>;
  orient?: StateMaybe<string>;
}
interface MaskSVGAttributes<T> extends Omit<ContainerElementSVGAttributes<T>, "opacity" | "filter">, ConditionalProcessingSVGAttributes, ExternalResourceSVGAttributes, StylableSVGAttributes {
  maskUnits?: StateMaybe<SVGUnits>;
  maskContentUnits?: StateMaybe<SVGUnits>;
  x?: StateMaybe<number | string>;
  y?: StateMaybe<number | string>;
  width?: StateMaybe<number | string>;
  height?: StateMaybe<number | string>;
}
interface MetadataSVGAttributes<T> extends CoreSVGAttributes<T> {}
interface MPathSVGAttributes<T> extends CoreSVGAttributes<T> {}
interface PathSVGAttributes<T> extends GraphicsElementSVGAttributes<T>, ShapeElementSVGAttributes<T>, ConditionalProcessingSVGAttributes, ExternalResourceSVGAttributes, StylableSVGAttributes, TransformableSVGAttributes, Pick<PresentationSVGAttributes, "marker-start" | "marker-mid" | "marker-end"> {
  d?: StateMaybe<string>;
  pathLength?: StateMaybe<number | string>;
}
interface PatternSVGAttributes<T> extends ContainerElementSVGAttributes<T>, ConditionalProcessingSVGAttributes, ExternalResourceSVGAttributes, StylableSVGAttributes, FitToViewBoxSVGAttributes, Pick<PresentationSVGAttributes, "overflow" | "clip"> {
  x?: StateMaybe<number | string>;
  y?: StateMaybe<number | string>;
  width?: StateMaybe<number | string>;
  height?: StateMaybe<number | string>;
  patternUnits?: StateMaybe<SVGUnits>;
  patternContentUnits?: StateMaybe<SVGUnits>;
  patternTransform?: StateMaybe<string>;
  href?: string;
}
interface PolygonSVGAttributes<T> extends GraphicsElementSVGAttributes<T>, ShapeElementSVGAttributes<T>, ConditionalProcessingSVGAttributes, ExternalResourceSVGAttributes, StylableSVGAttributes, TransformableSVGAttributes, Pick<PresentationSVGAttributes, "marker-start" | "marker-mid" | "marker-end"> {
  points?: StateMaybe<string>;
}
interface PolylineSVGAttributes<T> extends GraphicsElementSVGAttributes<T>, ShapeElementSVGAttributes<T>, ConditionalProcessingSVGAttributes, ExternalResourceSVGAttributes, StylableSVGAttributes, TransformableSVGAttributes, Pick<PresentationSVGAttributes, "marker-start" | "marker-mid" | "marker-end"> {
  points?: StateMaybe<string>;
}
interface RadialGradientSVGAttributes<T> extends GradientElementSVGAttributes<T> {
  cx?: StateMaybe<number | string>;
  cy?: StateMaybe<number | string>;
  r?: StateMaybe<number | string>;
  fx?: StateMaybe<number | string>;
  fy?: StateMaybe<number | string>;
}
interface RectSVGAttributes<T> extends GraphicsElementSVGAttributes<T>, ShapeElementSVGAttributes<T>, ConditionalProcessingSVGAttributes, ExternalResourceSVGAttributes, StylableSVGAttributes, TransformableSVGAttributes {
  x?: StateMaybe<number | string>;
  y?: StateMaybe<number | string>;
  width?: StateMaybe<number | string>;
  height?: StateMaybe<number | string>;
  rx?: StateMaybe<number | string>;
  ry?: StateMaybe<number | string>;
}
interface SetSVGAttributes<T> extends CoreSVGAttributes<T>, StylableSVGAttributes, AnimationTimingSVGAttributes {}
interface StopSVGAttributes<T> extends CoreSVGAttributes<T>, StylableSVGAttributes, Pick<PresentationSVGAttributes, "color" | "stop-color" | "stop-opacity"> {
  offset?: StateMaybe<number | string>;
}
interface SvgSVGAttributes<T> extends ContainerElementSVGAttributes<T>, NewViewportSVGAttributes<T>, ConditionalProcessingSVGAttributes, ExternalResourceSVGAttributes, StylableSVGAttributes, FitToViewBoxSVGAttributes, ZoomAndPanSVGAttributes, PresentationSVGAttributes {
  version?: StateMaybe<string>;
  baseProfile?: StateMaybe<string>;
  x?: StateMaybe<number | string>;
  y?: StateMaybe<number | string>;
  width?: StateMaybe<number | string>;
  height?: StateMaybe<number | string>;
  contentScriptType?: StateMaybe<string>;
  contentStyleType?: StateMaybe<string>;
  xmlns?: StateMaybe<string>;
  "xmlns:xlink"?: StateMaybe<string>;
}
interface SwitchSVGAttributes<T> extends ContainerElementSVGAttributes<T>, ConditionalProcessingSVGAttributes, ExternalResourceSVGAttributes, StylableSVGAttributes, TransformableSVGAttributes, Pick<PresentationSVGAttributes, "display" | "visibility"> {}
interface SymbolSVGAttributes<T> extends ContainerElementSVGAttributes<T>, NewViewportSVGAttributes<T>, ExternalResourceSVGAttributes, StylableSVGAttributes, FitToViewBoxSVGAttributes {
  width?: StateMaybe<number | string>;
  height?: StateMaybe<number | string>;
  preserveAspectRatio?: StateMaybe<SVGPreserveAspectRatio>;
  refX?: StateMaybe<number | string>;
  refY?: StateMaybe<number | string>;
  viewBox?: StateMaybe<string>;
  x?: StateMaybe<number | string>;
  y?: StateMaybe<number | string>;
}
interface TextSVGAttributes<T> extends TextContentElementSVGAttributes<T>, GraphicsElementSVGAttributes<T>, ConditionalProcessingSVGAttributes, ExternalResourceSVGAttributes, StylableSVGAttributes, TransformableSVGAttributes, Pick<PresentationSVGAttributes, "writing-mode" | "text-rendering"> {
  x?: StateMaybe<number | string>;
  y?: StateMaybe<number | string>;
  dx?: StateMaybe<number | string>;
  dy?: StateMaybe<number | string>;
  rotate?: StateMaybe<number | string>;
  textLength?: StateMaybe<number | string>;
  lengthAdjust?: StateMaybe<"spacing" | "spacingAndGlyphs">;
}
interface TextPathSVGAttributes<T> extends TextContentElementSVGAttributes<T>, ConditionalProcessingSVGAttributes, ExternalResourceSVGAttributes, StylableSVGAttributes, Pick<PresentationSVGAttributes, "alignment-baseline" | "baseline-shift" | "display" | "visibility"> {
  startOffset?: StateMaybe<number | string>;
  method?: StateMaybe<"align" | "stretch">;
  spacing?: StateMaybe<"auto" | "exact">;
  href?: StateMaybe<string>;
}
interface TSpanSVGAttributes<T> extends TextContentElementSVGAttributes<T>, ConditionalProcessingSVGAttributes, ExternalResourceSVGAttributes, StylableSVGAttributes, Pick<PresentationSVGAttributes, "alignment-baseline" | "baseline-shift" | "display" | "visibility"> {
  x?: StateMaybe<number | string>;
  y?: StateMaybe<number | string>;
  dx?: StateMaybe<number | string>;
  dy?: StateMaybe<number | string>;
  rotate?: StateMaybe<number | string>;
  textLength?: StateMaybe<number | string>;
  lengthAdjust?: StateMaybe<"spacing" | "spacingAndGlyphs">;
}
/** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use */
interface UseSVGAttributes<T> extends CoreSVGAttributes<T>, StylableSVGAttributes, ConditionalProcessingSVGAttributes, GraphicsElementSVGAttributes<T>, PresentationSVGAttributes, ExternalResourceSVGAttributes, TransformableSVGAttributes {
  x?: StateMaybe<number | string>;
  y?: StateMaybe<number | string>;
  width?: StateMaybe<number | string>;
  height?: StateMaybe<number | string>;
  href?: StateMaybe<string>;
}
interface ViewSVGAttributes<T> extends CoreSVGAttributes<T>, ExternalResourceSVGAttributes, FitToViewBoxSVGAttributes, ZoomAndPanSVGAttributes {
  viewTarget?: StateMaybe<string>;
}
/** @export type {HTMLElementTagNameMap} */
interface HTMLElementTags {
  [key: Uppercase<`${string}-${string}`>]: CustomElementHTMLAttributes<HTMLElement>;
  a: AnchorHTMLAttributes<HTMLAnchorElement>;
  abbr: HTMLAttributes<HTMLElement>;
  address: HTMLAttributes<HTMLElement>;
  area: AreaHTMLAttributes<HTMLAreaElement>;
  article: HTMLAttributes<HTMLElement>;
  aside: HTMLAttributes<HTMLElement>;
  audio: AudioHTMLAttributes<HTMLAudioElement>;
  b: HTMLAttributes<HTMLElement>;
  base: BaseHTMLAttributes<HTMLBaseElement>;
  bdi: HTMLAttributes<HTMLElement>;
  bdo: HTMLAttributes<HTMLElement>;
  blockquote: BlockquoteHTMLAttributes<HTMLElement>;
  body: HTMLAttributes<HTMLBodyElement>;
  br: HTMLAttributes<HTMLBRElement>;
  button: ButtonHTMLAttributes<HTMLButtonElement>;
  canvas: CanvasHTMLAttributes<HTMLCanvasElement>;
  caption: HTMLAttributes<HTMLElement>;
  cite: HTMLAttributes<HTMLElement>;
  code: HTMLAttributes<HTMLElement>;
  col: ColHTMLAttributes<HTMLTableColElement>;
  colgroup: ColgroupHTMLAttributes<HTMLTableColElement>;
  data: DataHTMLAttributes<HTMLElement>;
  datalist: HTMLAttributes<HTMLDataListElement>;
  dd: HTMLAttributes<HTMLElement>;
  del: HTMLAttributes<HTMLElement>;
  details: DetailsHtmlAttributes<HTMLDetailsElement>;
  dfn: HTMLAttributes<HTMLElement>;
  dialog: DialogHtmlAttributes<HTMLDialogElement>;
  div: HTMLAttributes<HTMLDivElement>;
  dl: HTMLAttributes<HTMLDListElement>;
  dt: HTMLAttributes<HTMLElement>;
  em: HTMLAttributes<HTMLElement>;
  embed: EmbedHTMLAttributes<HTMLEmbedElement>;
  fieldset: FieldsetHTMLAttributes<HTMLFieldSetElement>;
  figcaption: HTMLAttributes<HTMLElement>;
  figure: HTMLAttributes<HTMLElement>;
  footer: HTMLAttributes<HTMLElement>;
  form: FormHTMLAttributes<HTMLFormElement>;
  h1: HTMLAttributes<HTMLHeadingElement>;
  h2: HTMLAttributes<HTMLHeadingElement>;
  h3: HTMLAttributes<HTMLHeadingElement>;
  h4: HTMLAttributes<HTMLHeadingElement>;
  h5: HTMLAttributes<HTMLHeadingElement>;
  h6: HTMLAttributes<HTMLHeadingElement>;
  head: HTMLAttributes<HTMLHeadElement>;
  header: HTMLAttributes<HTMLElement>;
  hgroup: HTMLAttributes<HTMLElement>;
  hr: HTMLAttributes<HTMLHRElement>;
  html: HTMLAttributes<HTMLHtmlElement>;
  i: HTMLAttributes<HTMLElement>;
  iframe: IframeHTMLAttributes<HTMLIFrameElement>;
  img: ImgHTMLAttributes<HTMLImageElement>;
  input: InputHTMLAttributes<HTMLInputElement>;
  ins: InsHTMLAttributes<HTMLModElement>;
  kbd: HTMLAttributes<HTMLElement>;
  label: LabelHTMLAttributes<HTMLLabelElement>;
  legend: HTMLAttributes<HTMLLegendElement>;
  li: LiHTMLAttributes<HTMLLIElement>;
  link: LinkHTMLAttributes<HTMLLinkElement>;
  main: HTMLAttributes<HTMLElement>;
  map: MapHTMLAttributes<HTMLMapElement>;
  mark: HTMLAttributes<HTMLElement>;
  menu: MenuHTMLAttributes<HTMLElement>;
  meta: MetaHTMLAttributes<HTMLMetaElement>;
  meter: MeterHTMLAttributes<HTMLElement>;
  nav: HTMLAttributes<HTMLElement>;
  noscript: HTMLAttributes<HTMLElement>;
  object: ObjectHTMLAttributes<HTMLObjectElement>;
  ol: OlHTMLAttributes<HTMLOListElement>;
  optgroup: OptgroupHTMLAttributes<HTMLOptGroupElement>;
  option: OptionHTMLAttributes<HTMLOptionElement>;
  output: OutputHTMLAttributes<HTMLElement>;
  p: HTMLAttributes<HTMLParagraphElement>;
  picture: HTMLAttributes<HTMLElement>;
  pre: HTMLAttributes<HTMLPreElement>;
  progress: ProgressHTMLAttributes<HTMLProgressElement>;
  q: QuoteHTMLAttributes<HTMLQuoteElement>;
  rp: HTMLAttributes<HTMLElement>;
  rt: HTMLAttributes<HTMLElement>;
  ruby: HTMLAttributes<HTMLElement>;
  s: HTMLAttributes<HTMLElement>;
  samp: HTMLAttributes<HTMLElement>;
  script: ScriptHTMLAttributes<HTMLScriptElement>;
  search: HTMLAttributes<HTMLElement>;
  section: HTMLAttributes<HTMLElement>;
  select: SelectHTMLAttributes<HTMLSelectElement>;
  slot: HTMLSlotElementAttributes;
  small: HTMLAttributes<HTMLElement>;
  source: SourceHTMLAttributes<HTMLSourceElement>;
  span: HTMLAttributes<HTMLSpanElement>;
  strong: HTMLAttributes<HTMLElement>;
  style: StyleHTMLAttributes<HTMLStyleElement>;
  sub: HTMLAttributes<HTMLElement>;
  summary: HTMLAttributes<HTMLElement>;
  sup: HTMLAttributes<HTMLElement>;
  table: HTMLAttributes<HTMLTableElement>;
  tbody: HTMLAttributes<HTMLTableSectionElement>;
  td: TdHTMLAttributes<HTMLTableCellElement>;
  template: TemplateHTMLAttributes<HTMLTemplateElement>;
  textarea: TextareaHTMLAttributes<HTMLTextAreaElement>;
  tfoot: HTMLAttributes<HTMLTableSectionElement>;
  th: ThHTMLAttributes<HTMLTableCellElement>;
  thead: HTMLAttributes<HTMLTableSectionElement>;
  time: TimeHTMLAttributes<HTMLElement>;
  title: HTMLAttributes<HTMLTitleElement>;
  tr: HTMLAttributes<HTMLTableRowElement>;
  track: TrackHTMLAttributes<HTMLTrackElement>;
  u: HTMLAttributes<HTMLElement>;
  ul: HTMLAttributes<HTMLUListElement>;
  var: HTMLAttributes<HTMLElement>;
  video: VideoHTMLAttributes<HTMLVideoElement>;
  wbr: HTMLAttributes<HTMLElement>;
}
/** @export type {HTMLElementDeprecatedTagNameMap} */
interface HTMLElementDeprecatedTags {
  big: HTMLAttributes<HTMLElement>;
  keygen: KeygenHTMLAttributes<HTMLElement>;
  menuitem: HTMLAttributes<HTMLElement>;
  noindex: HTMLAttributes<HTMLElement>;
  param: ParamHTMLAttributes<HTMLParamElement>;
}
/** @export type {SVGElementTagNameMap} */
interface SVGElementTags {
  animate: AnimateSVGAttributes<SVGAnimateElement>;
  animateMotion: AnimateMotionSVGAttributes<SVGAnimateMotionElement>;
  animateTransform: AnimateTransformSVGAttributes<SVGAnimateTransformElement>;
  circle: CircleSVGAttributes<SVGCircleElement>;
  clipPath: ClipPathSVGAttributes<SVGClipPathElement>;
  defs: DefsSVGAttributes<SVGDefsElement>;
  desc: DescSVGAttributes<SVGDescElement>;
  ellipse: EllipseSVGAttributes<SVGEllipseElement>;
  feBlend: FeBlendSVGAttributes<SVGFEBlendElement>;
  feColorMatrix: FeColorMatrixSVGAttributes<SVGFEColorMatrixElement>;
  feComponentTransfer: FeComponentTransferSVGAttributes<SVGFEComponentTransferElement>;
  feComposite: FeCompositeSVGAttributes<SVGFECompositeElement>;
  feConvolveMatrix: FeConvolveMatrixSVGAttributes<SVGFEConvolveMatrixElement>;
  feDiffuseLighting: FeDiffuseLightingSVGAttributes<SVGFEDiffuseLightingElement>;
  feDisplacementMap: FeDisplacementMapSVGAttributes<SVGFEDisplacementMapElement>;
  feDistantLight: FeDistantLightSVGAttributes<SVGFEDistantLightElement>;
  feDropShadow: FeDropShadowSVGAttributes<SVGFEDropShadowElement>;
  feFlood: FeFloodSVGAttributes<SVGFEFloodElement>;
  feFuncA: FeFuncSVGAttributes<SVGFEFuncAElement>;
  feFuncB: FeFuncSVGAttributes<SVGFEFuncBElement>;
  feFuncG: FeFuncSVGAttributes<SVGFEFuncGElement>;
  feFuncR: FeFuncSVGAttributes<SVGFEFuncRElement>;
  feGaussianBlur: FeGaussianBlurSVGAttributes<SVGFEGaussianBlurElement>;
  feImage: FeImageSVGAttributes<SVGFEImageElement>;
  feMerge: FeMergeSVGAttributes<SVGFEMergeElement>;
  feMergeNode: FeMergeNodeSVGAttributes<SVGFEMergeNodeElement>;
  feMorphology: FeMorphologySVGAttributes<SVGFEMorphologyElement>;
  feOffset: FeOffsetSVGAttributes<SVGFEOffsetElement>;
  fePointLight: FePointLightSVGAttributes<SVGFEPointLightElement>;
  feSpecularLighting: FeSpecularLightingSVGAttributes<SVGFESpecularLightingElement>;
  feSpotLight: FeSpotLightSVGAttributes<SVGFESpotLightElement>;
  feTile: FeTileSVGAttributes<SVGFETileElement>;
  feTurbulence: FeTurbulanceSVGAttributes<SVGFETurbulenceElement>;
  filter: FilterSVGAttributes<SVGFilterElement>;
  foreignObject: ForeignObjectSVGAttributes<SVGForeignObjectElement>;
  g: GSVGAttributes<SVGGElement>;
  image: ImageSVGAttributes<SVGImageElement>;
  line: LineSVGAttributes<SVGLineElement>;
  linearGradient: LinearGradientSVGAttributes<SVGLinearGradientElement>;
  marker: MarkerSVGAttributes<SVGMarkerElement>;
  mask: MaskSVGAttributes<SVGMaskElement>;
  metadata: MetadataSVGAttributes<SVGMetadataElement>;
  mpath: MPathSVGAttributes<SVGMPathElement>;
  path: PathSVGAttributes<SVGPathElement>;
  pattern: PatternSVGAttributes<SVGPatternElement>;
  polygon: PolygonSVGAttributes<SVGPolygonElement>;
  polyline: PolylineSVGAttributes<SVGPolylineElement>;
  radialGradient: RadialGradientSVGAttributes<SVGRadialGradientElement>;
  rect: RectSVGAttributes<SVGRectElement>;
  set: SetSVGAttributes<SVGSetElement>;
  stop: StopSVGAttributes<SVGStopElement>;
  svg: SvgSVGAttributes<SVGSVGElement>;
  switch: SwitchSVGAttributes<SVGSwitchElement>;
  symbol: SymbolSVGAttributes<SVGSymbolElement>;
  text: TextSVGAttributes<SVGTextElement>;
  textPath: TextPathSVGAttributes<SVGTextPathElement>;
  tspan: TSpanSVGAttributes<SVGTSpanElement>;
  use: UseSVGAttributes<SVGUseElement>;
  view: ViewSVGAttributes<SVGViewElement>;
}
/** @export type {MathMLElementTagNameMap} */
interface MathMLElementTags$1 {
  math: MathMLMathAttributes<MathMLElement>;
  mi: MathMLAnnotationAttributes<MathMLElement>;
  mn: MathMLAnnotationAttributes<MathMLElement>;
  mo: MathMLOperatorAttributes<MathMLElement>;
  ms: MathMLAnnotationAttributes<MathMLElement>;
  mtext: MathMLAnnotationAttributes<MathMLElement>;
  mspace: MathMLMspaceAttributes<MathMLElement>;
  mrow: MathMLRowAttributes<MathMLElement>;
  mfrac: MathMLFracAttributes<MathMLElement>;
  msqrt: MathMLRowAttributes<MathMLElement>;
  mroot: MathMLRowAttributes<MathMLElement>;
  mstyle: MathMLStyleAttributes<MathMLElement>;
  merror: MathMLRowAttributes<MathMLElement>;
  mpadded: MathMLPaddedAttributes<MathMLElement>;
  mphantom: MathMLRowAttributes<MathMLElement>;
  mfenced: MathMLFencedAttributes<MathMLElement>;
  mtable: MathMLTableAttributes<MathMLElement>;
  mtr: MathMLTableRowAttributes<MathMLElement>;
  mtd: MathMLTableCellAttributes<MathMLElement>;
  msub: MathMLScriptAttributes<MathMLElement>;
  msup: MathMLScriptAttributes<MathMLElement>;
  msubsup: MathMLScriptAttributes<MathMLElement>;
  mmultiscripts: MathMLMultiscriptsAttributes<MathMLElement>;
  mover: MathMLScriptAttributes<MathMLElement>;
  munder: MathMLScriptAttributes<MathMLElement>;
  munderover: MathMLScriptAttributes<MathMLElement>;
  semantics: MathMLSemanticsAttributes<MathMLElement>;
  annotation: MathMLAnnotationElementAttributes<MathMLElement>;
  "annotation-xml": MathMLAnnotationElementAttributes<MathMLElement>;
}
/** MathML-specific attribute interfaces */
interface MathMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
  class?: StateMaybe<string>;
  id?: StateMaybe<string>;
  style?: StateMaybe<CSSProperties | string | null>;
  dir?: StateMaybe<"ltr" | "rtl">;
  mathvariant?: StateMaybe<"normal" | "bold" | "italic" | "bold-italic" | "double-struck" | "bold-fraktur" | "script" | "bold-script" | "fraktur" | "sans-serif" | "bold-sans-serif" | "sans-serif-italic" | "sans-serif-bold-italic" | "monospace" | "initial" | "tailed" | "looped" | "stretched">;
}
interface MathMLMathAttributes<T> extends MathMLAttributes<T> {
  display?: StateMaybe<"block" | "inline">;
  alttext?: StateMaybe<string>;
  altimg?: StateMaybe<string>;
  "altimg-width"?: StateMaybe<string>;
  "altimg-height"?: StateMaybe<string>;
  "altimg-valign"?: StateMaybe<string>;
  mathbackground?: StateMaybe<string>;
  mathcolor?: StateMaybe<string>;
  mathsize?: StateMaybe<string>;
}
interface MathMLAnnotationAttributes<T> extends MathMLAttributes<T> {
  mathbackground?: StateMaybe<string>;
  mathcolor?: StateMaybe<string>;
}
interface MathMLOperatorAttributes<T> extends MathMLAnnotationAttributes<T> {
  form?: StateMaybe<"prefix" | "infix" | "postfix">;
  fence?: StateMaybe<"true" | "false">;
  separator?: StateMaybe<"true" | "false">;
  lspace?: StateMaybe<string>;
  rspace?: StateMaybe<string>;
  stretchy?: StateMaybe<"true" | "false">;
  symmetric?: StateMaybe<"true" | "false">;
  maxsize?: StateMaybe<string>;
  minsize?: StateMaybe<string>;
  largeop?: StateMaybe<"true" | "false">;
  movablelimits?: StateMaybe<"true" | "false">;
  accent?: StateMaybe<"true" | "false">;
}
interface MathMLMspaceAttributes<T> extends MathMLAnnotationAttributes<T> {
  width?: StateMaybe<string>;
  height?: StateMaybe<string>;
  depth?: StateMaybe<string>;
}
interface MathMLRowAttributes<T> extends MathMLAnnotationAttributes<T> {}
interface MathMLFracAttributes<T> extends MathMLAnnotationAttributes<T> {
  linethickness?: StateMaybe<string>;
  numalign?: StateMaybe<"left" | "center" | "right">;
  denomalign?: StateMaybe<"left" | "center" | "right">;
  bevelled?: StateMaybe<"true" | "false">;
}
interface MathMLStyleAttributes<T> extends MathMLAnnotationAttributes<T> {
  mathbackground?: StateMaybe<string>;
  mathcolor?: StateMaybe<string>;
  mathsize?: StateMaybe<string>;
  mathdepth?: StateMaybe<string>;
}
interface MathMLPaddedAttributes<T> extends MathMLAnnotationAttributes<T> {
  width?: StateMaybe<string>;
  height?: StateMaybe<string>;
  depth?: StateMaybe<string>;
  lspace?: StateMaybe<string>;
  voffset?: StateMaybe<string>;
}
interface MathMLFencedAttributes<T> extends MathMLAnnotationAttributes<T> {
  open?: StateMaybe<string>;
  close?: StateMaybe<string>;
  separators?: StateMaybe<string>;
}
interface MathMLTableAttributes<T> extends MathMLAnnotationAttributes<T> {
  align?: StateMaybe<"axis" | "baseline" | "center" | "top" | "bottom" | string>;
  rowalign?: StateMaybe<"top" | "bottom" | "center" | "baseline" | "axis">;
  columnalign?: StateMaybe<"left" | "center" | "right">;
  columnlines?: StateMaybe<"none" | "solid" | "dashed">;
  rowlines?: StateMaybe<"none" | "solid" | "dashed">;
  frame?: StateMaybe<"none" | "solid" | "dashed">;
  framespacing?: StateMaybe<string>;
  equalrows?: StateMaybe<"true" | "false">;
  equalcolumns?: StateMaybe<"true" | "false">;
  displaystyle?: StateMaybe<"true" | "false">;
  side?: StateMaybe<"left" | "right" | "leftoverlap" | "rightoverlap">;
  minlabelspacing?: StateMaybe<string>;
  width?: StateMaybe<string>;
}
interface MathMLTableRowAttributes<T> extends MathMLAnnotationAttributes<T> {
  rowalign?: StateMaybe<"top" | "bottom" | "center" | "baseline" | "axis">;
  columnalign?: StateMaybe<"left" | "center" | "right">;
}
interface MathMLTableCellAttributes<T> extends MathMLAnnotationAttributes<T> {
  rowspan?: StateMaybe<number | string>;
  columnspan?: StateMaybe<number | string>;
  rowalign?: StateMaybe<"top" | "bottom" | "center" | "baseline" | "axis">;
  columnalign?: StateMaybe<"left" | "center" | "right">;
}
interface MathMLScriptAttributes<T> extends MathMLAnnotationAttributes<T> {
  subscriptshift?: StateMaybe<string>;
  superscriptshift?: StateMaybe<string>;
}
interface MathMLMultiscriptsAttributes<T> extends MathMLAnnotationAttributes<T> {
  subscriptshift?: StateMaybe<string>;
  superscriptshift?: StateMaybe<string>;
}
interface MathMLSemanticsAttributes<T> extends MathMLAnnotationAttributes<T> {
  encoding?: StateMaybe<string>;
  src?: StateMaybe<string>;
}
interface MathMLAnnotationElementAttributes<T> extends MathMLAnnotationAttributes<T> {
  encoding?: StateMaybe<string>;
  src?: StateMaybe<string>;
}
interface DOMElementsMap extends HTMLElementTags, HTMLElementDeprecatedTags, SVGElementTags, MathMLElementTags$1 {}
//#endregion
//#region src/jsx/types.d.ts
declare global {
  export namespace JSX {
    type Element = ElementUnion;
    type Fragment = (props: {
      children: JSX.Element;
    }) => JSX.Element;
    interface IntrinsicElements extends DOMElementsMap {}
  }
} // export type { Fragment } from "./jsx.ts";
// export type Fragment = (props: { children: JSX.Element }) => JSX.Element;
//#endregion
//#region src/router/types.d.ts
type FileRouteConfig = {
  routePath: string;
  path: string;
  layouts?: LayoutFile[];
};
//#endregion
//#region src/plugin/types.d.ts
type PluginConfig$1 = {
  routesDir: string;
  extensions: string[];
};
//#endregion
//#region src/plugin/helpers.d.ts
/**
 * Get the file most probable route path for a given potential route.
 */
declare const fileToRoute: (file: string, routesDir: string) => string;
/**
 * Identify all files in a folder.
 */
declare const globFiles: (dir: string, extensions: string[]) => Promise<string[]>;
/**
 * Scan routes directory and generate routes.
 */
declare const scanRoutes: (config: ResolvedConfig, pluginConfig: PluginConfig$1) => Promise<{
  path: string;
  routePath: string;
}[]>;
/**
 * Find all layout files for a given route.
 */
declare const findLayouts: (routePath: string, config: ResolvedConfig, pluginConfig: PluginConfig$1) => {
  id: string;
  path: string;
}[];
/**
 * Process routes and identify their layouts
 */
declare const processLayoutRoutes: (routes: FileRouteConfig[], config: ResolvedConfig, pluginConfig: PluginConfig$1) => {
  layouts: {
    id: string;
    path: string;
  }[];
  routePath: string;
  path: string;
}[];
/**
 * Scan and process routes and return them
 * @type {typeof import("./types").getRoutes}
 */
declare const getRoutes: (config: ResolvedConfig, pluginConfig: PluginConfig$1) => Promise<{
  layouts: {
    id: string;
    path: string;
  }[];
  routePath: string;
  path: string;
}[]>;
declare const generateRouteProloaders: (route: RouteFile) => string;
declare const generateComponentRoute: (route: RouteFile) => string;
declare const generateRoute: (route: RouteFile) => string;
//#endregion
//#region src/server/index.d.ts
/**
 * Get the file most probable route path for a given potential route.
 */
type RenderSource = (() => unknown) | unknown;
/**
 * A function that takes a multitude of source types and returns a string
 * representing the HTML output.
 * @param source the source
 * @returns HTML string
 */
declare function renderToString(inputSource: RenderSource): Promise<string>;
type Manifest = Record<string, string[]>;
/**
 * A function that takes a list of files and a manifest and returns a string
 * representing the HTML markup for preload links.
 * @param files the list of files
 * @param manifest the vite manifest
 * @returns HTML string
 */
declare function renderPreloadLinks(modules: string[], manifest: Manifest): string;
//#endregion
export { LayoutFile, PageFile, PluginConfig, RouteFile, fileToRoute, findLayouts, generateComponentRoute, generateRoute, generateRouteProloaders, getRoutes, globFiles, processLayoutRoutes, renderPreloadLinks, renderToString, scanRoutes };
//# sourceMappingURL=server.d.mts.map