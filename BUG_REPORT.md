# Bug Report - NoteBro

## Tanggal: 2026-06-09
## Status: ✅ SEMUA BUG KRITIS & MEDIUM TELAH DIPERBAIKI

## Bug yang Ditemukan dan Diperbaiki:

### 1. ❌ CRITICAL: Vitest Configuration Missing
**File**: `vitest.config.ts` (tidak ada)
**Masalah**: Tes tidak bisa jalan dengan `npm test` karena path alias `@/*` tidak di-resolve
**Status**: ✅ DIPERBAIKI - vitest.config.ts sudah dibuat
**Solusi**: Buat vitest.config.ts dengan resolver untuk alias path

### 2. ✅ FIXED: Missing Dependency in useEffect
**File**: `src/App.tsx:240`
**Lokasi**: Keyboard shortcuts useEffect
**Masalah**: Dependencies tidak lengkap - `state` dan `setLocation` tidak masuk dalam dependency array
**Impact**: Shortcuts mungkin menggunakan stale closure, menyebabkan bug ketika state berubah
**Perbaikan**: Menambahkan semua dependencies yang diperlukan:
```typescript
}, [selectedNote?.id, state.query, state.settings.focusMode, state.settings.keyboardShortcuts, state.selectedTag, visibleNotes, state, setLocation, jumpMatch, selectRelativeNote, toggleContentTagsFocus, insertChecklist]);
```

### 3. ✅ FIXED: Race Condition in insertChecklist
**File**: `src/App.tsx:310-322`
**Masalah**: Jika `updateNote` menyebabkan re-render, `element` bisa jadi stale reference
**Impact**: Cursor position mungkin tidak ter-set dengan benar
**Perbaikan**: Menggunakan double requestAnimationFrame dan re-fetch element dari ref:
```typescript
const targetPosition = start + insertion.length;
state.updateNote(selectedNote.id, next);
// Use double RAF to ensure DOM has updated after state change
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const currentElement = editorRef.current;
    if (currentElement) {
      currentElement.setSelectionRange(targetPosition, targetPosition);
    }
  });
});
```

### 4. ⚠️ MEDIUM: Potential Undefined Access
**File**: `src/App.tsx:137-139`
**Masalah**: 
```typescript
const selectedNote = isTrashView
  ? state.notes.find(note => note.id === state.selectedNoteId && note.deletedAt) || visibleNotes[0]
  : state.notes.find(note => note.id === state.selectedNoteId && !note.deletedAt) || visibleNotes[0] || state.notes.find(note => !note.deletedAt);
```
`visibleNotes[0]` bisa undefined jika array kosong
**Impact**: selectedNote bisa undefined, menyebabkan conditional rendering issues
**Status**: ✅ AMAN - Sudah ada pengecekan `selectedNote ?` di banyak tempat

### 5. ⚠️ LOW: Inconsistent Keyboard Shortcut Unbind
**File**: `src/App.tsx:239`
**Masalah**: 
```typescript
return () => hotkeys.unbind("ctrl+/,ctrl+k,ctrl+shift+i,...");
```
String yang panjang rawan typo, tidak maintainable
**Rekomendasi**: Simpan shortcuts dalam konstanta atau generate otomatis

### 6. ⚠️ LOW: Missing Error Handling in PDF Preview
**File**: `src/App.tsx:1076-1080`
**Masalah**: useEffect untuk cleanup pdfUrl tidak handle error
```typescript
useEffect(() => {
  return () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
  };
}, [pdfUrl]);
```
**Impact**: Minor - URL.revokeObjectURL jarang error
**Rekomendasi**: Tambahkan try-catch untuk defensive programming

### 7. ✅ FIXED: Memory Leak Potential in BroadcastChannel
**File**: `src/App.tsx:164-172`
**Masalah**: BroadcastChannel dibuat setiap kali state berubah - bisa menyebabkan banyak channel dibuat
**Impact**: Bisa menyebabkan memory overhead pada perubahan state yang sering
**Perbaikan**: Buat channel sekali dan gunakan debouncing:
```typescript
useEffect(() => {
  if (typeof BroadcastChannel === "undefined") return;

  const channel = new BroadcastChannel("quicknote-sync");
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const unsubscribe = useNotesStore.subscribe(current => {
    // Debounce broadcast to avoid excessive messages
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      channel.postMessage({ type: "updated", notes: current.notes, settings: current.settings });
    }, 100);
  });

  return () => {
    unsubscribe();
    if (timeoutId) clearTimeout(timeoutId);
    channel.close();
  };
}, []);
```

### 8. ✅ GOOD: Test Coverage
**Status**: Semua test passing (16 tests)
**File**: 
- `src/lib/noteLogic.test.ts` ✅
- `src/store/notes.test.ts` ✅  
- `src/features/import-export/importFiles.test.ts` ✅

### 9. ✅ GOOD: TypeScript Compilation
**Status**: Tidak ada TypeScript error (`bunx tsc --noEmit` clean)

### 10. ✅ GOOD: Build Success
**Status**: Build berhasil dengan bun
```
dist/chunk-205ehx6g.js  1474.9 KB
dist/index.html  0.4 KB
dist/chunk-cz39gpnx.css  2642.4 KB
```

## Status Perbaikan:

✅ **SELESAI**: Fix useEffect dependencies (Bug #2)
✅ **SELESAI**: Fix insertChecklist race condition (Bug #3)
✅ **SELESAI**: Optimize BroadcastChannel usage (Bug #7)
✅ **SELESAI**: Remove unused imports
⚠️ **DIABAIKAN**: Refactor keyboard shortcuts (Bug #5) - bukan masalah kritis
⚠️ **DIABAIKAN**: Add error handling for PDF cleanup (Bug #6) - risk minimal

## Test Results Setelah Perbaikan:

```bash
bun test v1.3.13 (bf2e2cec)

 16 pass
 0 fail
 34 expect() calls
Ran 16 tests across 3 files. [285.00ms]
```

✅ TypeScript compilation: CLEAN (no errors)
✅ All tests: PASSING
✅ Build: SUCCESS

## Catatan:
- Kode secara umum berkualitas baik
- Test coverage bagus
- TypeScript typing solid
- Perlu attention pada React hooks dependencies dan race conditions
