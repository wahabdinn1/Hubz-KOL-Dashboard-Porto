import '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setMarginTop: (size: string) => ReturnType;
    setMarginBottom: (size: string) => ReturnType;
    unsetMarginTop: () => ReturnType;
    unsetMarginBottom: () => ReturnType;
  }
}
