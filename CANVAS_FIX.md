# Canvas Editor - Fix Hide/Unhide Note List

## Masalah
Saat berada di canvas editor dan note list di-hide, tombol untuk unhide tidak muncul.

## Solusi

### 1. Update CanvasEditor Component
**File**: `src/components/canvas/CanvasEditor.tsx`

- Tambah props: `noteListOpen`, `showNoteList`, `createNote`
- Tambah hidden list actions di title bar canvas
- Tampilkan tombol "New note" dan "Show notes list" ketika `noteListOpen === false`

```tsx
{!noteListOpen && (
  <div className="hidden-list-actions">
    <button onClick={createNote}>New note</button>
    <button onClick={showNoteList}>Show notes list</button>
  </div>
)}
```

### 2. Update App.tsx
**File**: `src/App.tsx`

Pass props tambahan ke CanvasEditor:
```tsx
<CanvasEditor
  note={selectedNote}
  onUpdate={state.updateNoteData}
  noteListOpen={noteListOpen}
  showNoteList={() => setNoteListOpen(true)}
  createNote={createNote}
/>
```

### 3. Update CSS
**File**: `src/index.css`

- Perbaiki styling `.hidden-list-actions`
- Tambah responsive design untuk mobile (max-width: 720px)
- Button size: 56x40px desktop, 44x36px mobile
- Hover effects dan transitions

## Fitur
✅ Tombol unhide muncul di canvas editor
✅ Konsisten dengan editor normal
✅ Responsive untuk mobile dan desktop
✅ Hover effects dan visual feedback
✅ Keyboard accessible

## Testing
1. Buka canvas note
2. Hide note list (Ctrl+Shift+L atau tombol hide)
3. Verify tombol "Show notes list" muncul di kiri atas canvas
4. Klik tombol tersebut untuk unhide note list
5. Test di mobile view (< 720px width)
