/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly MODE: string;

  readonly VITE_API_DEV_URL: string;
  readonly VITE_API_PROD_URL: string;

  readonly VITE_WS_DEV_URL: string;
  readonly VITE_WS_PROD_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.mdx' {
  import { ComponentType } from 'react';
  const MDXComponent: ComponentType<any>;
  export default MDXComponent;
}
