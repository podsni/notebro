import "@react-pdf-viewer/core/lib/styles/index.css";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";
import "@fontsource/source-serif-4/400.css";
import "@fontsource/source-serif-4/700.css";
import "katex/dist/katex.min.css";
import "react-loading-skeleton/dist/skeleton.css";
import { Global, ThemeProvider } from "@emotion/react";
import {
  mdiArchiveArrowDownOutline,
  mdiArrowLeft,
  mdiChevronLeft,
  mdiChevronRight,
  mdiClose,
  mdiCogOutline,
  mdiDeleteOutline,
  mdiDotsHorizontalCircleOutline,
  mdiDownloadOutline,
  mdiEyeOutline,
  mdiFilePdfBox,
  mdiFormatListChecks,
  mdiInformationOutline,
  mdiMagnify,
  mdiMenu,
  mdiPin,
  mdiPinOutline,
  mdiSquareEditOutline,
  mdiUploadOutline,
  mdiViewSplitVertical,
  mdiWifi,
  mdiLightningBolt,
  mdiFileDocumentOutline,
  mdiDrawing,
} from "@mdi/js";
import { Worker as PdfWorker, Viewer } from "@react-pdf-viewer/core";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import hotkeys from "hotkeys-js";
import { saveAs } from "file-saver";
import { format as timeagoFormat } from "timeago.js";
import { useDropzone } from "react-dropzone";
import Skeleton from "react-loading-skeleton";
import toast, { Toaster } from "react-hot-toast";
import { Virtuoso } from "react-virtuoso";
import { Route, Switch, useLocation } from "wouter";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { CronosExpression, validate as validateCron } from "cronosjs";
import { Icon } from "@/components/icons/Icon";
import { iconButtonLabel } from "@/components/icons/IconButton";
import { AppModal } from "@/components/modals/AppModal";
import { QuickCaptureModal } from "@/components/modals/QuickCaptureModal";
import { TemplatePickerModal } from "@/components/modals/TemplatePickerModal";
import { CanvasEngineModal } from "@/components/modals/CanvasEngineModal";
import { CanvasEditor } from "@/components/canvas/CanvasEditor";
import { ExcalidrawEditor } from "@/components/canvas/ExcalidrawEditor";
import { type HistoryEntry, type Note, type SortMode, type CanvasEngine } from "@/lib/noteLogic";
import { type NoteTemplate } from "@/lib/noteTemplates";
import { importDropzoneAccept, importFiles } from "@/features/import-export/importFiles";
import { getNoteWorker } from "@/workers/client";
import { selectVisibleNotes, useNotesStore, type EditorFontFamily, type NoteDisplayMode, type Settings } from "@/store/notes";
import "./index.css";

dayjs.extend(relativeTime);

const theme = {
  colors: {
    background: "oklch(1 0 0)",
    surface: "oklch(0.982 0.003 260)",
    raised: "oklch(0.955 0.006 260)",
    text: "oklch(0.18 0.018 260)",
    muted: "oklch(0.46 0.018 260)",
    primary: "oklch(0.45 0.15 260)",
    accent: "oklch(0.72 0.14 78)",
    border: "oklch(0.9 0.008 260)",
  },
};

type ModalName = "share" | "history" | "settings" | "import" | "trash" | "shortcuts" | "command" | "quick-capture" | "templates" | "canvas-engine" | null;
type MobilePane = "list" | "editor";
type PreviewMode = "edit" | "split" | "preview";

const shortcutGroups = [
  {
    title: "View",
    items: [
      ["Ctrl + /", "Show keyboard shortcuts"],
      ["Ctrl + K", "Show command palette"],
      ["Ctrl + Shift + Space", "Quick capture"],
      ["Ctrl + Shift + T", "New note from template"],
      ["Ctrl + Shift + F", "Toggle focus mode"],
      ["Ctrl + Shift + S", "Focus search field"],
      ["Ctrl + G", "Jump to next match in note"],
      ["Ctrl + Shift + G", "Jump to previous match in note"],
    ],
  },
  {
    title: "Navigation",
    items: [
      ["Ctrl + Shift + U", "Toggle tag list"],
      ["Ctrl + Shift + K", "Open note above current one"],
      ["Ctrl + Shift + J", "Open note below current one"],
      ["Ctrl + Shift + Y", "Toggle editing content/tags"],
      ["Ctrl + Shift + L", "Toggle note list (on narrow screens)"],
    ],
  },
  {
    title: "Note Editing",
    items: [
      ["Ctrl + Shift + I", "Create new note"],
      ["Ctrl + Shift + P", "Toggle Markdown preview"],
      ["Ctrl + Shift + C", "Insert checklist item"],
    ],
  },
];

function looksLikeMarkdown(content: string) {
  return /(^|\n)(#{1,6}\s|\s*[-*]\s|\s*[-*]\s\[[ xX]\]\s|>|`{3})|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|\$\$?[^$]+\$\$?/.test(content);
}

function AppShell() {
  const [location, setLocation] = useLocation();
  const [modal, setModal] = useState<ModalName>(null);
  const [mobilePane, setMobilePane] = useState<MobilePane>("list");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [noteListOpen, setNoteListOpen] = useState(true);
  const [isNarrow, setIsNarrow] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const state = useNotesStore();
  const isTrashView = state.selectedTag === "trash";
  const visibleNotes = useMemo(() => {
    if (!isTrashView) return selectVisibleNotes(state);
    const query = state.query.trim().toLowerCase();
    return state.notes
      .filter(note => note.deletedAt)
      .filter(note => !query || [note.title, note.content, ...note.tags].join(" ").toLowerCase().includes(query))
      .sort((a, b) => (b.deletedAt || "").localeCompare(a.deletedAt || ""));
  }, [isTrashView, state.notes, state.query, state.selectedTag, state.settings.sortMode]);
  const deletedNotes = state.notes.filter(note => note.deletedAt);
  const selectedNote = isTrashView
    ? state.notes.find(note => note.id === state.selectedNoteId && note.deletedAt) || visibleNotes[0]
    : state.notes.find(note => note.id === state.selectedNoteId && !note.deletedAt) || visibleNotes[0] || state.notes.find(note => !note.deletedAt);

  useEffect(() => {
    if (typeof matchMedia === "undefined") return;
    const media = matchMedia("(max-width: 720px)");
    const sync = () => setIsNarrow(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    function applyTheme() {
      const nextTheme = state.settings.theme === "system" && typeof matchMedia !== "undefined"
        ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : state.settings.theme;
      document.documentElement.dataset.theme = nextTheme;
    }
    applyTheme();
    if (state.settings.theme !== "system" || typeof matchMedia === "undefined") return;
    const media = matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [state.settings.theme]);

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

  useEffect(() => {
    if (!state.settings.keyboardShortcuts) return;
    hotkeys("ctrl+/", event => {
      event.preventDefault();
      setModal("shortcuts");
    });
    hotkeys("ctrl+k", event => {
      event.preventDefault();
      setModal("command");
    });
    hotkeys("ctrl+shift+i,command+n", event => {
      event.preventDefault();
      const id = state.createNote("", state.selectedTag === "all" || state.selectedTag === "trash" ? [] : [state.selectedTag]);
      setLocation(`/note/${id}`);
      setMobilePane("editor");
      toast.success("New note created");
    });
    hotkeys("ctrl+shift+s,command+l", event => {
      event.preventDefault();
      searchRef.current?.focus();
    });
    hotkeys("ctrl+g", event => {
      event.preventDefault();
      jumpMatch(1);
    });
    hotkeys("ctrl+shift+g", event => {
      event.preventDefault();
      jumpMatch(-1);
    });
    hotkeys("ctrl+shift+u", event => {
      event.preventDefault();
      setSidebarOpen(value => !value);
    });
    hotkeys("ctrl+shift+k", event => {
      event.preventDefault();
      selectRelativeNote(-1);
    });
    hotkeys("ctrl+shift+j", event => {
      event.preventDefault();
      selectRelativeNote(1);
    });
    hotkeys("ctrl+shift+y", event => {
      event.preventDefault();
      toggleContentTagsFocus();
    });
    hotkeys("ctrl+shift+l", event => {
      event.preventDefault();
      setNoteListOpen(value => !value);
    });
    hotkeys("ctrl+shift+p", event => {
      event.preventDefault();
      window.dispatchEvent(new CustomEvent("quicknote-toggle-preview"));
    });
    hotkeys("ctrl+shift+c", event => {
      event.preventDefault();
      insertChecklist();
    });
    hotkeys("ctrl+h", event => {
      event.preventDefault();
      setModal("history");
    });
    hotkeys("ctrl+shift+f", event => {
      event.preventDefault();
      state.replaceSettings({ focusMode: !state.settings.focusMode });
    });
    hotkeys("ctrl+shift+space", event => {
      event.preventDefault();
      setModal("quick-capture");
    });
    hotkeys("ctrl+shift+t", event => {
      event.preventDefault();
      setModal("templates");
    });
    return () => hotkeys.unbind("ctrl+/,ctrl+k,ctrl+shift+i,command+n,ctrl+shift+s,command+l,ctrl+g,ctrl+shift+g,ctrl+shift+u,ctrl+shift+k,ctrl+shift+j,ctrl+shift+y,ctrl+shift+l,ctrl+shift+p,ctrl+shift+c,ctrl+h,ctrl+shift+f,ctrl+shift+space,ctrl+shift+t");
  }, [selectedNote?.id, state.query, state.settings.focusMode, state.settings.keyboardShortcuts, state.selectedTag, visibleNotes, state, setLocation, jumpMatch, selectRelativeNote, toggleContentTagsFocus, insertChecklist]);

  useEffect(() => {
    const match = location.match(/^\/note\/(.+)$/);
    if (match?.[1] && state.notes.some(note => note.id === match[1])) {
      state.selectNote(match[1]);
      setMobilePane("editor");
    }
    if (location === "/settings") setModal("settings");
  }, [location, state.notes.length]);

  function createNote() {
    const id = state.createNote("", state.selectedTag === "all" || isTrashView ? [] : [state.selectedTag]);
    if (isTrashView) state.setSelectedTag("all");
    setLocation(`/note/${id}`);
    setMobilePane("editor");
    requestAnimationFrame(() => editorRef.current?.focus());
  }

  function createCanvasNote(engine: CanvasEngine = "tldraw") {
    const id = state.createCanvasNote("Untitled Canvas", state.selectedTag === "all" || isTrashView ? [] : [state.selectedTag], engine);
    if (isTrashView) state.setSelectedTag("all");
    setLocation(`/note/${id}`);
    setMobilePane("editor");
    toast.success("Canvas created!");
  }

  function selectNote(note: Note) {
    state.selectNote(note.id);
    setLocation(`/note/${note.id}`);
    setMobilePane("editor");
  }

  function selectRelativeNote(direction: -1 | 1) {
    if (!selectedNote || visibleNotes.length === 0) return;
    const index = visibleNotes.findIndex(note => note.id === selectedNote.id);
    const next = visibleNotes[Math.min(Math.max((index < 0 ? 0 : index) + direction, 0), visibleNotes.length - 1)];
    if (next) selectNote(next);
  }

  function jumpMatch(direction: -1 | 1) {
    if (!selectedNote) return;
    const query = state.query.trim();
    if (!query) {
      toast.error("Search query is empty");
      searchRef.current?.focus();
      return;
    }
    setMobilePane("editor");
    requestAnimationFrame(() => {
      const element = editorRef.current;
      if (!element) {
        toast.error("Open edit mode to jump matches");
        return;
      }
      const haystack = selectedNote.content.toLowerCase();
      const needle = query.toLowerCase();
      const start = direction > 0 ? element.selectionEnd : Math.max(element.selectionStart - 1, 0);
      let index = direction > 0 ? haystack.indexOf(needle, start) : haystack.lastIndexOf(needle, start);
      if (index < 0) index = direction > 0 ? haystack.indexOf(needle) : haystack.lastIndexOf(needle);
      if (index >= 0) {
        element.focus();
        element.setSelectionRange(index, index + query.length);
      } else {
        toast.error("No match in note");
      }
    });
  }

  function toggleContentTagsFocus() {
    const active = document.activeElement;
    if (active === tagInputRef.current) {
      editorRef.current?.focus();
    } else {
      tagInputRef.current?.focus();
    }
  }

  function insertChecklist() {
    if (!selectedNote) return;
    const element = editorRef.current;
    const insertion = "- [ ] ";
    if (!element) {
      state.updateNote(selectedNote.id, `${selectedNote.content}\n${insertion}`);
      return;
    }
    const start = element.selectionStart;
    const end = element.selectionEnd;
    const next = `${selectedNote.content.slice(0, start)}${insertion}${selectedNote.content.slice(end)}`;
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
  }

  function saveTags() {
    if (!selectedNote) return;
    state.setTags(selectedNote.id, tagDraft.split(","));
    setTagDraft("");
    toast.success("Tags updated");
  }

  const currentViewTitle =
    state.selectedTag === "all" ? "All Notes" : state.selectedTag === "pinned" ? "Pinned" : state.selectedTag === "trash" ? "Trash" : `#${state.selectedTag}`;

  function openTrash() {
    state.setSelectedTag("trash");
    const firstDeleted = state.notes.find(note => note.deletedAt);
    if (firstDeleted) state.selectNote(firstDeleted.id);
    setSidebarOpen(false);
    setMobilePane("list");
  }

  function restoreSelectedNote() {
    if (!selectedNote) return;
    state.restoreNote(selectedNote.id);
    toast.success("Note restored");
    const nextDeleted = deletedNotes.find(note => note.id !== selectedNote.id);
    if (nextDeleted) state.selectNote(nextDeleted.id);
    else state.setSelectedTag("all");
  }

  function deleteSelectedForever() {
    if (!selectedNote) return;
    const nextDeleted = deletedNotes.find(note => note.id !== selectedNote.id);
    state.deleteForever(selectedNote.id);
    toast.success("Note deleted forever");
    if (nextDeleted) state.selectNote(nextDeleted.id);
    else state.setSelectedTag("all");
  }

  function emptyTrash() {
    state.emptyTrash();
    state.setSelectedTag("all");
    toast.success("Trash emptied");
  }

  async function exportAllNotes() {
    const bytes = await getNoteWorker().exportZip(state.notes.filter(note => !note.deletedAt));
    saveAs(new Blob([bytes], { type: "application/zip" }), "quicknote-export.zip");
    toast.success("Export downloaded");
  }

  function handleQuickCapture(content: string, tags: string[]) {
    const id = state.createNote(content, tags);
    setLocation(`/note/${id}`);
    toast.success("Note captured!");
  }

  function handleSelectTemplate(template: NoteTemplate) {
    const id = state.createNote(template.content, template.tags);
    if (isTrashView) state.setSelectedTag("all");
    setLocation(`/note/${id}`);
    setMobilePane("editor");
    toast.success(`Created from ${template.name} template`);
  }

  const commandActions = [
    { label: "Create new note", shortcut: "Ctrl + Shift + I", action: createNote },
    { label: "Quick capture", shortcut: "Ctrl + Shift + Space", action: () => setModal("quick-capture") },
    { label: "New from template", shortcut: "Ctrl + Shift + T", action: () => setModal("templates") },
    { label: "Focus search field", shortcut: "Ctrl + Shift + S", action: () => searchRef.current?.focus() },
    { label: "Toggle focus mode", shortcut: "Ctrl + Shift + F", action: () => state.replaceSettings({ focusMode: !state.settings.focusMode }) },
    { label: "Toggle tag list", shortcut: "Ctrl + Shift + U", action: () => setSidebarOpen(value => !value) },
    { label: "Toggle note list", shortcut: "Ctrl + Shift + L", action: () => setNoteListOpen(value => !value) },
    { label: "Keyboard shortcuts", shortcut: "Ctrl + /", action: () => setModal("shortcuts") },
    { label: "Settings", shortcut: "", action: () => setModal("settings") },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Global styles={{ body: { margin: 0 } }} />
      <div className={`app-shell display-${state.settings.noteDisplay} line-${state.settings.lineLength} ${state.settings.focusMode ? "is-focus-mode" : ""} ${sidebarOpen ? "sidebar-open" : ""} ${noteListOpen ? "" : "note-list-hidden"}`}>
        <Toaster position="bottom-right" />
        {mobilePane !== "editor" ? (
          <MobileTopBar
            pane={mobilePane}
            setPane={setMobilePane}
            title={currentViewTitle}
            sidebarOpen={sidebarOpen}
            toggleSidebar={() => setSidebarOpen(value => !value)}
            createNote={createNote}
            openSettings={() => setModal("settings")}
          />
        ) : null}
        {sidebarOpen ? <button className="sidebar-backdrop" type="button" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} /> : null}
        <aside className={`tag-pane ${sidebarOpen ? "mobile-open" : ""}`}>
          <div className="app-menu-main">
          <button className="tag-row" type="button" onClick={() => { setModal("quick-capture"); setSidebarOpen(false); }}>
            <Icon path={mdiLightningBolt} size={0.75} /> Quick Capture
          </button>
          <button className="tag-row" type="button" onClick={() => { setModal("templates"); setSidebarOpen(false); }}>
            <Icon path={mdiFileDocumentOutline} size={0.75} /> Templates
          </button>
          <button className="tag-row" type="button" onClick={() => { setModal("canvas-engine"); setSidebarOpen(false); }}>
            <Icon path={mdiDrawing} size={0.75} /> New Canvas
          </button>
          <hr style={{ margin: "8px 0", border: "none", borderTop: "1px solid var(--border)" }} />
          <button className={`tag-row ${state.selectedTag === "all" ? "selected" : ""}`} type="button" onClick={() => { state.setSelectedTag("all"); setSidebarOpen(false); }}>
            <Icon path={mdiArchiveArrowDownOutline} size={0.75} /> All Notes
          </button>
          <button className={`tag-row ${state.selectedTag === "trash" ? "selected" : ""}`} type="button" onClick={openTrash}>
            <Icon path={mdiDeleteOutline} size={0.75} /> Trash
            {deletedNotes.length > 0 ? <span className="count-pill">{deletedNotes.length}</span> : null}
          </button>
          <button className="tag-row" type="button" onClick={() => { setModal("settings"); setSidebarOpen(false); }}>
            <Icon path={mdiCogOutline} size={0.75} /> Settings
          </button>
          </div>
          <div className="sidebar-footer">
            <div className="server-status"><Icon path={mdiWifi} size={0.72} /> Server connection</div>
            <button type="button" onClick={() => { setModal("shortcuts"); setSidebarOpen(false); }}>
              Keyboard Shortcuts
            </button>
            <button type="button" onClick={() => toast("Quicknote is a local-first notes app.")}>
              Help & Support&nbsp;&nbsp; About
            </button>
          </div>
        </aside>
        <section className={`note-list-pane ${mobilePane === "list" ? "mobile-open" : ""}`} aria-hidden={!noteListOpen && mobilePane !== "list"}>
          <div className="list-toolbar">
            {iconButtonLabel("Menu", mdiMenu, () => setSidebarOpen(value => !value), sidebarOpen)}
            <strong className="list-title">{currentViewTitle}</strong>
            <div className="list-toolbar-actions">
              {isTrashView ? null : iconButtonLabel("New note", mdiSquareEditOutline, createNote)}
              {iconButtonLabel("Toggle focus mode", mdiViewSplitVertical, () => state.replaceSettings({ focusMode: !state.settings.focusMode }), state.settings.focusMode)}
              {iconButtonLabel("Hide notes list", mdiChevronLeft, () => setNoteListOpen(false))}
            </div>
          </div>
          <div className="search-row">
            <Icon path={mdiMagnify} size={0.8} />
            <input ref={searchRef} value={state.query} onChange={event => state.setQuery(event.target.value)} placeholder="Search all notes and tags" />
            <select aria-label="Sort notes" value={state.settings.sortMode} onChange={event => state.replaceSettings({ sortMode: event.target.value as SortMode })}>
              <option value="modified-desc">Modified: Newest</option>
              <option value="modified-asc">Modified: Oldest</option>
              <option value="created-desc">Created: Newest</option>
              <option value="created-asc">Created: Oldest</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
            </select>
          </div>
          {visibleNotes.length === 0 ? (
            <div className="empty-state">{isTrashView ? "Trash is empty." : "No notes match this view."}</div>
          ) : (
            <Virtuoso
              className="virtuoso-list"
              data={visibleNotes}
              itemContent={(_, note) => (
                <NoteListItem
                  note={note}
                  selected={note.id === selectedNote?.id}
                  previewLines={state.settings.previewLines}
                  onSelect={() => selectNote(note)}
                  onPin={() => state.togglePin(note.id)}
                  onDelete={() => { state.deleteNote(note.id); toast.success("Note moved to trash"); }}
                  isTrashView={isTrashView}
                />
              )}
            />
          )}
          {isTrashView && deletedNotes.length > 0 ? (
            <button className="empty-trash-button" type="button" onClick={emptyTrash}>Empty Trash</button>
          ) : null}
        </section>
        <main className={`editor-pane ${mobilePane === "editor" ? "mobile-open" : ""}`}>
          <Switch>
            <Route path="/published/:slug">
              {params => <PublishedView note={state.notes.find(note => note.shareSlug === params.slug)} />}
            </Route>
            <Route>
              {selectedNote ? (
                selectedNote.noteType === "canvas" ? (
                  selectedNote.canvasEngine === "tldraw" ? (
                    <CanvasEditor
                      note={selectedNote}
                      onUpdate={state.updateNoteData}
                      noteListOpen={noteListOpen}
                      showNoteList={() => setNoteListOpen(true)}
                      createNote={createNote}
                    />
                  ) : (
                    <ExcalidrawEditor
                      note={selectedNote}
                      onUpdate={state.updateNoteData}
                      noteListOpen={noteListOpen}
                      showNoteList={() => setNoteListOpen(true)}
                      createNote={createNote}
                    />
                  )
                ) : (
                  <Editor
                    note={selectedNote}
                    settings={state.settings}
                    editorRef={editorRef}
                    setModal={setModal}
                    updateContent={content => state.updateNote(selectedNote.id, content)}
                    togglePin={() => state.togglePin(selectedNote.id)}
                    toggleMarkdown={() => state.toggleMarkdown(selectedNote.id)}
                    deleteNote={() => {
                      state.deleteNote(selectedNote.id);
                      toast.success("Note moved to trash");
                    }}
                    insertChecklist={insertChecklist}
                    tagDraft={tagDraft}
                    setTagDraft={setTagDraft}
                    saveTags={saveTags}
                    togglePublish={() => selectedNote.isPublished ? state.unpublishNote(selectedNote.id) : state.publishNote(selectedNote.id)}
                    onBackToList={() => setMobilePane("list")}
                    noteListOpen={noteListOpen}
                    showNoteList={() => setNoteListOpen(true)}
                    createNote={createNote}
                    isTrashView={isTrashView}
                    restoreNote={restoreSelectedNote}
                    deleteForever={deleteSelectedForever}
                    isNarrow={isNarrow}
                    tagInputRef={tagInputRef}
                  />
                )
              ) : (
                <div className="editor-empty">{isTrashView ? "Select a deleted note." : <Skeleton count={5} />}</div>
              )}
            </Route>
          </Switch>
        </main>
        <ShareModal note={selectedNote} isOpen={modal === "share"} onClose={() => setModal(null)} />
        <HistoryModal note={selectedNote} isOpen={modal === "history"} onClose={() => setModal(null)} />
        <SettingsModal
          settings={state.settings}
          isOpen={modal === "settings"}
          onClose={() => setModal(null)}
          onChange={state.replaceSettings}
          onImport={() => setModal("import")}
          onExport={exportAllNotes}
        />
        <ShortcutsModal isOpen={modal === "shortcuts"} onClose={() => setModal(null)} />
        <CommandPaletteModal isOpen={modal === "command"} onClose={() => setModal(null)} commands={commandActions} />
        <QuickCaptureModal isOpen={modal === "quick-capture"} onClose={() => setModal(null)} onSave={handleQuickCapture} />
        <TemplatePickerModal isOpen={modal === "templates"} onClose={() => setModal(null)} onSelectTemplate={handleSelectTemplate} />
        <CanvasEngineModal isOpen={modal === "canvas-engine"} onClose={() => setModal(null)} onSelect={createCanvasNote} />
        <ImportModal isOpen={modal === "import"} onClose={() => setModal(null)} />
      </div>
    </ThemeProvider>
  );
}

function MobileTopBar({
  pane,
  setPane,
  title,
  sidebarOpen,
  toggleSidebar,
  createNote,
  openSettings,
}: {
  pane: MobilePane;
  setPane: (pane: MobilePane) => void;
  title: string;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  createNote: () => void;
  openSettings: () => void;
}) {
  return (
    <header className="mobile-topbar">
      {iconButtonLabel("Menu", mdiMenu, toggleSidebar, sidebarOpen)}
      <button type="button" className="mobile-tab" onClick={() => setPane("list")}>
        {title}
      </button>
      <button type="button" className="mobile-tab" onClick={() => setPane("editor")}>
        Editor
      </button>
      {iconButtonLabel("New note", mdiSquareEditOutline, createNote)}
      {iconButtonLabel("Settings", mdiCogOutline, openSettings)}
    </header>
  );
}

function NoteListItem({ note, selected, previewLines, onSelect, onPin, onDelete, isTrashView = false }: { note: Note; selected: boolean; previewLines: number; onSelect: () => void; onPin: () => void; onDelete: () => void; isTrashView?: boolean }) {
  const preview = note.noteType === "canvas"
    ? "Canvas whiteboard"
    : note.content.replace(/\s+/g, " ") || "Empty note";

  return (
    <article className={`note-list-item ${selected ? "selected" : ""}`} onClick={onSelect}>
      <div className="note-list-title">
        <span>{note.title}</span>
        {!isTrashView ? (
          <div className="note-list-actions">
            <button type="button" aria-label="Toggle pin" onClick={event => { event.stopPropagation(); onPin(); }}>
              <Icon path={note.isPinned ? mdiPin : mdiPinOutline} size={0.68} />
            </button>
            <button type="button" aria-label="Delete note" className="note-delete-btn" onClick={event => { event.stopPropagation(); onDelete(); }}>
              <Icon path={mdiDeleteOutline} size={0.68} />
            </button>
          </div>
        ) : null}
      </div>
      <p style={{ WebkitLineClamp: previewLines }}>{preview}</p>
      <div className="note-meta">
        <span>{isTrashView && note.deletedAt ? `Deleted ${timeagoFormat(note.deletedAt)}` : timeagoFormat(note.updatedAt)}</span>
        {note.tags.slice(0, 2).map(tag => <span key={tag}>#{tag}</span>)}
      </div>
    </article>
  );
}

function Editor(props: {
  note: Note;
  settings: Settings;
  editorRef: RefObject<HTMLTextAreaElement | null>;
  setModal: (modal: ModalName) => void;
  updateContent: (content: string) => void;
  togglePin: () => void;
  toggleMarkdown: () => void;
  deleteNote: () => void;
  insertChecklist: () => void;
  tagDraft: string;
  setTagDraft: (value: string) => void;
  saveTags: () => void;
  togglePublish: () => void;
  onBackToList: () => void;
  noteListOpen: boolean;
  showNoteList: () => void;
  createNote: () => void;
  isTrashView: boolean;
  restoreNote: () => void;
  deleteForever: () => void;
  isNarrow: boolean;
  tagInputRef: RefObject<HTMLInputElement | null>;
}) {
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewMode, setPreviewMode] = useState<PreviewMode>(props.isNarrow ? "edit" : props.note.isMarkdown || looksLikeMarkdown(props.note.content) ? "split" : "edit");
  const [infoOpen, setInfoOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve(getNoteWorker().renderMarkdown(props.note.content))
      .then(html => {
        if (!cancelled) setPreviewHtml(html);
      });
    return () => {
      cancelled = true;
    };
  }, [props.note.content]);

  useEffect(() => {
    setPreviewMode(props.isNarrow ? "edit" : props.note.isMarkdown || looksLikeMarkdown(props.note.content) ? "split" : "edit");
    setInfoOpen(false);
    setMoreOpen(false);
  }, [props.note.id, props.isNarrow]);

  const words = props.note.content.trim() ? props.note.content.trim().split(/\s+/).length : 0;
  const characters = props.note.content.length;
  const publishedSlug = props.note.shareSlug || `${props.note.id.slice(0, 8)}-${props.note.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const internalLink = `${globalThis.location.origin}/note/${props.note.id}`;
  const publishedLink = `${globalThis.location.origin}/published/${publishedSlug}`;

  function copyText(value: string, message: string) {
    if (!navigator.clipboard) {
      toast.error("Clipboard unavailable");
      return;
    }
    void navigator.clipboard.writeText(value).then(() => toast.success(message)).catch(() => toast.error("Copy failed"));
  }

  function togglePreview() {
    if (previewMode === "edit") {
      if (!props.note.isMarkdown) props.toggleMarkdown();
      setPreviewMode("split");
    } else {
      setPreviewMode("edit");
    }
  }

  useEffect(() => {
    function handleTogglePreview() {
      if (!props.isTrashView) togglePreview();
    }
    window.addEventListener("quicknote-toggle-preview", handleTogglePreview);
    return () => window.removeEventListener("quicknote-toggle-preview", handleTogglePreview);
  });

  function closeMenus() {
    setInfoOpen(false);
    setMoreOpen(false);
  }

  return (
    <>
      <div className={`editor-toolbar ${props.noteListOpen ? "" : "is-note-list-hidden"}`}>
        {!props.noteListOpen ? (
          <div className="hidden-list-actions">
            {iconButtonLabel("New note", mdiSquareEditOutline, props.createNote)}
            {iconButtonLabel("Show notes list", mdiViewSplitVertical, props.showNoteList)}
          </div>
        ) : null}
        <button className="mobile-editor-back" type="button" aria-label="Back to notes" onClick={props.onBackToList}>
          <Icon path={mdiArrowLeft} size={0.8} />
        </button>
        {props.isTrashView ? (
          <div className="trash-note-actions">
            <button className="danger-outline-action" type="button" onClick={props.deleteForever}>Delete Forever</button>
            <button className="restore-note-action" type="button" onClick={props.restoreNote}>Restore Note</button>
          </div>
        ) : (
          <>
            <div className="editor-title">
              <strong>{props.note.title}</strong>
              <span>{dayjs(props.note.updatedAt).fromNow?.() || dayjs(props.note.updatedAt).format("MMM D")}</span>
            </div>
            <div className="toolbar-actions">
          {iconButtonLabel(previewMode === "edit" ? "Show preview" : "Hide preview", mdiEyeOutline, togglePreview, previewMode !== "edit")}
          {iconButtonLabel("Insert checklist", mdiFormatListChecks, props.insertChecklist)}
          <div className="toolbar-popover-wrap">
            {iconButtonLabel("Document info", mdiInformationOutline, () => {
              setInfoOpen(value => !value);
              setMoreOpen(false);
            }, infoOpen)}
            {infoOpen ? (
              <section className="document-info-popover" role="dialog" aria-label="Document information">
                <header>
                  <strong>Document</strong>
                  <button type="button" aria-label="Close document info" onClick={() => setInfoOpen(false)}>
                    <Icon path={mdiClose} size={0.7} />
                  </button>
                </header>
                <dl>
                  <div><dt>Last synced</dt><dd>{dayjs(props.note.updatedAt).format("MMM D, YYYY, h:mm A")}</dd></div>
                  <div><dt>Modified</dt><dd>{dayjs(props.note.updatedAt).format("MMM D, YYYY, h:mm A")}</dd></div>
                  <div><dt>Created</dt><dd>{dayjs(props.note.createdAt).format("MMM D, YYYY, h:mm A")}</dd></div>
                  <div><dt>Words</dt><dd>{words}</dd></div>
                  <div><dt>Characters</dt><dd>{characters}</dd></div>
                </dl>
              </section>
            ) : null}
          </div>
          <div className="toolbar-popover-wrap">
            {iconButtonLabel("More actions", mdiDotsHorizontalCircleOutline, () => {
              setMoreOpen(value => !value);
              setInfoOpen(false);
            }, moreOpen)}
            {moreOpen ? (
              <div className="more-menu-popover" role="menu" aria-label="More note actions">
                <label className="menu-check">
                  <span>Pin to top</span>
                  <input type="checkbox" checked={props.note.isPinned} onChange={props.togglePin} />
                </label>
                <label className="menu-check">
                  <span>Markdown</span>
                  <input type="checkbox" checked={props.note.isMarkdown} onChange={props.toggleMarkdown} />
                </label>
                <button type="button" role="menuitem" onClick={() => copyText(internalLink, "Internal link copied")}>Copy Internal Link</button>
                <button type="button" role="menuitem" disabled={props.note.history.length === 0} onClick={() => { closeMenus(); props.setModal("history"); }}>History</button>
                <hr />
                <label className="menu-check">
                  <span>Publish</span>
                  <input type="checkbox" checked={props.note.isPublished} onChange={props.togglePublish} />
                </label>
                <button type="button" role="menuitem" disabled={!props.note.isPublished} onClick={() => copyText(publishedLink, "Published link copied")}>Copy Link</button>
                <button type="button" role="menuitem" onClick={() => { closeMenus(); props.setModal("share"); }}>Collaborate...</button>
                <hr />
                <button type="button" role="menuitem" className="danger-menu-item" onClick={() => { closeMenus(); props.deleteNote(); }}>Move to Trash</button>
              </div>
            ) : null}
          </div>
            </div>
          </>
        )}
      </div>
      {props.isTrashView ? (
        <article className="trash-note-view" data-font={props.settings.editorFontFamily} style={{ fontSize: props.settings.editorFontSize }}>
          {props.note.content.split(/\r?\n/).map((line, index) => line ? <p key={index}>{line}</p> : <br key={index} />)}
        </article>
      ) : <div className={`editor-workspace preview-${previewMode}`}>
        {previewMode !== "preview" ? (
          <textarea
            ref={props.editorRef}
            value={props.note.content}
            onChange={event => props.updateContent(event.target.value)}
            style={{ fontSize: props.settings.editorFontSize }}
            data-font={props.settings.editorFontFamily}
            placeholder="Start typing..."
          />
        ) : null}
        {previewMode !== "edit" ? (
          <section
            className="markdown-preview"
            data-font={props.settings.editorFontFamily}
            style={{ fontSize: props.settings.editorFontSize }}
            dangerouslySetInnerHTML={{ __html: previewHtml || "<p>Preview will appear here.</p>" }}
          />
        ) : null}
      </div>}
      {!props.isTrashView ? <div className="tag-editor tag-editor-bottom">
        <div className="tag-chips">{props.note.tags.length ? props.note.tags.map(tag => <span key={tag}>#{tag}</span>) : <span>No tags</span>}</div>
        <input ref={props.tagInputRef} value={props.tagDraft} onChange={event => props.setTagDraft(event.target.value)} placeholder="Add tags, comma separated" />
        <button type="button" onClick={props.saveTags}>Save tags</button>
      </div> : null}
    </>
  );
}

function PublishedView({ note }: { note?: Note }) {
  const [html, setHtml] = useState("");
  useEffect(() => {
    if (!note) return;
    Promise.resolve(getNoteWorker().renderMarkdown(note.content)).then(setHtml);
  }, [note?.id, note?.content]);

  if (!note || !note.isPublished) return <div className="published-note">Published note not found.</div>;
  return (
    <article className="published-note">
      <h1>{note.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: note.isMarkdown ? html : note.content.replace(/\n/g, "<br />") }} />
    </article>
  );
}

function ShareModal({ note, isOpen, onClose }: { note?: Note; isOpen: boolean; onClose: () => void }) {
  const publish = useNotesStore(state => state.publishNote);
  const unpublish = useNotesStore(state => state.unpublishNote);
  const addCollaborator = useNotesStore(state => state.addCollaborator);
  const [email, setEmail] = useState("");
  if (!note) return null;
  const link = `${location.origin}/published/${note.shareSlug || `${note.id.slice(0, 8)}-${note.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}`;
  return (
    <AppModal isOpen={isOpen} onClose={onClose} title="Share note">
      <div className="modal-stack">
        <p>Publish a view-only link or add collaborator emails for local tracking.</p>
        <div className="share-link">{note.isPublished ? link : "Publish this note to create a local link."}</div>
        <div className="modal-actions">
          <button type="button" onClick={() => { publish(note.id); toast.success("Note published"); }}>Publish note</button>
          <button type="button" onClick={() => unpublish(note.id)}>Unpublish</button>
        </div>
        <div className="inline-form">
          <input value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" />
          <button type="button" onClick={() => { addCollaborator(note.id, email); setEmail(""); }}>Add collaborator</button>
        </div>
        <div className="tag-chips">{note.collaborators.map(item => <span key={item}>{item}</span>)}</div>
      </div>
    </AppModal>
  );
}

function HistoryModal({ note, isOpen, onClose }: { note?: Note; isOpen: boolean; onClose: () => void }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const entries = note?.history || [];
  const virtualizer = useVirtualizer({ count: entries.length, getScrollElement: () => parentRef.current, estimateSize: () => 120 });
  const [diffHtml, setDiffHtml] = useState("");

  async function showDiff(entry: HistoryEntry) {
    if (!note) return;
    setDiffHtml(await getNoteWorker().buildDiff(entry.content, note.content));
  }

  return (
    <AppModal isOpen={isOpen} onClose={onClose} title="History">
      <div ref={parentRef} className="history-list">
        <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map(row => {
            const entry = entries[row.index];
            if (!entry) return null;
            return (
              <button key={entry.id} type="button" className="history-row" style={{ transform: `translateY(${row.start}px)` }} onClick={() => showDiff(entry)}>
                <strong>{entry.title}</strong>
                <span>{dayjs(entry.createdAt).format("MMM D, YYYY HH:mm")}</span>
                <p>{entry.content.slice(0, 140)}</p>
              </button>
            );
          })}
        </div>
      </div>
      <div className="diff-preview" dangerouslySetInnerHTML={{ __html: diffHtml || "<p>Select a version to compare changes.</p>" }} />
    </AppModal>
  );
}

type SettingsTab = "general" | "editor" | "appearance" | "data" | "advanced";

function SettingsModal({
  settings,
  isOpen,
  onClose,
  onChange,
  onImport,
  onExport,
}: {
  settings: Settings;
  isOpen: boolean;
  onClose: () => void;
  onChange: (settings: Partial<Settings>) => void;
  onImport: () => void;
  onExport: () => void;
}) {
  const cronOk = validateCron("*/10 * * * *");
  const nextBackup = CronosExpression.parse("*/10 * * * *").nextDate(new Date());
  const [tab, setTab] = useState<SettingsTab>("general");
  const [searchQuery, setSearchQuery] = useState("");

  const displayOptions: Array<[NoteDisplayMode, string, Settings["previewLines"]]> = [
    ["comfy", "Comfy", 2],
    ["condensed", "Condensed", 1],
    ["expanded", "Expanded", 3],
  ];
  const sortOptions: Array<[SortMode, string]> = [
    ["name-asc", "Name: A-Z"],
    ["name-desc", "Name: Z-A"],
    ["created-desc", "Created: Newest"],
    ["created-asc", "Created: Oldest"],
    ["modified-desc", "Modified: Newest"],
    ["modified-asc", "Modified: Oldest"],
  ];
  const fontOptions: Array<[EditorFontFamily, string]> = [
    ["system", "System UI"],
    ["atkinson", "Atkinson Hyperlegible"],
    ["inter", "Inter"],
    ["serif", "Source Serif"],
    ["mono", "Monospace"],
  ];

  function exportSettings() {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    saveAs(blob, `quicknote-settings-${new Date().toISOString().split("T")[0]}.json`);
    toast.success("Settings exported");
  }

  function importSettings() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        onChange(imported);
        toast.success("Settings imported");
      } catch (error) {
        toast.error("Failed to import settings");
      }
    };
    input.click();
  }

  function resetSettings() {
    if (!confirm("Reset all settings to default? This cannot be undone.")) return;
    onChange({
      sortMode: "modified-desc",
      previewLines: 2,
      theme: "dark",
      editorFontSize: 17,
      editorFontFamily: "system",
      focusMode: false,
      noteDisplay: "condensed",
      lineLength: "narrow",
      sortTagsAlphabetically: false,
      keyboardShortcuts: true,
      notifyRemoteChanges: false,
    });
    toast.success("Settings reset to defaults");
  }

  function radioRow(label: string, checked: boolean, onSelect: () => void) {
    return (
      <button className="settings-choice-row" type="button" onClick={onSelect}>
        <span>{label}</span>
        <span className={`settings-radio ${checked ? "checked" : ""}`} aria-hidden="true" />
      </button>
    );
  }

  function switchRow(label: string, checked: boolean, onToggle: () => void) {
    return (
      <label className="settings-switch-row">
        <span>{label}</span>
        <input type="checkbox" checked={checked} onChange={onToggle} />
      </label>
    );
  }

  function actionRow(label: string, onClick: () => void) {
    return (
      <button className="settings-action-row" type="button" onClick={onClick}>
        <span>{label}</span>
        <Icon path={mdiChevronRight} size={0.72} />
      </button>
    );
  }

  return (
    <AppModal isOpen={isOpen} onClose={onClose} title="Settings" className="settings-modal">
      <div className="settings-search">
        <Icon path={mdiMagnify} size={0.8} />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search settings..."
        />
      </div>

      <div className="settings-tabs" role="tablist" aria-label="Settings sections">
        {(["general", "editor", "appearance", "data", "advanced"] as SettingsTab[]).map(item => (
          <button key={item} type="button" role="tab" aria-selected={tab === item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>
            {item[0]?.toUpperCase()}{item.slice(1)}
          </button>
        ))}
      </div>
      <div className="settings-panel">

        {tab === "advanced" ? (
          <div className="settings-section-stack">
            <section className="settings-section">
              <h3>DANGER ZONE</h3>
              <div className="settings-card">
                <button className="settings-danger-button" type="button" onClick={resetSettings}>
                  <Icon path={mdiDeleteOutline} size={0.75} />
                  <span>Reset All Settings</span>
                </button>
                <p className="settings-note" style={{ margin: "8px 0 0", fontSize: "12px", color: "var(--muted)" }}>
                  This will reset all preferences to their default values. Your notes will not be affected.
                </p>
              </div>
            </section>
            <section className="settings-section">
              <h3>ABOUT</h3>
              <div className="settings-card">
                <div className="settings-static-row"><span>Version</span><strong>1.0.0</strong></div>
                <div className="settings-static-row"><span>Build</span><strong>2026.06.09</strong></div>
                <div className="settings-static-row"><span>Storage</span><strong>IndexedDB</strong></div>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </AppModal>
  );
}

function ShortcutsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AppModal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" className="shortcuts-modal">
      <div className="shortcuts-panel">
        {shortcutGroups.map(group => (
          <section className="shortcut-section" key={group.title}>
            <h3>{group.title}</h3>
            <div className="shortcut-card">
              {group.items.map(([keys, label]) => (
                <div className="shortcut-row" key={keys}>
                  <kbd>{keys}</kbd>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppModal>
  );
}

function CommandPaletteModal({ isOpen, onClose, commands }: { isOpen: boolean; onClose: () => void; commands: Array<{ label: string; shortcut: string; action: () => void }> }) {
  const [query, setQuery] = useState("");
  const filtered = commands.filter(command => command.label.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <AppModal isOpen={isOpen} onClose={onClose} title="Command Palette" className="command-modal">
      <div className="command-panel">
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search commands" autoFocus />
        <div className="command-list">
          {filtered.map(command => (
            <button
              type="button"
              key={command.label}
              onClick={() => {
                onClose();
                command.action();
              }}
            >
              <span>{command.label}</span>
              {command.shortcut ? <kbd>{command.shortcut}</kbd> : null}
            </button>
          ))}
        </div>
      </div>
    </AppModal>
  );
}

function ImportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const notes = useNotesStore(state => state.notes);
  const importNotes = useNotesStore(state => state.importNotes);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfStatus, setPdfStatus] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  async function exportZip() {
    const bytes = await getNoteWorker().exportZip(notes.filter(note => !note.deletedAt));
    saveAs(new Blob([bytes], { type: "application/zip" }), "quicknote-export.zip");
    toast.success("Export downloaded");
  }

  const dropzone = useDropzone({
    multiple: true,
    accept: importDropzoneAccept,
    async onDrop(files) {
      setImporting(true);
      const results = await importFiles(files, getNoteWorker());
      const messages: string[] = [];
      for (const result of results) {
        messages.push(`${result.fileName}: ${result.message}`);
        if (result.status === "success") {
          if (result.notes.length) importNotes(result.notes);
          if (result.pdfUrl) {
            setPdfUrl(current => {
              if (current) URL.revokeObjectURL(current);
              return result.pdfUrl || "";
            });
            setPdfStatus(result.pdfStatus || "");
          }
        }
      }
      setImportResults(messages);
      setImporting(false);
      const failed = results.filter(result => result.status === "error").length;
      if (failed) toast.error(`${failed} files failed. Valid files imported.`);
      else toast.success("Import processed");
    },
  });

  const dropzoneState = dropzone.isDragReject ? "reject" : dropzone.isDragActive ? "active" : importing ? "importing" : "idle";

  return (
    <AppModal isOpen={isOpen} onClose={onClose} title="Import and export">
      <div className="modal-stack">
        <div {...dropzone.getRootProps({ className: `dropzone dropzone-${dropzoneState}` })}>
          <input {...dropzone.getInputProps()} />
          <Icon path={mdiUploadOutline} size={1.2} />
          <strong>{importing ? "Importing files..." : "Drop Markdown, text, PDF, ZIP, or exported JSON files."}</strong>
          <span>TXT and Markdown become notes. PDF opens in preview mode.</span>
        </div>
        <button type="button" className="primary-action" onClick={exportZip}>
          <Icon path={mdiDownloadOutline} size={0.75} /> Export ZIP
        </button>
        {importResults.length ? (
          <ul className="import-results">
            {importResults.map(message => <li key={message}>{message}</li>)}
          </ul>
        ) : null}
        {pdfStatus ? <p className="settings-note"><Icon path={mdiFilePdfBox} size={0.75} /> {pdfStatus}</p> : null}
        {pdfUrl ? (
          <div className="pdf-preview">
            <PdfWorker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer fileUrl={pdfUrl} />
            </PdfWorker>
          </div>
        ) : null}
      </div>
    </AppModal>
  );
}

export function App() {
  return <AppShell />;
}

export default App;
