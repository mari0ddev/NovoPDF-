import Image from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ResizableImage from './ResizableImage'

export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: 300 },
      left: { default: 0 },
      top: { default: 0 },
      alt: { default: '' },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImage)
  },
})
