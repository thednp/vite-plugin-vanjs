// router/Link.js
import van from 'vanjs-core'
import { setRouterState } from './state.mjs'

/**
 * @param {Partial<HTMLAnchorElement>} props 
 * @param  {...(Element | Node)[]} children 
 * @returns {HTMLAnchorElement}
 */
export const Link = (props, ...children) => {
  const { a } = van.tags
  const { href, onclick, ...rest } = props;

  const handleClick = (e) => {
    e.preventDefault()
    setRouterState(href);
    if (onclick) onclick(e);
  }

  return a({ href, onclick: handleClick, ...rest }, ...children)
}
