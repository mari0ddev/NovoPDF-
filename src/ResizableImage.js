import React, { useRef } from 'react'
import { NodeViewWrapper } from '@tiptap/react'

export default function ResizableImage({ node, updateAttributes }) {
  const startX = useRef(0)
  const startWidth = useRef(0)

  // ================== DRAG ==================
  const dragStart = useRef({ x: 0, y: 0 })
  const dragPos = useRef({ left: node.attrs.left || 0, top: node.attrs.top || 0 })

  return (
    <NodeViewWrapper
      style={{
        display: 'inline-block',
        position: 'absolute', // permite pozitionare libera
        width: node.attrs.width || 300,
        left: node.attrs.left || 0,
        top: node.attrs.top || 0,
        cursor: 'move',
      }}
    >
      {/* ================== IMAGE ================== */}
      <img
        src={node.attrs.src}
        alt={node.attrs.alt || 'PDF Image'} // fix ESLint warning
        style={{
          width: '100%',
          display: 'block',
          pointerEvents: 'auto',
          position: 'relative',
          left: node.attrs.left || 0,
          top: node.attrs.top || 0,
        }}
        draggable={false}
        onMouseDown={(e) => {
          e.stopPropagation() // nu lasa editor-ul sa prinda evenimentul
          dragStart.current = { x: e.clientX, y: e.clientY }
          dragPos.current = { left: node.attrs.left || 0, top: node.attrs.top || 0 }

          const onMouseMove = (ev) => {
            const dx = ev.clientX - dragStart.current.x
            const dy = ev.clientY - dragStart.current.y
            updateAttributes({
              left: dragPos.current.left + dx,
              top: dragPos.current.top + dy,
            })
          }

          const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
          }

          document.addEventListener('mousemove', onMouseMove)
          document.addEventListener('mouseup', onMouseUp)
        }}
      />

      {/* ================== RESIZE HANDLE ================== */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation()
          startX.current = e.clientX
          startWidth.current = node.attrs.width || 300

          const onMouseMove = (ev) => {
            const diff = ev.clientX - startX.current
            updateAttributes({ width: Math.max(50, startWidth.current + diff) })
          }

          const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
          }

          document.addEventListener('mousemove', onMouseMove)
          document.addEventListener('mouseup', onMouseUp)
        }}
        style={{
          position: 'absolute',
          right: -6,
          bottom: -6,
          width: 12,
          height: 12,
          background: '#2563eb',
          cursor: 'se-resize',
          borderRadius: 4,
        }}
      />
    </NodeViewWrapper>
  )
}
