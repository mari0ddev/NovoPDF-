import React, { useEffect, useRef, useState } from 'react'
import { EditorContent } from '@tiptap/react'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import { CustomImage } from './ImageExtension'

const BRAND_COLORS = ['#1e293b', '#6366f1', '#8b5cf6', '#dc2626', '#16a34a', '#f59e0b']

function LockedTooltip({ show, label }) {
  if (!show) return null
  return (
    <div style={{
      position: 'absolute',
      top: 36,
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#1e293b',
      color: '#fff',
      fontSize: 11,
      padding: '5px 10px',
      borderRadius: 6,
      whiteSpace: 'nowrap',
      zIndex: 30,
      pointerEvents: 'none',
    }}>
      {label}
    </div>
  )
}

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
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: 14, minWidth: 340, maxWidth: '90vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>Desenează semnătura</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#888' }}>✕</button>
        </div>
        <canvas ref={canvasRef} width={400} height={160}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
          style={{ border: '2px dashed #c7d2fe', borderRadius: 10, cursor: 'crosshair', background: '#f8f9ff', touchAction: 'none', width: '100%' }} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={clearCanvas} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#64748b' }}>Șterge</button>
          <button onClick={() => onSave(canvasRef.current.toDataURL('image/png'))} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Inserează</button>
        </div>
      </div>
    </div>
  )
}

export default function MiniEditorPreview() {
  const editorRef = useRef(null)
  const [, forceUpdate] = useState(0)
  const [showColors, setShowColors] = useState(false)
  const [showSignature, setShowSignature] = useState(false)
  const [showStyleMenu, setShowStyleMenu] = useState(false)
  const [showFontMenu, setShowFontMenu] = useState(false)
  const [lockedTooltip, setLockedTooltip] = useState(null)

  const showLockedTooltip = (key) => {
    setLockedTooltip(key)
    setTimeout(() => setLockedTooltip(null), 1800)
  }

  useEffect(() => {
    const editor = new Editor({
      extensions: [StarterKit, Underline, TextStyle, Color, Highlight, CustomImage],
      content: '<p>Scrie aici ceva, selecteaza textul si incearcă butoanele de sus.</p>',
      onTransaction: () => forceUpdate(n => n + 1),
    })
    editorRef.current = editor
    forceUpdate(n => n + 1)

    document.execCommand('enableObjectResizing', false, false)
    document.execCommand('enableInlineTableEditing', false, false)

    return () => editor.destroy()
  }, [])

  const editor = editorRef.current
  if (!editor) return null

 const insertSignature = (dataUrl) => {
  editor.chain().focus().setImage({ src: dataUrl }).run()
  editor.commands.blur()
  setShowSignature(false)

  // fix suplimentar: dezactivează drag-ul nativ pe toate imaginile din editor
  setTimeout(() => {
    editor.view.dom.querySelectorAll('img').forEach(img => {
      img.setAttribute('draggable', 'false')
    })
  }, 0)
}

  return (
    <div className="mini-editor-card">
      <div className="mini-editor-toolbar">

        <div style={{ position: 'relative' }}>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setShowStyleMenu(v => !v)} style={{ minWidth: 100 }}>
            Normal text ▾
          </button>
          {showStyleMenu && (
            <div style={{ position: 'absolute', top: 36, left: 0, background: '#fff', borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 20, minWidth: 140 }}>
              {['Normal text', 'Heading 1', 'Heading 2'].map(opt => (
                <div
                  key={opt}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { setShowStyleMenu(false); showLockedTooltip('style') }}
                  style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
          <LockedTooltip show={lockedTooltip === 'style'} label="Stiluri de text disponibile în editorul complet " />
        </div>

        <div style={{ position: 'relative' }}>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setShowFontMenu(v => !v)} style={{ minWidth: 90 }}>
            Arial ▾
          </button>
          {showFontMenu && (
            <div style={{ position: 'absolute', top: 36, left: 0, background: '#fff', borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 20, minWidth: 150 }}>
              {['Arial', 'Times New Roman', 'Georgia', 'Courier New'].map(opt => (
                <div
                  key={opt}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { setShowFontMenu(false); showLockedTooltip('font') }}
                  style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
          <LockedTooltip show={lockedTooltip === 'font'} label="Fonturi disponibile în editorul complet " />
        </div>

        <span className="mini-editor-sep" />

        <button type="button" className={editor.isActive('bold') ? 'is-active' : ''} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button type="button" className={editor.isActive('italic') ? 'is-active' : ''} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></button>
        <button type="button" className={editor.isActive('underline') ? 'is-active' : ''} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleUnderline().run()}><u>U</u></button>

        <span className="mini-editor-sep" />

        <div style={{ position: 'relative', display: 'flex', gap: 6 }}>
          <button type="button" onClick={() => showLockedTooltip('align')}>⯇</button>
          <button type="button" onClick={() => showLockedTooltip('align')}>≡</button>
          <button type="button" onClick={() => showLockedTooltip('align')}>⯈</button>
          <LockedTooltip show={lockedTooltip === 'align'} label="Aliniere text  disponibila în editorul complet " />
        </div>

        <span className="mini-editor-sep" />

        <button type="button" className={editor.isActive('bulletList') ? 'is-active' : ''} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBulletList().run()}>☰</button>
        <button type="button" className={editor.isActive('highlight') ? 'is-active' : ''} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleHighlight().run()}>✎</button>

        <span className="mini-editor-sep" />
        <div style={{ position: 'relative' }}>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setShowColors(v => !v)}>A</button>
          {showColors && (
            <div style={{ position: 'absolute', top: 36, left: 0, display: 'flex', gap: 6, padding: 8, background: '#fff', borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 20 }}>
              {BRAND_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { editor.chain().focus().setColor(c).run(); setShowColors(false) }}
                  style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: '1px solid #e2e8f0', padding: 0, cursor: 'pointer' }}
                />
              ))}
            </div>
          )}
        </div>

        <span className="mini-editor-sep" />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShowSignature(true)}
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none' }}
        >✍ Semnătură</button>
      </div>

      <div className="mini-editor-canvas">
        <div className="mini-editor-page">
          <EditorContent editor={editor} />
        </div>
      </div>

      {showSignature && (
        <SignatureModal onSave={insertSignature} onClose={() => setShowSignature(false)} />
      )}
    </div>
  )
}