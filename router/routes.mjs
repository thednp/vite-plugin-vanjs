// router/routes.js
/** @type {Route[]} */
export const routes = [];

/**
 * @typedef {Object} Route
 * @property {string} path
 * @property {() => VanNode | Promise<VanNode>} component
 */

/**
 * @param {Route} route
 */
export const route = (route) => {
  routes.push(route);
}

/**
 * @param {string} path 
 * @returns {Route["component"]}
 */
export const matchRoute = (path) => {
  const route = routes.find(r => r.path === path) || routes.find(r => r.path === '*')
  return route.component;
}
