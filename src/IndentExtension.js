// src/IndentExtension.js
import { Extension } from '@tiptap/core'

export const Indent = Extension.create({
  name: 'indent',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph'],
        attributes: {
          indent: {
            default: 0,
            parseHTML: element =>
              element.style.paddingLeft?.replace('px', '') || 0,
            renderHTML: attributes => ({
              style: `padding-left: ${attributes.indent}px`,
            }),
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setIndent:
        value =>
        ({ commands }) =>
          commands.updateAttributes('paragraph', { indent: value }),
    }
  },
})
