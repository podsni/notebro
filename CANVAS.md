# Canvas/Whiteboard Feature - tldraw Integration

## ✅ Implementasi Selesai

NoteBro sekarang punya canvas/whiteboard mode menggunakan **tldraw** - infinite canvas SDK profesional dengan fitur lengkap.

## 🎨 Fitur Canvas

### Yang Tersedia (via tldraw):
- ✏️ **Freehand drawing** - pen, highlighter, eraser dengan pressure sensitivity
- 📦 **Shapes** - rectangles, circles, arrows, lines, polygons
- 📝 **Text & sticky notes** - rich text editing
- 🖼️ **Images & videos** - drag & drop support
- 🔗 **Connectors** - arrow lines yang auto-attach ke shapes
- ⚡ **Infinite canvas** - pan, zoom, unlimited workspace
- ↩️ **Undo/redo** - full history
- 📋 **Copy/paste** - clipboard support
- 🎯 **Selection** - multi-select, grouping, alignment tools
- 📱 **Touch support** - tablet dan mobile optimized
- ⌨️ **Keyboard shortcuts** - profesional workflow
- 💾 **Auto-save** - data tersimpan otomatis ke IndexedDB

## 🏗️ Implementasi Teknis

### Dependencies
```bash
bun add tldraw
```

### Data Model
```typescript
// src/lib/noteLogic.ts
export type NoteType = "text" | "canvas";

export type Note = {
  // ... existing fields
  noteType?: NoteType; // defaults to 'text'
}
```

### Canvas Editor Component
```tsx
// src/components/canvas/CanvasEditor.tsx
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

export function CanvasEditor({ note }: CanvasEditorProps) {
  const persistenceKey = `notebro-canvas-${note.id}`;
  
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Tldraw persistenceKey={persistenceKey} />
    </div>
  );
}
```

### State Management
```typescript
// src/store/notes.ts
createCanvasNote: (title = "Untitled Canvas", tags = []) => {
  const note = createCanvasNoteDraft(title, tags, now());
  set(state => {
    state.notes.unshift(note);
    state.selectedNoteId = note.id;
  });
  return note.id;
}
```

## 🗄️ Persistence

**tldraw otomatis menyimpan ke IndexedDB** menggunakan `persistenceKey`. Data struktur:
- Setiap canvas note punya storage key unik: `notebro-canvas-{noteId}`
- Sinkron otomatis antar tabs
- Survive refresh tanpa konfigurasi tambahan

## 🚀 Cara Pakai

1. **Buat canvas baru** - klik "New Canvas" di sidebar
2. **Pilih tool** - toolbar di kiri (select, pen, shapes, text, dll)
3. **Draw** - gambar langsung di canvas
4. **Pan & zoom** - scroll wheel zoom, space+drag untuk pan
5. **Auto-save** - semuanya tersimpan otomatis

## 📱 Mobile Support

tldraw sudah optimized untuk:
- Touch drawing
- Pinch to zoom
- Two-finger pan
- Tablet stylus dengan pressure sensitivity

## 🔗 Dokumentasi tldraw

- Quick start: https://tldraw.dev/quick-start
- Persistence: https://tldraw.dev/docs/persistence
- Editor API: https://tldraw.dev/docs/editor

## 📦 File Structure

```
src/
├── components/
│   └── canvas/
│       └── CanvasEditor.tsx          # tldraw wrapper component
├── lib/
│   └── noteLogic.ts                  # Note type with canvas support
├── store/
│   └── notes.ts                      # createCanvasNote action
└── App.tsx                           # Canvas routing & UI integration
```

## 🎯 Integrasi UI

- **Sidebar** - tombol "New Canvas" untuk buat canvas baru
- **Note list** - canvas notes ditampilkan dengan label "Canvas whiteboard"
- **Editor pane** - render `<CanvasEditor>` untuk canvas notes, `<Editor>` untuk text notes
- **Routing** - `/note/:id` auto-detect noteType dan render komponen yang sesuai

## 🧪 Testing

Build: ✅ Sukses  
Dev server: ✅ Running di http://localhost:3000  
TypeScript: ✅ No errors (hanya unused var warnings di bagian lain)

## 📊 Perbandingan: Custom vs tldraw

| Aspek | Custom Canvas | tldraw |
|-------|---------------|---------|
| Kode | ~1500 LOC | ~20 LOC |
| Features | Basic drawing, nodes, sticky | Lengkap: shapes, text, images, connectors, dll |
| Touch/Mobile | Manual implementation | Built-in optimized |
| Undo/redo | Harus bikin sendiri | Built-in |
| Persistence | Manual IndexedDB | Auto-save built-in |
| Performance | Manual optimization | Production-ready |
| Maintenance | High | Low (maintained by tldraw team) |

## 🎁 Bonus Features (Free via tldraw)

- **Geometric shapes** - rectangle, ellipse, polygon, star, arrow
- **Hand-drawn style** - shapes dengan style "draw" untuk sketch feel
- **Text formatting** - bold, italic, alignment
- **Image embedding** - drag & drop gambar
- **Zoom to fit** - auto-zoom ke seluruh content
- **Dark mode** - ikut theme system
- **Export** - PNG, SVG, JSON (via tldraw API)
- **Multiplayer ready** - bisa tambah real-time collab dengan `@tldraw/sync`

## 🚀 Future: Multiplayer (Optional)

Kalau mau tambah real-time collaboration:
```bash
bun add @tldraw/sync
```

```tsx
import { useSyncDemo } from '@tldraw/sync'

const store = useSyncDemo({ roomId: note.id })
return <Tldraw store={store} />
```

Live cursors, viewport following, cursor chat - semua gratis!

## ⚖️ License Note

tldraw bebas untuk development. Production use butuh license key dari https://tldraw.dev/pricing

## 🎉 Summary

NoteBro sekarang punya **infinite canvas whiteboard** profesional dengan:
- Zero config auto-save
- 20+ drawing & editing tools
- Mobile/tablet optimized
- Production-ready performance
- Hanya butuh ~20 baris kode!

**Referensi:**
- tldraw docs: https://tldraw.dev/quick-start
- Persistence guide: https://tldraw.dev/docs/persistence
- GitHub: https://github.com/tldraw/tldraw
