import React, { useState, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { EditorContent } from '@tiptap/react'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import { Extension } from '@tiptap/core'
import { HexColorPicker } from 'react-colorful'
import { CustomImage } from './ImageExtension'
import { Indent } from './IndentExtension'

import { TableKit } from '@tiptap/extension-table'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import './App.css'

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] } },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: el => el.style.fontSize?.replace('px', '') || null,
          renderHTML: attrs => {
            if (!attrs.fontSize) return {}
            return { style: `font-size: ${attrs.fontSize}px` }
          },
        },
      },
    }]
  },
  addCommands() {
    return {
      setFontSize: (size) => ({ chain }) =>
        chain().setMark('textStyle', { fontSize: size }).run(),
    }
  },
})


const ParagraphIndent = Extension.create({
  name: 'paragraphIndent',
  addGlobalAttributes() {
    return [{
      types: ['paragraph'],
      attributes: {
        indent: {
          default: 0,
          parseHTML: el => {
            const ml = el.style.marginLeft
            return ml ? parseInt(ml) : 0
          },
          renderHTML: attrs => {
            if (!attrs.indent) return {}
            return { style: `margin-left: ${attrs.indent}px` }
          },
        },
        marginTop: {
          default: 0,
          parseHTML: el => {
            const mt = el.style.marginTop
            return mt ? parseInt(mt) : 0
          },
          renderHTML: attrs => {
            if (!attrs.marginTop) return {}
            return { style: `margin-top: ${attrs.marginTop}px` }
          },
        },
      },
    }]
  },
  addCommands() {
    return {
      setParagraphIndent: (indent) => ({ state, dispatch }) => {
        const { tr, selection } = state
        const { from, to } = selection
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (node.type.name === 'paragraph') {
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent })
          }
        })
        if (tr.docChanged) { dispatch(tr); return true }
        return false
      },
      setParagraphMarginTop: (marginTop) => ({ state, dispatch }) => {
        const { tr, selection } = state
        const { from, to } = selection
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (node.type.name === 'paragraph') {
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, marginTop })
          }
        })
        if (tr.docChanged) { dispatch(tr); return true }
        return false
      },
    }
  },
})


function TableGridPicker({ activeEditor }) {
  const [open, setOpen] = useState(false)
  const [hoverRow, setHoverRow] = useState(0)
  const [hoverCol, setHoverCol] = useState(0)
  const MAX_ROWS = 8
  const MAX_COLS = 8
  const wrapperRef = React.useRef(null)

  useEffect(() => {
    const close = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const insertTable = (rows, cols) => {
    if (!activeEditor || rows < 1 || cols < 1) return
    activeEditor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
    setOpen(false)
    setHoverRow(0); setHoverCol(0)
  }

  return (
    <div ref={wrapperRef} className="table-picker-wrapper" style={{ position: 'relative' }}>
      <TBtn onClick={() => setOpen(v => !v)} title="Inserează tabel">
        <Icon d={icons.table} />
        <span style={{ fontSize: 11 }}>Tabel</span>
      </TBtn>

      {open && (
        <div style={{
          position: 'absolute', top: 42, left: 0, zIndex: 99999,
          background: '#fff', borderRadius: 10, padding: 12,
          boxShadow: '0 15px 50px rgba(0,0,0,.25)', border: '1px solid #e5e7eb',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8, textAlign: 'center' }}>
            {hoverRow > 0 ? `${hoverRow} x ${hoverCol}` : 'Alege dimensiunea'}
          </div>
          <div
            style={{ display: 'grid', gridTemplateColumns: `repeat(${MAX_COLS}, 20px)`, gridTemplateRows: `repeat(${MAX_ROWS}, 20px)`, gap: 3 }}
            onMouseLeave={() => { setHoverRow(0); setHoverCol(0) }}
          >
            {Array.from({ length: MAX_ROWS * MAX_COLS }).map((_, i) => {
              const r = Math.floor(i / MAX_COLS) + 1
              const c = (i % MAX_COLS) + 1
              const active = r <= hoverRow && c <= hoverCol
              return (
                <div
                  key={i}
                  onMouseEnter={() => { setHoverRow(r); setHoverCol(c) }}
                  onClick={() => insertTable(hoverRow, hoverCol)}
                  style={{
                    width: 20, height: 20, borderRadius: 3,
                    border: '1px solid ' + (active ? '#6366f1' : '#e2e8f0'),
                    background: active ? '#c7d2fe' : '#f8fafc',
                    cursor: 'pointer', transition: 'background 0.05s',
                  }}
                />
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: 11, color: '#64748b' }}>custom:</span>
            <input type="number" min="1" max="30" placeholder="rânduri" id="tbl-rows-input"
              style={{ width: 55, height: 26, border: '1px solid #d1d5db', borderRadius: 6, padding: '0 6px', fontSize: 12 }} />
            <span style={{ fontSize: 11, color: '#94a3b8' }}>x</span>
            <input type="number" min="1" max="30" placeholder="coloane" id="tbl-cols-input"
              style={{ width: 55, height: 26, border: '1px solid #d1d5db', borderRadius: 6, padding: '0 6px', fontSize: 12 }} />
            <button
              onClick={() => {
                const r = parseInt(document.getElementById('tbl-rows-input').value, 10)
                const c = parseInt(document.getElementById('tbl-cols-input').value, 10)
                if (r > 0 && c > 0) insertTable(r, c)
              }}
              style={{ marginLeft: 4, height: 26, padding: '0 10px', borderRadius: 6, border: 'none', background: '#6366f1', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---- SVG ICONS ---- */
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const icons = {
  bold:        'M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z',
  italic:      'M19 4h-9M14 20H5M15 4L9 20',
  underline:   'M6 4v6a6 6 0 0 0 12 0V4M4 20h16',
  alignLeft:   'M3 6h18M3 12h12M3 18h15',
  alignCenter: 'M3 6h18M6 12h12M4 18h16',
  alignRight:  'M3 6h18M9 12h12M6 18h18',
  bulletList:  'M9 6h11M9 12h11M9 18h11M4 6h1M4 12h1M4 18h1',
  orderedList: 'M10 6h11M10 12h11M10 18h11M4 6h.01M4 12h.01M4 18h.01',
  image:       'M21 15l-5-5L5 20M3 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  signature:   'M3 17c3-3 6-6 8-3s5 6 8-3M3 20h18',
  textFree:    'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
  plus:        'M12 5v14M5 12h14',
  minus:       'M5 12h14',
  save:        'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8',
  highlight:   'M9 11l-6 6v3h3l6-6m0 0l3.5-3.5a2 2 0 0 0 0-2.83l-2.17-2.17a2 2 0 0 0-2.83 0L9 11',
  page:        'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M12 18v-6M9 15h6',
  print:       'M6 2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M6 18h12M6 14h12M6 10h12M6 6h12',
  deletePage: 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6',
  table: 'M3 5h18v14H3zM3 10h18M3 15h18M9 5v14M15 5v14',
}

/* ---- TOOLBAR BUTTON ---- */
function TBtn({ onClick, title, active, children, style = {} }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 4,
        height: 36, minWidth: 36, padding: '0 8px',
        borderRadius: 6, border: 'none',
        background: active ? '#dbeafe' : hovered ? '#f1f5f9' : 'transparent',
        color: active ? '#2563eb' : '#374151',
        cursor: 'pointer', fontSize: 12, fontWeight: active ? 600 : 400,
        transition: 'background 0.12s, color 0.12s',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

/* ---- SEPARATOR ---- */
const Sep = () => (
  <div style={{ width: 1, height: 26, background: '#e2e8f0', margin: '0 6px', flexShrink: 0 }} />
)

/* ---- FREE TEXT BOX ---- */
/* ---- FREE TEXT INLINE (stil "click si scrie", fara cutie) ---- */
function FreeTextInline({ id, x, y, pageRef, onRemove, onCommitPosition }) {
  const [editing, setEditing] = useState(true)
  const [pos, setPos] = useState({ x, y })
  const [dragging, setDragging] = useState(false)
  const [showToolbar, setShowToolbar] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const spanRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (editing) setTimeout(() => spanRef.current?.focus(), 30)
  }, [editing])

  useEffect(() => {
    if (!editing) return
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setEditing(false)
        setShowToolbar(false)
        if (!spanRef.current?.textContent?.trim()) onRemove?.()
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [editing, onRemove])

  const onMouseDown = (e) => {
    if (editing) return
    e.preventDefault(); e.stopPropagation()
    const pageRect = pageRef?.current?.getBoundingClientRect()
    if (!pageRect) return
    setDragging(true)
    dragOffset.current = { x: e.clientX - pageRect.left - pos.x, y: e.clientY - pageRect.top - pos.y }
  }

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => {
      const pageRect = pageRef?.current?.getBoundingClientRect()
      if (!pageRect) return
      setPos({ x: e.clientX - pageRect.left - dragOffset.current.x, y: e.clientY - pageRect.top - dragOffset.current.y })
    }
    const onUp = () => { setDragging(false); onCommitPosition?.(id, pos) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, pageRef, id, pos, onCommitPosition])

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setEditing(false)
      setShowToolbar(false)
      if (!spanRef.current?.textContent?.trim()) onRemove?.()
    }
  }

  const exec = (cmd, val = null) => {
    spanRef.current?.focus()
    document.execCommand(cmd, false, val)
  }

  const applyFontSize = (px) => {
    spanRef.current?.focus()
    document.execCommand('fontSize', false, '7')
    spanRef.current?.querySelectorAll('font[size="7"]').forEach(f => {
      f.removeAttribute('size')
      f.style.fontSize = px + 'px'
    })
  }

  return (
    <div
      ref={wrapRef}
      onMouseDown={onMouseDown}
      onDoubleClick={() => setEditing(true)}
      onMouseEnter={() => !editing && setShowToolbar(true)}
      onMouseLeave={() => !editing && setShowToolbar(false)}
      style={{
        position: 'absolute', left: pos.x, top: pos.y, zIndex: 20,
        cursor: editing ? 'text' : (dragging ? 'grabbing' : 'grab'),
        userSelect: dragging ? 'none' : 'auto',
      }}
    >
      {(editing || showToolbar) && (
        <div
          className="no-print"
          onMouseDown={e => { e.preventDefault(); e.stopPropagation() }}
          style={{
            position: 'absolute', top: -34, left: 0,
            display: 'flex', alignItems: 'center', gap: 3,
            background: '#1e293b', borderRadius: 6, padding: '3px 5px',
            whiteSpace: 'nowrap', zIndex: 30,
          }}
        >
          <button onClick={() => exec('bold')} title="Bold"
            style={{ width: 22, height: 22, background: 'none', border: 'none', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', borderRadius: 3 }}>B</button>
          <button onClick={() => exec('italic')} title="Italic"
            style={{ width: 22, height: 22, background: 'none', border: 'none', color: '#fff', fontStyle: 'italic', fontSize: 12, cursor: 'pointer', borderRadius: 3 }}>I</button>
          <button onClick={() => exec('underline')} title="Underline"
            style={{ width: 22, height: 22, background: 'none', border: 'none', color: '#fff', textDecoration: 'underline', fontSize: 12, cursor: 'pointer', borderRadius: 3 }}>U</button>
          <button onClick={() => exec('hiliteColor', '#fef08a')} title="Highlight"
            style={{ width: 22, height: 22, background: 'none', border: 'none', color: '#fef08a', fontSize: 12, cursor: 'pointer', borderRadius: 3 }}>🖍</button>
          <select onChange={e => applyFontSize(e.target.value)} defaultValue="14"
            style={{ height: 22, fontSize: 10, borderRadius: 3, border: 'none', background: '#334155', color: '#fff' }}>
            {[8,9,10,11,12,14,16,18,20,24,28,32].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="color" onChange={e => exec('foreColor', e.target.value)}
            style={{ width: 20, height: 20, border: 'none', padding: 0, borderRadius: 3, background: 'none', cursor: 'pointer' }} />
          <button onClick={onRemove}
            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 12, lineHeight: 1, marginLeft: 2 }}>✕</button>
        </div>
      )}

      <span
        ref={spanRef}
        contentEditable={editing}
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        style={{
          display: 'inline-block',
          minWidth: editing ? 20 : 'auto',
          fontSize: 14,
          fontWeight: 'normal',
          fontStyle: 'normal',
          color: '#000000',
          lineHeight: 1.4,
          fontFamily: 'inherit',
          outline: 'none',
          whiteSpace: 'pre-wrap',
          borderBottom: editing ? '1px solid rgba(99,102,241,0.6)' : 'none',
          boxShadow: (!editing && showToolbar) ? '0 0 0 1px rgba(99,102,241,0.35)' : 'none',
          borderRadius: 2,
          padding: '0 2px',
        }}
      />
    </div>
  )
}



function FloatingImage({ id, src, x, y, width, pageRef, onRemove, onCommitPosition, onCommitSize }) {
  const [pos, setPos] = useState({ x, y })
  const [size, setSize] = useState(width || 160)
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState(false)
  const [hovered, setHovered] = useState(false)

  const dragOffset = useRef({ x: 0, y: 0 })
  const startSize = useRef(0)
  const startPointerX = useRef(0)
  const leaveTimeout = useRef(null)

  const handleMouseEnter = () => {
    clearTimeout(leaveTimeout.current)
    setHovered(true)
  }

  const handleMouseLeave = () => {
    leaveTimeout.current = setTimeout(() => setHovered(false), 1500)
  }

  const onPointerDown = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const pageRect = pageRef?.current?.getBoundingClientRect()
    if (!pageRect) return

    setDragging(true)

    dragOffset.current = {
      x: e.clientX - pageRect.left - pos.x,
      y: e.clientY - pageRect.top - pos.y,
    }
  }

  useEffect(() => {
    if (!dragging) return

    const onMove = (e) => {
      const pageRect = pageRef?.current?.getBoundingClientRect()
      if (!pageRect) return

      setPos({
        x: e.clientX - pageRect.left - dragOffset.current.x,
        y: e.clientY - pageRect.top - dragOffset.current.y,
      })
    }

    const onUp = () => {
      setDragging(false)
      onCommitPosition?.(id, pos)
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)

    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
  }, [dragging, pageRef, id, pos, onCommitPosition])

  const onResizePointerDown = (e) => {
    e.preventDefault()
    e.stopPropagation()

    setResizing(true)
    startSize.current = size
    startPointerX.current = e.clientX
  }

  useEffect(() => {
    if (!resizing) return

    const onMove = (e) => {
      const delta = e.clientX - startPointerX.current
      setSize(Math.max(30, startSize.current + delta))
    }

    const onUp = () => {
      setResizing(false)
      onCommitSize?.(id, size)
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)

    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
  }, [resizing, id, size, onCommitSize])

  const showControls = hovered || dragging || resizing

  return (
    <div
      onPointerDown={onPointerDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        zIndex: 20,
        cursor: dragging ? "grabbing" : "grab",
        outline: showControls ? "1px dashed rgba(99,102,241,0.5)" : "none",
        outlineOffset: 2,
        padding: 10,
        margin: -10,
        touchAction: "none",
      }}
    >
      {showControls && (
        <button
          className="no-print"
          onPointerDown={(e) => {
          e.stopPropagation()
          setHovered(true)
      }}
          onMouseEnter={handleMouseEnter}
          onClick={onRemove}
          style={{
            position: "absolute",
            top: -12,
            right: -4,
            background: "#1e293b",
            border: "none",
            borderRadius: "50%",
            width: 18,
            height: 18,
            color: "#f87171",
            fontSize: 11,
            cursor: "pointer",
            lineHeight: 1,
            zIndex: 25,
          }}
        >
          ✕
        </button>
      )}

      <img
        src={src}
        alt=""
        draggable={false}
        style={{
          width: size,
          display: "block",
          userSelect: "none",
          pointerEvents: "none",
        }}
      />

      {showControls && (
        <div
          className="no-print"
          onPointerDown={onResizePointerDown}
          onMouseEnter={handleMouseEnter}
          style={{
            position: "absolute",
            right: 6,
            bottom: 6,
            width: 12,
            height: 12,
            background: "#6366f1",
            borderRadius: "50%",
            cursor: "nwse-resize",
            zIndex: 25,
          }}
        />
      )}
    </div>
  )
}



/* ---- SIGNATURE MODAL ---- */
function SignatureModal({ onSave, onClose }) {
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: (clientX - rect.left) * (canvas.width / rect.width), y: (clientY - rect.top) * (canvas.height / rect.height) }
  }

  const startDraw = (e) => {
    e.preventDefault(); isDrawing.current = true
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas); ctx.beginPath(); ctx.moveTo(pos.x, pos.y)
  }
  const draw = (e) => {
    e.preventDefault(); if (!isDrawing.current) return
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1a1a2e'
    ctx.lineTo(pos.x, pos.y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(pos.x, pos.y)
  }
  const stopDraw = () => { isDrawing.current = false }
  const clearCanvas = () => { const canvas = canvasRef.current; canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height) }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 420 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>✍️ Desenează semnătura</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
        </div>
        <canvas ref={canvasRef} width={500} height={200}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
          style={{ border: '2px dashed #c7d2fe', borderRadius: 10, cursor: 'crosshair', background: '#f8f9ff', touchAction: 'none', width: '100%' }} />
        <p style={{ margin: 0, fontSize: 12, color: '#aaa', textAlign: 'center' }}>Desenează cu mouse-ul sau degetul pe touchscreen</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={clearCanvas} style={{ padding: '8px 20px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#64748b' }}>Șterge</button>
          <button onClick={() => onSave(canvasRef.current.toDataURL('image/png'))} style={{ padding: '8px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Inserează semnătura</button>
        </div>
      </div>
    </div>
  )
}

/* ---- RULER ---- */
function Ruler({ width, zoom, activeEditor, indentPx, onIndentChange }) {
  const RULER_HEIGHT = 28
  const pxPerCm = 37.8 * zoom
 const totalCm = Math.floor(width / pxPerCm)
  const [hoveredX, setHoveredX] = React.useState(null)
  const [dragging, setDragging] = React.useState(false)
  const rulerRef = React.useRef(null)

  const getXFromEvent = (e) => {
    const rect = rulerRef.current?.getBoundingClientRect()
    if (!rect) return 0
    return Math.max(0, Math.min(width, e.clientX - rect.left))
  }
  const applyIndent = (xPx) => {
    if (!activeEditor) return
    onIndentChange(xPx)
    activeEditor.chain().focus().setParagraphIndent(Math.round(xPx / zoom)).run()
  }

  return (
    <div ref={rulerRef} style={{ position: 'relative', width, height: RULER_HEIGHT, background: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)', borderBottom: '1px solid #e2e8f0', overflow: 'visible', flexShrink: 0, userSelect: 'none', cursor: 'crosshair' }}
      onMouseDown={(e) => { if (!e.target.classList.contains('indent-marker')) { setDragging(true); applyIndent(getXFromEvent(e)) } }}
      onMouseMove={(e) => { const x = getXFromEvent(e); setHoveredX(x); if (dragging) applyIndent(x) }}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => { setHoveredX(null); setDragging(false) }}
    >
      {hoveredX !== null && !dragging && <div style={{ position: 'absolute', top: 0, bottom: 0, left: hoveredX, width: 1, background: 'rgba(99,102,241,0.35)', pointerEvents: 'none' }} />}
      {Array.from({ length: totalCm * 10 }).map((_, i) => {
        const x = (i / 10) * pxPerCm
        const isCm = i % 10 === 0; const isHalf = i % 5 === 0
        return (
          <div key={i} style={{ position: 'absolute', left: x, bottom: 0, display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ width: 1, height: isCm ? 14 : isHalf ? 9 : 5, background: isCm ? '#475569' : '#94a3b8' }} />
            {isCm && i > 0 && <span style={{ position: 'absolute', top: 2, left: 2, fontSize: 9, color: '#64748b', fontFamily: 'monospace' }}>{i / 10}</span>}
          </div>
        )
      })}
      <div className="indent-marker" style={{ position: 'absolute', top: 3, left: (indentPx ?? 0) - 6, width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '10px solid #6366f1', cursor: 'ew-resize', zIndex: 10, pointerEvents: 'auto' }}
        onMouseDown={(e) => { e.stopPropagation(); setDragging(true) }} />
      {(dragging || hoveredX !== null) && (
        <div style={{ position: 'absolute', top: RULER_HEIGHT + 4, left: Math.min(dragging ? (indentPx ?? 0) : hoveredX, width - 70), background: '#1e293b', color: '#fff', fontSize: 10, padding: '2px 7px', borderRadius: 4, pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 20 }}>
          {dragging ? `indent: ${Math.round((indentPx ?? 0) / zoom)}px` : `${(hoveredX / pxPerCm).toFixed(1)} cm`}
        </div>
      )}
    </div>
  )
}
/* ---- vertical ruler ---- */
function VerticalRulerMargin({ height, zoom, activeEditor, marginTopPx, onMarginChange }) {
  const RULER_WIDTH = 28
  const pxPerCm = 37.8 * zoom
  const totalCm = Math.floor(height / pxPerCm)
  const [hoveredY, setHoveredY] = React.useState(null)
  const [dragging, setDragging] = React.useState(false)
  const rulerRef = React.useRef(null)

  const getYFromEvent = (e) => {
    const rect = rulerRef.current?.getBoundingClientRect()
    if (!rect) return 0
    return Math.max(0, Math.min(height, e.clientY - rect.top))
  }

  const applyMargin = (yPx) => {
    onMarginChange(yPx)
    if (activeEditor) {
      activeEditor.chain().focus().setParagraphMarginTop(Math.round(yPx / zoom)).run()
    }
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const STEP = 4
    const direction = e.deltaY > 0 ? 1 : -1
    const next = Math.max(0, Math.min(height, (marginTopPx ?? 0) + direction * STEP))
    applyMargin(next)
  }

  return (
    <div ref={rulerRef} style={{ position: 'relative', width: RULER_WIDTH, height, background: 'linear-gradient(to right, #f8fafc, #f1f5f9)', borderRight: '1px solid #e2e8f0', overflow: 'visible', flexShrink: 0, userSelect: 'none', cursor: 'crosshair' }}
      onMouseDown={(e) => { if (!e.target.classList.contains('margin-marker')) { setDragging(true); applyMargin(getYFromEvent(e)) } }}
      onMouseMove={(e) => { const y = getYFromEvent(e); setHoveredY(y); if (dragging) applyMargin(y) }}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => { setHoveredY(null); setDragging(false) }}
      onWheel={handleWheel}
    >
      {hoveredY !== null && !dragging && <div style={{ position: 'absolute', left: 0, right: 0, top: hoveredY, height: 1, background: 'rgba(99,102,241,0.35)', pointerEvents: 'none' }} />}
      {Array.from({ length: totalCm * 10 }).map((_, i) => {
        const y = (i / 10) * pxPerCm
        const isCm = i % 10 === 0; const isHalf = i % 5 === 0
        return (
          <div key={i} style={{ position: 'absolute', top: y, right: 0, display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ height: 1, width: isCm ? 14 : isHalf ? 9 : 5, background: isCm ? '#475569' : '#94a3b8' }} />
            {isCm && i > 0 && <span style={{ position: 'absolute', left: 2, top: 2, fontSize: 9, color: '#64748b', fontFamily: 'monospace' }}>{i / 10}</span>}
          </div>
        )
      })}

      <div className="margin-marker"
        style={{ position: 'absolute', left: 3, top: (marginTopPx ?? 0) - 6, width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '10px solid #6366f1', cursor: 'ns-resize', zIndex: 10, pointerEvents: 'auto' }}
        onMouseDown={(e) => { e.stopPropagation(); setDragging(true) }}
      />

      {(dragging || hoveredY !== null) && (
        <div style={{ position: 'absolute', left: RULER_WIDTH + 4, top: Math.min(dragging ? (marginTopPx ?? 0) : hoveredY, height - 20), background: '#1e293b', color: '#fff', fontSize: 10, padding: '2px 7px', borderRadius: 4, pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 20 }}>
          {dragging ? `Marginea de sus: ${Math.round((marginTopPx ?? 0) / zoom)}px` : `${(hoveredY / pxPerCm).toFixed(2)} cm`}
        </div>
      )}
    </div>
  )
}

/* ---- PLACE CARET ---- */
function placeCaretAtPoint(editor, clientX, clientY) {
  let domNode = null; let offset = 0
  if (document.caretPositionFromPoint) { const pos = document.caretPositionFromPoint(clientX, clientY); if (pos) { domNode = pos.offsetNode; offset = pos.offset } }
  else if (document.caretRangeFromPoint) { const range = document.caretRangeFromPoint(clientX, clientY); if (range) { domNode = range.startContainer; offset = range.startOffset } }
  if (!domNode) { editor.commands.focus('end'); return }
  try { const pmPos = editor.view.posAtDOM(domNode, offset); if (pmPos !== null && pmPos >= 0) { editor.commands.setTextSelection(pmPos); editor.commands.focus(); return } } catch (_) {}
  editor.commands.focus('end')
}

/* ---- PAGE OVERLAY ---- */
function PageOverlay({ editor, pageIndex, activePage, setActivePage, children, onPageClick, freeTextMode, pdfSource }) {
  const allowDirectType = pdfSource === 'blank'
  const handleClick = (e) => {
    if (e.target.closest('.ProseMirror')) return
    if (e.target.closest('.free-text-box')) return
    e.stopPropagation(); setActivePage(pageIndex)
    if (onPageClick) { const rect = e.currentTarget.getBoundingClientRect(); onPageClick(e.clientX - rect.left, e.clientY - rect.top, e.clientX, e.clientY) }
    if (!editor) return
    if (freeTextMode) return
    if (!allowDirectType) return
    editor.commands.focus()
    requestAnimationFrame(() => { try { placeCaretAtPoint(editor, e.clientX, e.clientY) } catch (_) { editor.commands.focus('end') } })
  }
  return (
    <div style={{ position: 'absolute', inset: 0, padding: '40px 50px', zIndex: 3, pointerEvents: 'auto', cursor: freeTextMode ? 'crosshair' : allowDirectType ? 'text' : 'default' }} onClick={handleClick}>
      {children}
    </div>
  )
}

/* ============================================================
   MAIN COMPONENT
============================================================ */
export default function EditorPDF() {
  const [pdfFile, setPdfFile] = useState(null)
  const [numPages, setNumPages] = useState(0)
  const [activePage, setActivePage] = useState(0)
  const [zoom, setZoom] = useState(1.3)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [indentPx, setIndentPx] = useState(0)
  const [editorsReady, setEditorsReady] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [freeTextMode, setFreeTextMode] = useState(false)
  const [freeTextBoxes, setFreeTextBoxes] = useState([])
  const freeTextCounter = useRef(0)
const [floatingImages, setFloatingImages] = useState([])
const floatingImgCounter = useRef(0)
const activeFreeTextSpanRef = useRef(null)



const skipHeightCheck = useRef(false)
const [pdfSource, setPdfSource] = useState(null) // 'blank' | 'uploaded'

  const editorsRef = useRef([])
  const imgInputRef = useRef(null)
  const scrollRef = useRef(null)
  const pageRefs = useRef([])
const [marginTop, setMarginTop] = React.useState(72) // ~2.5cm la zoom 1
  const PAGE_WIDTH = Math.round(605 * zoom)
  const PAGE_HEIGHT = Math.round(842 * zoom)
  const PAGE_GAP = 24
const [showColorPicker, setShowColorPicker] = useState(false)
const [selectedColor, setSelectedColor] = useState('#000000')







const createBlankPDF = async () => {
  const { PDFDocument } = await import('pdf-lib')
  const pdf = await PDFDocument.create(); pdf.addPage([595, 842])
  const bytes = await pdf.save()
  setPdfFile(URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })))
  setPdfSource('blank')   // <-- nou
}

const handleUpload = (e) => {
  const file = e.target.files[0]
  if (!file || file.type !== 'application/pdf') return
  setPdfFile(URL.createObjectURL(file))
  setPdfSource('uploaded')   // <-- nou
}



const deletePage = async () => {
  if (numPages <= 1) return

  const { PDFDocument } = await import('pdf-lib')

  const existingBytes = await fetch(pdfFile)
    .then(r => r.arrayBuffer())

  const pdf = await PDFDocument.load(existingBytes)

  pdf.removePage(activePage)

  const bytes = await pdf.save()

  setPdfFile(
    URL.createObjectURL(
      new Blob([bytes], { type: 'application/pdf' })
    )
  )

  setActivePage(prev =>
    Math.max(0, Math.min(prev, numPages - 2))
  )
}
const printPDF = () => {
  window.print()
}
useEffect(() => {
  const closePicker = (e) => {
    if (!e.target.closest('.color-picker-wrapper')) {
      setShowColorPicker(false)
    }
  }

  document.addEventListener('mousedown', closePicker)

  return () => {
    document.removeEventListener('mousedown', closePicker)
  }
}, [])

  useEffect(() => {
    if (!numPages) return
    const existing = editorsRef.current
    if (existing.length === numPages) return
    if (existing.length > numPages) {
      existing.slice(numPages).forEach(e => e?.destroy())
      editorsRef.current = existing.slice(0, numPages)
    } else {
      const newEditors = Array.from({ length: numPages - existing.length }, () =>
        new Editor({
          extensions: [
  StarterKit, Underline, TextStyle, FontFamily, FontSize, Color, Highlight,
  Indent, ParagraphIndent, TextAlign.configure({ types: ['heading', 'paragraph'] }),
  CustomImage,
  TableKit.configure({ table: { resizable: true } }),
],
          content: '<p></p>',
        })
      )
      editorsRef.current = [...existing, ...newEditors]
    }
    setEditorsReady(r => r + 1)
  }, [numPages])

  const activeEditor = editorsRef.current[activePage]

  useEffect(() => {
    if (!activeEditor) return
    const sync = () => {
      const node = activeEditor.state.selection.$from.node()
      if (node?.type.name === 'paragraph') setIndentPx((node.attrs?.indent ?? 0) * zoom)
    }
    activeEditor.on('selectionUpdate', sync); activeEditor.on('update', sync)
    return () => { activeEditor.off('selectionUpdate', sync); activeEditor.off('update', sync) }
  }, [activeEditor, zoom, activePage])


useEffect(() => {
  if (!activeEditor) return
  const sync = () => {
    const node = activeEditor.state.selection.$from.node()
    if (node?.type.name === 'paragraph') setIndentPx((node.attrs?.indent ?? 0) * zoom)
  }
  activeEditor.on('selectionUpdate', sync); activeEditor.on('update', sync)
  return () => { activeEditor.off('selectionUpdate', sync); activeEditor.off('update', sync) }
}, [activeEditor, zoom, activePage])

const [, forceUpdate] = useState(0)
useEffect(() => {
  if (!activeEditor) return
  const sync = () => forceUpdate(n => n + 1)
  activeEditor.on('selectionUpdate', sync)
  return () => activeEditor.off('selectionUpdate', sync)
}, [activeEditor])

const addImage = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    floatingImgCounter.current += 1
    setFloatingImages(prev => [...prev, {
      id: floatingImgCounter.current,
      src: reader.result,
      x: 100,
      y: 100,
      width: 200,
      pageIndex: activePage,
    }])
  }
  reader.readAsDataURL(file); e.target.value = ''
}

const handleSignatureSave = (dataURL) => {
  floatingImgCounter.current += 1
  setFloatingImages(prev => [...prev, {
    id: floatingImgCounter.current,
    src: dataURL,
    x: PAGE_WIDTH - 220,
    y: PAGE_HEIGHT - 150,
    width: 160,
    pageIndex: activePage,
  }])
  setShowSignatureModal(false)
}



  const isAddingPageRef = useRef(false)




const addPage = async () => {
  if (isAddingPageRef.current) return
  isAddingPageRef.current = true
  try {
    const { PDFDocument } = await import('pdf-lib')
    const existingBytes = await fetch(pdfFile).then(r => r.arrayBuffer())
    const pdf = await PDFDocument.load(existingBytes); pdf.addPage([595, 842])
    const bytes = await pdf.save()
    setPdfFile(URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })))
  } finally {
    isAddingPageRef.current = false
  }
}

  const addPageRef = useRef(null)
  useEffect(() => { addPageRef.current = addPage })
  useEffect(() => {
  const editor = editorsRef.current[activePage]; if (!editor) return
  const check = () => { 
    if (skipHeightCheck.current) return   // <-- linia noua
    const el = editor.view.dom
    if (el?.scrollHeight > PAGE_HEIGHT - 80) addPageRef.current?.() 
  }
  editor.on('update', check); return () => editor.off('update', check)
}, [activePage, numPages, PAGE_HEIGHT])
const handlePageClick = (relX, relY, clientX, clientY, pageIndex) => {
  if (!freeTextMode) return
  freeTextCounter.current += 1
  setFreeTextBoxes(prev => [...prev, { id: freeTextCounter.current, x: relX, y: relY, pageIndex }])
}

useEffect(() => {
  const editors = editorsRef.current
  const handlers = editors.map((ed, idx) => {
    const onFocus = () => setActivePage(idx)
    ed.on('focus', onFocus)
    return { ed, onFocus }
  })
  return () => {
    handlers.forEach(({ ed, onFocus }) => ed.off('focus', onFocus))
  }
}, [editorsReady, numPages])






  const savePDF = async () => {
    setIsSaving(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const { PDFDocument } = await import('pdf-lib')
      const pdf = await PDFDocument.create()
      for (let i = 0; i < numPages; i++) {
        const pageEl = pageRefs.current[i]; if (!pageEl) continue
        const canvas = await html2canvas(pageEl, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false, ignoreElements: el => el.classList?.contains('no-print') })
        const imgBytes = await fetch(canvas.toDataURL('image/png')).then(r => r.arrayBuffer())
        const img = await pdf.embedPng(imgBytes)
        const page = pdf.addPage([595, 842]); page.drawImage(img, { x: 0, y: 0, width: 595, height: 842 })
      }
      const bytes = await pdf.save()
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })); a.download = 'edited.pdf'; a.click()
    } finally { setIsSaving(false) }
  }

 /* ---- LANDING ---- */
  if (!pdfFile) {
    return (
      <>
        <style>{`
          .landing-btn {
            transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
          }
          .landing-btn:hover {
            transform: translateY(-2px);
            filter: brightness(1.05);
            box-shadow: 0 8px 20px rgba(99,102,241,0.25);
          }
        `}</style>
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #DCE8FF, #b8d0ff, #a0bcff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif" }}>
          <div style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.7)', borderRadius: 24, padding: '48px 56px', textAlign: 'center', color: '#1e293b', boxShadow: '0 25px 80px rgba(99,102,241,0.15)' }}>
            <img src="novopdf logo.png" alt="Logo" style={{ width: 200, height: 200, marginBottom: -50, objectFit: 'contain' }} />
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 4px', color: '#1e293b' }}>NovoPDF Editor</h1>
            <p style={{ color: '#64748b', marginBottom: 32, fontSize: 14 }}>Edit or create PDFs directly in the browser</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={createBlankPDF} className="landing-btn" style={{ padding: '14px 32px', borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>+ Add PDF</button>
              <label className="landing-btn" style={{ padding: '14px 32px', borderRadius: 12, background: 'rgba(255,255,255,0.8)', border: '1.5px solid #dce8ff', color: '#1e293b', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                📂 Upload PDF
                <input type="file" accept="application/pdf" onChange={handleUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        </div>
      </>
    )
  }

  /* ---- EDITOR ---- */
  return (
    <>
      <style>{`
        .react-pdf__Page__annotations, .annotationLayer { display: none !important; }
        .ProseMirror { font-weight: 400 !important; }
        .ProseMirror p { font-weight: 400; margin: 0 0 4px; }
        .ProseMirror strong { font-weight: 700; }
        .ProseMirror h1 { font-size: 2rem; font-weight: 700; margin: 16px 0 8px; color: #0f172a; line-height: 1.2; }
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 600; margin: 14px 0 6px; color: #1e293b; line-height: 1.3; }
        .ProseMirror h3 { font-size: 1.2rem; font-weight: 600; margin: 12px 0 4px; color: #334155; line-height: 1.4; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: "'Segoe UI', sans-serif", background: 'linear-gradient(135deg, #DCE8FF, #b8d0ff, #a0bcff)' }}>

        {/* ===== TOOLBAR ===== */}
        <div className="app-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', padding: '6px 14px', background: '#ffffff', borderBottom: '1px solid #e8f0fe', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', zIndex: 100, minHeight: 52 }}>

          {/* Text Style Dropdown — Normal text / Titlu / Subtitlu / H1 H2 H3 */}
          <select
            onChange={(e) => {
              const val = e.target.value
              if (!activeEditor) return
              if (val === 'normal') activeEditor.chain().focus().setParagraphIndent(0).clearNodes().unsetAllMarks().run()
              else if (val === 'h1') activeEditor.chain().focus().toggleHeading({ level: 1 }).run()
              else if (val === 'h2') activeEditor.chain().focus().toggleHeading({ level: 2 }).run()
              else if (val === 'h3') activeEditor.chain().focus().toggleHeading({ level: 3 }).run()
              else if (val === 'title') activeEditor.chain().focus().toggleHeading({ level: 1 }).setFontSize('32').run()
              else if (val === 'subtitle') activeEditor.chain().focus().toggleHeading({ level: 2 }).setFontSize('22').run()
            }}
            style={{ height: 34, borderRadius: 7, border: '1px solid #e2e8f0', padding: '0 8px', fontSize: 13, background: '#f8fafc', color: '#374151', cursor: 'pointer', minWidth: 130, fontWeight: 500 }}
          >
            <option value="normal">Normal text</option>
            <option value="title">Titlu</option>
            <option value="subtitle">Subtitlu</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>

          <Sep />

          {/* Format text */}
          <TBtn onClick={() => activeEditor?.chain().focus().toggleBold().run()} title="Bold (Ctrl+B)">
            <Icon d={icons.bold} size={17} />
          </TBtn>
          <TBtn onClick={() => activeEditor?.chain().focus().toggleItalic().run()} title="Italic (Ctrl+I)">
            <Icon d={icons.italic} size={17} />
          </TBtn>
          <TBtn onClick={() => activeEditor?.chain().focus().toggleUnderline().run()} title="Underline (Ctrl+U)">
            <Icon d={icons.underline} size={17} />
          </TBtn>



          <Sep />

          {/* Font */}
          <select onChange={(e) => activeEditor?.chain().focus().setFontFamily(e.target.value).run()}
            style={{ height: 34, borderRadius: 7, border: '1px solid #e2e8f0', padding: '0 8px', fontSize: 13, background: '#f8fafc', color: '#374151', cursor: 'pointer' }}>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
          </select>

          {/* Font size */}
<select onChange={(e) => {
    if (activeFreeTextSpanRef.current) {
      document.execCommand('fontSize', false, '7') // 7 = placeholder, vezi nota de mai jos
      // trick: fontSize din execCommand acceptă doar 1-7, nu px direct
    } else {
      activeEditor?.chain().focus().setFontSize(e.target.value).run()
    }
  }}


            style={{ height: 34, width: 60, borderRadius: 7, border: '1px solid #e2e8f0', padding: '0 4px', fontSize: 13, background: '#f8fafc', color: '#374151', cursor: 'pointer' }}
            defaultValue="16">
            {[8,9,10,11,12,14,16,18,20,24,28,32,36,48,64,72].map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <Sep />

          {/* Liste */}
          <TBtn onClick={() => activeEditor?.chain().focus().toggleBulletList().run()} title="Bullet list">
            <Icon d={icons.bulletList} />
          </TBtn>
          <TBtn onClick={() => activeEditor?.chain().focus().toggleOrderedList().run()} title="Numbered list">
            <Icon d={icons.orderedList} />
          </TBtn>

          <Sep />

          {/* Aliniere */}
          <TBtn onClick={() => activeEditor?.chain().focus().setTextAlign('left').run()} title="Aliniere stânga">
            <Icon d={icons.alignLeft} />
          </TBtn>
          <TBtn onClick={() => activeEditor?.chain().focus().setTextAlign('center').run()} title="Aliniere centru">
            <Icon d={icons.alignCenter} />
          </TBtn>
          <TBtn onClick={() => activeEditor?.chain().focus().setTextAlign('right').run()} title="Aliniere dreapta">
            <Icon d={icons.alignRight} />
          </TBtn>

          <Sep />

          {/* COLOR PICKER PHOTOSHOP STYLE */}

<div
  className="color-picker-wrapper"
  style={{ position: 'relative' }}
>
  <TBtn
    title="Text Color"
    onClick={() => setShowColorPicker(v => !v)}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        lineHeight: 1
      }}
    >
      <span
        style={{
          fontWeight: 700,
          fontSize: 16,
          color: selectedColor
        }}
      >
        A
      </span>

      <div
        style={{
          width: 18,
          height: 3,
          background: selectedColor,
          borderRadius: 3,
          marginTop: 2
        }}
      />
    </div>
  </TBtn>

  {showColorPicker && (

    <div
      style={{
        position: 'absolute',
        top: 42,
        left: 0,
        zIndex: 99999,
        background: '#fff',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 15px 50px rgba(0,0,0,.25)',
        border: '1px solid #e5e7eb'
      }}
    >

     <HexColorPicker
  color={selectedColor}
  onChange={(color) => {
    setSelectedColor(color)
    if (activeFreeTextSpanRef.current) {
      document.execCommand('foreColor', false, color)
    } else {
      activeEditor?.chain().focus().setColor(color).run()
    }
  }}
/>

      <input
       value={selectedColor}
  onChange={(e) => {
    setSelectedColor(e.target.value)
    if (activeFreeTextSpanRef.current) {
      document.execCommand('foreColor', false, e.target.value)
    } else {
      activeEditor?.chain().focus().setColor(e.target.value).run()
    }
  }}
        style={{
          marginTop: 12,
          width: '100%',
          height: 36,
          border: '1px solid #d1d5db',
          borderRadius: 8,
          padding: '0 10px',
          fontSize: 14
        }}
      />

    </div>

  )}

</div>
       

          <TBtn onClick={() => activeEditor?.chain().focus().toggleHighlight().run()} title="Highlight" style={{ background: '#fef9c3', color: '#713f12' }}>
            <Icon d={icons.highlight} size={14} />
            <span style={{ fontSize: 11 }}>Mark</span>
          </TBtn>

          <Sep />

          {/* Imagine */}
          <TBtn onClick={() => imgInputRef.current.click()} title="Inserează imagine">
            <Icon d={icons.image} />
            <span style={{ fontSize: 11 }}>Image</span>
          </TBtn>
          <input type="file" hidden ref={imgInputRef} accept="image/*" onChange={addImage} />

          {/* Semnătură */}
          <TBtn onClick={() => setShowSignatureModal(true)} title="Adaugă semnătură" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}>
            <Icon d={icons.signature} />
            <span style={{ fontSize: 11 }}>Semnătură</span>
          </TBtn>
{/* Tabel */}
{/* Tabel */}
<TableGridPicker activeEditor={activeEditor} />

{activeEditor?.isActive('table') && (
  <>
    <TBtn onClick={() => activeEditor.chain().focus().addRowAfter().run()} title="Adaugă rând">
      <span style={{ fontSize: 11 }}>＋Rând</span>
    </TBtn>
    <TBtn onClick={() => activeEditor.chain().focus().deleteRow().run()} title="Șterge rând">
      <span style={{ fontSize: 11 }}>－Rând</span>
    </TBtn>
    <TBtn onClick={() => activeEditor.chain().focus().addColumnAfter().run()} title="Adaugă coloană">
      <span style={{ fontSize: 11 }}>＋Col</span>
    </TBtn>
    <TBtn onClick={() => activeEditor.chain().focus().deleteColumn().run()} title="Șterge coloană">
      <span style={{ fontSize: 11 }}>－Col</span>
    </TBtn>
    <TBtn onClick={() => activeEditor.chain().focus().deleteTable().run()} title="Șterge tabelul" style={{ color: '#dc2626' }}>
      <span style={{ fontSize: 14 }}>🗑️</span>
      <span style={{ fontSize: 11 }}>Tabel</span>
    </TBtn>
  </>
)}


          <Sep />

<TBtn onClick={() => setFreeTextMode(m => !m)} title="Text liber — click pe pagină" active={freeTextMode}>
  <Icon d={icons.textFree} />
  <span style={{ fontSize: 11 }}>Text Liber{freeTextMode ? ' ✓' : ''}</span>
</TBtn>




          {/* Pagina nouă + zoom + save — dreapta */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            <TBtn onClick={addPage} title="Adaugă pagină">
  <span style={{ fontSize: 16 }}>➕</span>
</TBtn>

<TBtn onClick={deletePage} title="Șterge pagina">
  <span style={{ fontSize: 16 }}>➖</span>
</TBtn>

<TBtn onClick={printPDF} title="Print">
  <span style={{ fontSize: 16 }}>🖨️</span>
</TBtn>

            <Sep />

            {/* Zoom */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden', height: 36 }}>
              <TBtn onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} title="Zoom out" style={{ borderRadius: 0 }}>
                <Icon d={icons.minus} size={14} />
              </TBtn>
              <span style={{ fontSize: 12, minWidth: 40, textAlign: 'center', color: '#374151', fontWeight: 600 }}>
                {Math.round(zoom * 100)}%
              </span>
              <TBtn onClick={() => setZoom(z => Math.min(2.5, z + 0.1))} title="Zoom in" style={{ borderRadius: 0 }}>
                <Icon d={icons.plus} size={14} />
              </TBtn>
            </div>

            <Sep />

            {/* Save */}
            <button onClick={savePDF} disabled={isSaving}
              style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 16px', borderRadius: 8, border: 'none', background: isSaving ? '#86efac' : 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', fontWeight: 700, fontSize: 12, cursor: isSaving ? 'wait' : 'pointer', minWidth: 80 }}>
              <Icon d={icons.save} size={14} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* ===== CANVAS ===== */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

         {/* Vertical ruler */}
<div style={{ width: 28, background: 'rgba(255,255,255,0.4)', borderRight: '1px solid #dce8ff', flexShrink: 0, overflowY: 'hidden' }}>
  <div style={{ height: 36 }} />
  <VerticalRulerMargin
    height={PAGE_HEIGHT}
    zoom={zoom}
    activeEditor={editorsRef.current[activePage]}
    marginTopPx={marginTop}
    onMarginChange={(px) => {
      setMarginTop(px)
    }}
  />

</div>
          {/* Scroll area */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* Horizontal ruler — sticky, centrat cu pagina */}
            <div style={{ position: 'sticky', top: 0, zIndex: 50, width: PAGE_WIDTH, alignSelf: 'center', background: 'rgba(255,255,255,0.95)', marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <Ruler width={PAGE_WIDTH} zoom={zoom} activeEditor={activeEditor} indentPx={indentPx} onIndentChange={setIndentPx} />
            </div>

            {/* Pagini */}
            <div data-editors-ready={editorsReady} style={{ padding: '16px 0 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Document file={pdfFile} onLoadSuccess={({ numPages: n }) => setNumPages(n)} style={{ display: 'contents' }}>
                {Array.from({ length: numPages }).map((_, i) => (
                  <div key={i} ref={el => pageRefs.current[i] = el}
                    style={{ position: 'relative', width: PAGE_WIDTH, minHeight: PAGE_HEIGHT, background: '#fff', marginBottom: i < numPages - 1 ? PAGE_GAP : 0, boxShadow: activePage === i ? '0 0 0 3px #6366f1, 0 8px 40px rgba(99,102,241,0.25)' : '0 4px 24px rgba(0,0,0,0.18)', borderRadius: 4, overflow: 'hidden', cursor: freeTextMode ? 'crosshair' : 'text', flexShrink: 0 }}>
                    <div style={{ pointerEvents: 'none' }}>
                      <Page pageNumber={i + 1} scale={zoom} renderAnnotationLayer={false} />
                    </div>
                    {freeTextBoxes.filter(b => b.pageIndex === i).map(box => (
<FreeTextInline
  key={box.id}
  id={box.id}
  x={box.x}
  y={box.y}
  pageRef={{ current: pageRefs.current[i] }}
  onRemove={() => setFreeTextBoxes(prev => prev.filter(b => b.id !== box.id))}
  onCommitPosition={(id, pos) => setFreeTextBoxes(prev =>
    prev.map(b => b.id === id ? { ...b, x: pos.x, y: pos.y } : b)
  )}
  onFocusEditable={(span) => { activeFreeTextSpanRef.current = span }}
  onBlurEditable={() => { /* nu mai reseta la null aici, altfel pierzi contextul la click pe toolbar */ }}
 
/>
  

  
))}
{floatingImages.filter(img => img.pageIndex === i).map(img => (
  <FloatingImage
    key={img.id}
    id={img.id}
    src={img.src}
    x={img.x}
    y={img.y}
    width={img.width}
    pageRef={{ current: pageRefs.current[i] }}
    onRemove={() => setFloatingImages(prev => prev.filter(f => f.id !== img.id))}
    onCommitPosition={(id, pos) => setFloatingImages(prev => prev.map(f => f.id === id ? { ...f, x: pos.x, y: pos.y } : f))}
    onCommitSize={(id, w) => setFloatingImages(prev => prev.map(f => f.id === id ? { ...f, width: w } : f))}
  />
))}


  <PageOverlay
  editor={editorsRef.current[i]}
  pageIndex={i}
  activePage={activePage}
  setActivePage={setActivePage}
  onPageClick={(rx, ry, cx, cy) => handlePageClick(rx, ry, cx, cy, i)}
  freeTextMode={freeTextMode}
  pdfSource={pdfSource}
>
  {editorsRef.current[i] && <EditorContent editor={editorsRef.current[i]} style={{ minHeight: '100%', outline: 'none' }} />}
</PageOverlay>

                    <div className="no-print" style={{ position: 'absolute', bottom: 10, right: 14, fontSize: 11, color: '#94a3b8', zIndex: 4, pointerEvents: 'none' }}>
                      {i + 1} / {numPages}
                    </div>
                  </div>
                ))}



              </Document>
            </div>
          </div>
        </div>

        {showSignatureModal && <SignatureModal onSave={handleSignatureSave} onClose={() => setShowSignatureModal(false)} />}
      </div>
    </>
  )
}

