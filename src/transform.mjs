// @ts-nocheck
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { createFilter } from 'vite';

const defaultJSXOptions = {
  include: "/src/**/*.{jsx|tsx}?$/",
  exclude: "",
  typescript: true
};

/** @typedef {import('./index.d.ts').VitePluginVanJSOptions} VitePluginVanJSOptions */

/**
 * When enabled, transforms JSX to HTML.
 * @param {string} code 
 * @param {string} id 
 * @param {Partial<VitePluginVanJSOptions>} config 
 * @returns {string | null}
 */
export function transformVanJS(code, id, config = {}) {
    const options = Object.assign(defaultJSXOptions, (config?.jsxOptions || {}));
    const filter = createFilter(options.include, options.exclude);
    if (filter(id)) {
        try {
          const ast = parse(code, {
            sourceType: 'module',
            plugins: [
              'jsx',
              options.typescript && 'typescript',
              options.typescript && 'decorators-legacy'
            ].filter(Boolean),
          });
      
          const vanImports = new Set();
      
          traverse(ast, {
            JSXElement(path) {
              const openingElement = path.node.openingElement;
              const tagName = (openingElement.name).name;
              
              const props = openingElement.attributes.map(attr => {
                if (t.isJSXAttribute(attr)) {
                  const name = (attr.name).name;
                  const value = attr.value;
                  
                  if (t.isJSXExpressionContainer(value)) {
                    return t.objectProperty(t.identifier(name), value.expression);
                  } else if (t.isStringLiteral(value)) {
                    return t.objectProperty(t.identifier(name), value);
                  }
                }
                return null;
              }).filter(Boolean);
      
              const vanCall = t.callExpression(
                t.identifier('van.tags.' + tagName.toLowerCase()),
                [
                  t.objectExpression(props),
                  ...path.node.children
                    .filter(child => t.isJSXText(child) ? child.value.trim() : true)
                    .map(child => {
                      if (t.isJSXText(child)) {
                        return t.stringLiteral(child.value);
                      }
                      if (t.isJSXExpressionContainer(child)) {
                        return child.expression;
                      }
                      return child;
                    })
                ]
              );
      
              vanImports.add('van');
              path.replaceWith(vanCall);
            },
          });
      
          if (vanImports.size > 0) {
            ast.program.body.unshift(
              t.importDeclaration(
                [t.importDefaultSpecifier(t.identifier('van'))],
                t.stringLiteral('vanjs-core')
              )
            );
          }
      
          return generate(ast, {
            retainLines: true,
            sourceMaps: true,
          });
        } catch (error) {
          console.error('Error transforming VanJS code:', error);
          return null;
        }
    }
    return null;
}