// router/routes.js
import { reactive } from "vanjs-ext";

export const routes = reactive([]);

/**
 * @typedef {} VanNode
 */

/**
 * @typedef {Object} Route
 * @property {string} path
 * @property {() => VanNode | Promise<VanNode>} component
 */

/**
 * @param {Route} route
 * @example
 * import { Home } from '../pages/home.js'
 * import { About } from '../pages/about.js'
 * import { NotFound } from '../pages/not-found.js'

 * route({ path: '/', component: Home });
 * route({ path: '/about', component: About });
 * route({ path: '*', component: NotFound });
 */
export const route = (route) => {
  routes.push(route)
}

/**
 * @param {string} path 
 * @returns {Route["component"]}
 */
export const matchRoute = (path) => {
  const route = routes.find(r => r.path === path) || routes.find(r => r.path === '*')
  return route.component;
}
