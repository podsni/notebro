import { useState, useCallback, useRef, useEffect } from "react";
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

const TITLE_BAR_HEIGHT = 45;

export function ExcalidrawEditor({ note, onUpdate, noteListOpen, showNoteList, createNote }: ExcalidrawEditorProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(note.title);
  const [canvasHeight, setCanvasHeight] = useState(500);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedContent = useRef<string>(note.content);

  // Measure wrapper height and set canvas height explicitly
  useEffect(() => {
    if (!wrapperRef.current) return;
    const obs = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        const h = entry.contentRect.height - TITLE_BAR_HEIGHT;
        if (h > 0) setCanvasHeight(h);
      }
    });
    obs.observe(wrapperRef.current);
    // Initial measure
    setCanvasHeight(wrapperRef.current.offsetHeight - TITLE_BAR_HEIGHT);
    return () => obs.disconnect();
  }, []);

  // Reset title draft when note changes
  useEffect(() => {
    setTitleDraft(note.title);
    setIsEditingTitle(false);
    lastSavedContent.current = note.content;
  }, [note.id]);

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

  const initialData = note.content
    ? (() => {
        try {
          return JSON.parse(note.content);
        } catch {
          return undefined;
        }
      })()
    : undefined;

  const handleChange = useCallback((elements: any, appState: any, files: any) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const sceneData = {
        elements,
        appState: {
          viewBackgroundColor: appState.viewBackgroundColor,
          currentItemStrokeColor: appState.currentItemStrokeColor,
          currentItemBackgroundColor: appState.currentItemBackgroundColor,
          scrollX: appState.scrollX,
          scrollY: appState.scrollY,
          zoom: appState.zoom,
        },
        files,
      };
      const newContent = JSON.stringify(sceneData);
      if (newContent !== lastSavedContent.current) {
        lastSavedContent.current = newContent;
        onUpdate(note.id, { content: newContent });
      }
    }, 800);
  }, [note.id, onUpdate]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="excalidraw-wrapper">
      {/* Title bar */}
      <div className="excalidraw-titlebar">
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
              className="excalidraw-title-input"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") handleCancelEdit();
              }}
              autoFocus
            />
            <button type="button" className="excalidraw-title-save" onClick={handleSaveTitle}>Save</button>
            <button type="button" className="icon-button" onClick={handleCancelEdit} aria-label="Cancel">
              <Icon path={mdiClose} size={0.8} />
            </button>
          </>
        ) : (
          <>
            <strong className="excalidraw-title-text">{note.title}</strong>
            <button type="button" className="icon-button" onClick={() => setIsEditingTitle(true)} aria-label="Rename canvas" title="Rename canvas">
              <Icon path={mdiPencil} size={0.7} />
            </button>
          </>
        )}
      </div>

      {/* Excalidraw with explicit height */}
      <div style={{ width: "100%", height: canvasHeight }}>
        <Excalidraw
          key={note.id}
          initialData={initialData}
          onChange={handleChange}
          theme="dark"
          UIOptions={{
            canvasActions: { loadScene: false },
          }}
        />
      </div>
    </div>
  );
}
