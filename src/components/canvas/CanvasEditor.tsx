import { useState, useCallback } from "react";
import { Tldraw, Editor } from "tldraw";
import "tldraw/tldraw.css";
import { Icon } from "@/components/icons/Icon";
import { mdiPencil, mdiClose, mdiSquareEditOutline, mdiViewSplitVertical, mdiDeleteOutline } from "@mdi/js";
import type { Note } from "@/lib/noteLogic";

type CanvasEditorProps = {
  note: Note;
  onUpdate: (noteId: string, updates: Partial<Note>) => void;
  noteListOpen: boolean;
  showNoteList: () => void;
  createNote: () => void;
  deleteNote: () => void;
};

export function CanvasEditor({ note, onUpdate, noteListOpen, showNoteList, createNote, deleteNote }: CanvasEditorProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(note.title);

  // Use note ID as persistenceKey - each canvas note gets its own storage
  const persistenceKey = `notebro-canvas-${note.id}`;

  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor);
  }, []);

  const handleSaveTitle = () => {
    if (titleDraft.trim() && titleDraft !== note.title) {
      onUpdate(note.id, { title: titleDraft.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    setTitleDraft(note.title);
    setIsEditingTitle(false);
  };

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <div className="canvas-toolbar">
        {!noteListOpen && (
          <div className="hidden-list-actions">
            <button type="button" className="icon-button" onClick={createNote} aria-label="New note" title="New note">
              <Icon path={mdiSquareEditOutline} size={0.75} />
            </button>
            <button type="button" className="icon-button" onClick={showNoteList} aria-label="Show notes list" title="Show notes list">
              <Icon path={mdiViewSplitVertical} size={0.75} />
            </button>
          </div>
        )}

        {isEditingTitle ? (
          <>
            <input
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") handleCancelEdit();
              }}
              autoFocus
              className="canvas-title-input"
            />
            <button type="button" onClick={handleSaveTitle} className="canvas-title-save">
              Save
            </button>
            <button type="button" onClick={handleCancelEdit} aria-label="Cancel rename" className="canvas-cancel-btn">
              <Icon path={mdiClose} size={0.75} />
            </button>
          </>
        ) : (
          <>
            <strong className="canvas-title">{note.title}</strong>
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              aria-label="Rename canvas"
              title="Rename canvas"
              className="canvas-rename-btn"
            >
              <Icon path={mdiPencil} size={0.7} />
            </button>
            <button
              type="button"
              onClick={deleteNote}
              aria-label="Move canvas to trash"
              title="Move to trash"
              className="canvas-delete-btn"
            >
              <Icon path={mdiDeleteOutline} size={0.7} />
              <span>Delete</span>
            </button>
          </>
        )}
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <Tldraw
          licenseKey={process.env.BUN_PUBLIC_TLDRAW_LICENSE_KEY}
          persistenceKey={persistenceKey}
          onMount={handleMount}
        />
      </div>
    </div>
  );
}
