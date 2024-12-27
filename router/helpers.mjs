import setup from "../setup/index.mjs";
import { setRouterState } from "./state.mjs";

/**
 * @param {string} href 
 * @param {{ replace?: boolean }} options
 */
export const navigate = (href, options = {}) => {
  const { replace } = options;

  setRouterState(href, replace);
};

/**
 * A client only helper function
 * @returns {void}
 */
export const reload = () => {
  if (setup.isServer) return;
  window.location.reload();
}

/**
 * @param {string | undefined} href 
 * @returns {(() => void) | void}
 */
export const redirect = (href) => {
  if (!href) return;
  const callback = () => {
    if (!setup.isServer) 
    window.location.replace(href);
  }
  if (setup.isServer) return callback;
  setRouterState(href, true);
}
