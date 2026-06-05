declare module 'react' {
  export function useState<S>(initialState: S | (() => S)): [S, (value: S) => void];
}

declare namespace JSX {
  interface IntrinsicElements {
    [elementName: string]: Record<string, unknown>;
  }
}
