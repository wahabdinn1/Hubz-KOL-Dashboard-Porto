import { Node, mergeAttributes } from '@tiptap/core';
// ReactNodeViewRenderer import removed

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    variable: {
      setVariable: (attributes: { id: string; label: string; value: string }) => ReturnType;
    };
  }
}

export const Variable = Node.create({
  name: 'variable',

  group: 'inline',

  inline: true,

  atom: true, // It is treated as a single unit, cursor cannot go inside easily

  addAttributes() {
    return {
      id: {
        default: null,
      },
      label: {
        default: 'Variable',
      },
      value: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-variable-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-variable-id': HTMLAttributes.id, class: 'bg-yellow-100 px-1 rounded mx-0.5 border-b-2 border-yellow-300' }), HTMLAttributes.value || '______'];
  },

  renderText({ node }) {
    return node.attrs.value || `[${node.attrs.label}]`;
  },
});
