// import * as Van from 'vanjs-core';

declare module 'vanjs/ssr' {
    // export default Van;
    import van from 'vanjs-core';
    export default van;
}

declare module 'vanjs' {
    import alias from 'vanjs/ssr';
    export default alias;
}

// export declare const vanjs: typeof import('vanjs/ssr');