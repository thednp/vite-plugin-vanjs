import van from 'vanjs-core';

export const route = {
  preload: async () => { console.log('Page preload triggered') },
  load: async () => { console.log('Page load triggered') },
}

export const Page = () => {
  const { div, h1 } = van.tags;

  return div(
    h1('Hello VanJS!')
  )
}
