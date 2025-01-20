import van from 'vanjs-core'
import setup from "@vanjs/setup"
import { routerState } from './state.js'
import { matchRoute } from './routes.js'
import { unwrap, executeLifecycle } from './helpers.js'

export const Router = () => {
  const { div } = van.tags;
  // const meta = defaultMeta();

  const mainLayout = () => {
    const route = matchRoute(routerState.pathname.val)
    if (!route) return () => div('404 - Not Found');
    
    routerState.params = route.params || {}
    // Server-side or async component: use renderComponent
    if (setup.isServer) {
      const renderComponent = async () => {
        try {
          // console.log('renderComponent.route', route);
          const module = await route.component();
          const component = module.component();
          // console.log('renderComponent.module', module)
          await executeLifecycle(module, route.params);
          // console.log('renderComponent.component', component)
          return unwrap(component).children
          // return unwrap( component).children
  
          // return div('Invalid component')
        } catch (error) {
          console.error('Router error:', error)
          return () => div('Error loading page')
        }
      }

      return renderComponent()
    }

    const module = route.component(route);
    // Client-side lazy component, lifeCycle is already executed on the server
    // or when A component has been clicked in the client
    return unwrap(module.component)
  }

  return mainLayout()
}