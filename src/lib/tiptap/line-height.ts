/* eslint-disable @typescript-eslint/no-explicit-any */
import { Extension } from '@tiptap/core';
import { LineHeight } from '@tiptap/extension-text-style';

export interface MarginOptions {
  types: string[];
  defaultMarginTop: string | null;
  defaultMarginBottom: string | null;
}



export const MarginExtension = Extension.create<MarginOptions>({
  name: 'margin',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      defaultMarginTop: null,
      defaultMarginBottom: null,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          marginTop: {
            default: this.options.defaultMarginTop,
            parseHTML: element => element.style.marginTop || this.options.defaultMarginTop,
            renderHTML: attributes => {
              if (attributes.marginTop === this.options.defaultMarginTop) {
                return {};
              }
              return { style: `margin-top: ${attributes.marginTop}` };
            },
          },
          marginBottom: {
            default: this.options.defaultMarginBottom,
            parseHTML: element => element.style.marginBottom || this.options.defaultMarginBottom,
            renderHTML: attributes => {
              if (attributes.marginBottom === this.options.defaultMarginBottom) {
                return {};
              }
              return { style: `margin-bottom: ${attributes.marginBottom}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setMarginTop: (size: string) => ({ tr, state, dispatch }: any) => {
          const { selection } = state;
          tr = tr.setSelection(selection);
          const { from, to } = selection;
          state.doc.nodesBetween(from, to, (node: any, pos: any) => {
              if (this.options.types.includes(node.type.name)) {
                  tr = tr.setNodeMarkup(pos, undefined, {
                      ...node.attrs,
                      marginTop: size,
                  });
              }
          });
          if (dispatch) dispatch(tr);
          return true;
      },
      unsetMarginTop: () => ({ commands }: any) => {
        return commands.setMarginTop(this.options.defaultMarginTop || '');
      },
      setMarginBottom: (size: string) => ({ tr, state, dispatch }: any) => {
          const { selection } = state;
          tr = tr.setSelection(selection);
          const { from, to } = selection;
          state.doc.nodesBetween(from, to, (node: any, pos: any) => {
              if (this.options.types.includes(node.type.name)) {
                  tr = tr.setNodeMarkup(pos, undefined, {
                      ...node.attrs,
                      marginBottom: size,
                  });
              }
          });
          if (dispatch) dispatch(tr);
          return true;
      },
      unsetMarginBottom: () => ({ commands }: any) => {
         return commands.setMarginBottom(this.options.defaultMarginBottom || '');
      },
    } as any;
  },
});

/**
 * Custom LineHeight extension that overrides the default implementation
 * to support Block-Level line-height (Paragraph/Heading) instead of just Inline (TextStyle).
 */
export const CustomLineHeight = LineHeight.extend({
  addCommands() {
    return {
      setLineHeight: (lineHeight: string) => ({ tr, state, dispatch }: any) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        const { from, to } = selection;
        
        state.doc.nodesBetween(from, to, (node: any, pos: any) => {
          if (this.options.types.includes(node.type.name)) {
             tr = tr.setNodeMarkup(pos, undefined, {
               ...node.attrs,
               lineHeight,
             });
          }
        });

        if (dispatch) dispatch(tr);
        return true;
      },
      unsetLineHeight: () => ({ tr, state, dispatch }: any) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        const { from, to } = selection;

        state.doc.nodesBetween(from, to, (node: any, pos: any) => {
          if (this.options.types.includes(node.type.name)) {
             tr = tr.setNodeMarkup(pos, undefined, {
               ...node.attrs,
               lineHeight: null, 
             });
          }
        });

        if (dispatch) dispatch(tr);
        return true;
      }
    };
  }
});
