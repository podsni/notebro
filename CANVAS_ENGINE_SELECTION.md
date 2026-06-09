# Canvas Engine Selection - Excalidraw Integration

## Perubahan

Menambahkan support untuk memilih antara **tldraw** dan **Excalidraw** sebagai canvas engine.

## Fitur Baru

### 1. Pilihan Canvas Engine
- Modal pemilihan muncul saat klik "New Canvas"
- User bisa pilih antara tldraw atau Excalidraw
- Setiap canvas note menyimpan engine yang dipilih

### 2. Excalidraw Integration
**File**: `src/components/canvas/ExcalidrawEditor.tsx`
- Wrapper component untuk Excalidraw
- Auto-save canvas data ke note.content
- Support title editing
- Support hide/unhide note list
- Consistent UI dengan tldraw editor

### 3. Type System Updates
**File**: `src/lib/noteLogic.ts`
```typescript
export type CanvasEngine = "tldraw" | "excalidraw";

export type Note = {
  // ... existing fields
  canvasEngine?: CanvasEngine;
};
```

### 4. Store Updates
**File**: `src/store/notes.ts`
- `createCanvasNote()` sekarang menerima parameter `engine`
- Default ke "tldraw" untuk backward compatibility

### 5. Routing Logic
**File**: `src/App.tsx`
- Routing berdasarkan `note.canvasEngine`
- Render `ExcalidrawEditor` untuk engine "excalidraw"
- Render `CanvasEditor` (tldraw) untuk engine "tldraw" atau undefined

### 6. Canvas Engine Modal
**File**: `src/components/modals/CanvasEngineModal.tsx`
- Modal dengan 2 pilihan: tldraw dan Excalidraw
- Visual comparison dengan deskripsi
- Warning untuk tldraw license requirement
- Highlight Excalidraw sebagai open source

## Styling

**File**: `src/index.css`
```css
.canvas-engine-options - Container untuk pilihan
.engine-option - Button untuk setiap engine
.engine-header - Header dengan title dan checkmark
.check-badge - Checkmark untuk pilihan selected
.engine-description - Deskripsi engine
.engine-notice - Notice/warning badge
.modal-actions - Action buttons
```

## Dependencies

```json
{
  "@excalidraw/excalidraw": "^0.18.1"
}
```

## Keunggulan

### tldraw
✅ Modern UI/UX
✅ Collaboration features
✅ Advanced shapes dan arrows
⚠️ Requires license untuk production

### Excalidraw  
✅ Hand-drawn aesthetic
✅ Open source & free
✅ Lightweight
✅ Great untuk sketches dan wireframes

## Usage

1. Klik "New Canvas" di sidebar
2. Pilih engine (tldraw atau Excalidraw)
3. Canvas dibuat dengan engine yang dipilih
4. Canvas data auto-saved ke note.content
5. Engine tersimpan permanent untuk note tersebut

## Backward Compatibility

- Notes tanpa `canvasEngine` default ke "tldraw"
- Existing canvas notes tetap berfungsi
- Migration tidak diperlukan

## Testing

1. ✅ Build berhasil tanpa error
2. ✅ TypeScript types valid
3. ✅ Excalidraw bundle included (10.4 MB chunk)
4. Manual test:
   - Create canvas dengan tldraw
   - Create canvas dengan Excalidraw
   - Edit title di kedua engine
   - Hide/unhide note list
   - Auto-save data
   - Switch antara canvas notes

## Files Changed

```
src/lib/noteLogic.ts - Add CanvasEngine type
src/store/notes.ts - Update createCanvasNote
src/App.tsx - Add routing logic & modal
src/components/canvas/ExcalidrawEditor.tsx - NEW
src/components/modals/CanvasEngineModal.tsx - NEW
src/index.css - Add modal styling
package.json - Add @excalidraw/excalidraw
```

## Known Issues

- Excalidraw bundle size besar (~7.3 MB)
- tldraw license warning masih muncul di console
- Perlu test data persistence Excalidraw

## Next Steps

- [ ] Test Excalidraw data persistence
- [ ] Optimize bundle size (code splitting)
- [ ] Add canvas preview thumbnails
- [ ] Export canvas to PNG/SVG
- [ ] Add tldraw license key untuk production
