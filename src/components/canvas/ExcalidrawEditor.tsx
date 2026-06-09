import { useState, useCallback } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { Icon } from "@/components/icons/Icon";
import { mdiPencil, mdiClose, mdiSquareEditOutline, mdiViewSplitVertical } from "@mdi/js";
import type { Note } from "@/lib/noteLogic";

type ExcalidrawEditorProps = {
  note: Note;
  onUpdate: (noteId: string, updates: Partial<Note>) => void;
  noteListOpen: boolean;
  showNoteList: () => void;
  createNote: () => void;
};

export function ExcalidrawEditor({ note, onUpdate, noteListOpen, showNoteList, createNote }: ExcalidrawEditorProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(note.title);

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

  // Load saved scene data if exists
  const initialData = note.content ? JSON.parse(note.content) : undefined;

  const handleChange = useCallback((elements: any, appState: any) => {
    // Auto-save canvas data
    const sceneData = {
      elements,
      appState: {
        viewBackgroundColor: appState.viewBackgroundColor,
        currentItemStrokeColor: appState.currentItemStrokeColor,
        currentItemBackgroundColor: appState.currentItemBackgroundColor,
      },
    };
    onUpdate(note.id, { content: JSON.stringify(sceneData) });
  }, [note.id, onUpdate]);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      {/* Canvas title bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
        zIndex: 10,
      }}>
        {/* Show note list button when hidden */}
        {!noteListOpen && (
          <div className="hidden-list-actions">
            <button
              type="button"
              className="icon-button"
              onClick={createNote}
              aria-label="New note"
              title="New note"
            >
              <Icon path={mdiSquareEditOutline} size={0.75} />
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={showNoteList}
              aria-label="Show notes list"
              title="Show notes list"
            >
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
              style={{
                flex: 1,
                padding: "4px 8px",
                fontSize: "14px",
                border: "1px solid var(--primary)",
                borderRadius: "4px",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={handleSaveTitle}
              style={{
                padding: "4px 12px",
                fontSize: "13px",
                background: "var(--primary)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              aria-label="Cancel"
              style={{
                padding: "4px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Icon path={mdiClose} size={0.8} />
            </button>
          </>
        ) : (
          <>
            <strong style={{ flex: 1, fontSize: "14px" }}>{note.title}</strong>
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              aria-label="Rename canvas"
              title="Rename canvas"
              style={{
                padding: "4px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "var(--muted)",
              }}
            >
              <Icon path={mdiPencil} size={0.7} />
            </button>
          </>
        )}
      </div>

      {/* Excalidraw canvas */}
      <div style={{ flex: 1, position: "relative" }}>
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          initialData={initialData}
          onChange={handleChange}
          UIOptions={{
            canvasActions: {
              loadScene: false,
            },
          }}
        />
      </div>
    </div>
  );
}
