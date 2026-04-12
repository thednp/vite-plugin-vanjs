import type { StateView, ChildDom } from "vanjs-core";
// import type { Element as VanElement } from "mini-van-plate/van-plate";
import type { CSSProperties, DOMElementsMap, TagNames, EventHandler, EventHandlerUnion, ElementUnion } from "./dom-types.d.ts";

export type { TagNames, CSSProperties, DOMElementsMap, ElementUnion };
export type { EventHandler, EventHandlerUnion };

export interface StateEntry {
  execute: () => void;
  dependencies: Set<Set<StateEntry>>;
  cleanup?: () => void;
}

export type Accessor<T> = () => T;

export type ObserverFn = () => void;

export type StateMaybe<T = unknown> =
  | Accessor<T>
  | StateView<T>
  | T
  | undefined;

export type FunctionMaybe<T = unknown> = Accessor<T> | T;

export type DOMElement = HTMLElement | SVGElement;

export type StoreObject =
  | {
    [key: string]: StoreValue;
  }
  | { [key: string]: unknown };

export type Primitive = string | number | boolean | bigint;
export type FNObject = Date | RegExp;
export type StoreValue =
  | FNObject
  | Primitive
  | StoreObject
  | StoreObject[]
  | Primitive[];
export type PropValue = Omit<Primitive, bigint> | null;

export type PropsWithKnownKeys<T> = Partial<
  {
    [K in keyof T]: StateMaybe<T[K]>;
  }
>;

export type EventNameMap = keyof HTMLElementEventMap;
export type StyleValue = DOMElementsMap["main"]["style"];

export type DOMNodeAttributes<K extends TagNames> = DOMElementsMap[K] & {
  children?: MaybeChildNode[];
  style?: StyleValue;
  class?: StateMaybe<string>;
  // ref?: <T extends Element = OutputElement<K>>(el: T) => void;
  [key: `data-${string}`]: FunctionMaybe<string | boolean | number>;
  [key: `aria-${string}`]: FunctionMaybe<string>;
};

export type OutputElement<K extends TagNames> =
  K extends keyof MathMLElementTagNameMap ? MathMLElement : DOMTagNameMap[K];

export type ComponentProps<K extends keyof DOMElementsMap> =
  DOMElementsMap[K];

export type Component<
  K extends TagNames,
  O extends ComponentProps<K> | undefined = undefined,
> = (
  props?: (O extends object
    ? ComponentProps<K> & Partial<O>
    : ComponentProps<K>) & {
    children?: ElementUnion;
  },
) => ElementUnion;


export type PotentialProps<K extends TagNames> = K extends
  keyof MathMLElementTags ? MathMLElementTags[K] : DOMTagNameMap[K];

// export type ValidChildDomValue = Primitive | Node | null | undefined
// export type BindingFunc = ((dom?: Node) => ValidChildDomValue) | ((dom?: Element) => Element)
// export type ChildDom = ValidChildDomValue | StateView<Primitive | null | undefined> | BindingFunc | readonly ChildDom[]

export type MaybeChildNode =
  | Primitive
  | Node
  | DOMElement
  // | ChildDom
  // | ChildArray
  // | ChildAccessor
  // | (string & {});

export interface ChildArray extends Array<MaybeChildNode> {}
export interface ChildAccessor {
  (props?: unknown): MaybeChildNode;
}

export type PotentialEventTarget =
  | typeof globalThis
  | Window
  | Document
  | Element
  | MediaQueryList;

export type PotentialEventObject =
  | Event
  | AnimationEvent
  | ClipboardEvent
  | CompositionEvent
  | DragEvent
  | FocusEvent
  | SubmitEvent
  | KeyboardEvent
  | MouseEvent
  | PointerEvent
  | TouchEvent
  | TransitionEvent
  | UIEvent
  | WheelEvent;

