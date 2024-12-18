import { type Plugin } from 'vite';
export * from './jsx';
import './global';

declare type VitePluginVanJSPlugin = () => Plugin;
export default VitePluginVanJSPlugin;