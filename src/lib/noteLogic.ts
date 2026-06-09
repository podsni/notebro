export type SortMode = "modified-desc" | "modified-asc" | "created-desc" | "created-asc" | "name-asc" | "name-desc";

export type HistoryEntry = {
  id: string;
  content: string;
  title: string;
  createdAt: string;
};

export type NoteType = "text" | "canvas";
export type CanvasEngine = "tldraw" | "excalidraw";

export type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  collaborators: string[];
  isPinned: boolean;
  isMarkdown: boolean;
  isPublished: boolean;
  shareSlug: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  history: HistoryEntry[];
  noteType?: NoteType;
  canvasEngine?: CanvasEngine;
};

const fallbackTitle = "Untitled";

export function titleFromContent(content: string): string {
  return content
    .split(/\r?\n/)
    .map(line => line.trim())
    .find(Boolean)
    ?.slice(0, 80) || fallbackTitle;
}

export function createNoteDraft(content = "", tags: string[] = [], now = new Date().toISOString()): Note {
  return {
    id: crypto.randomUUID(),
    title: titleFromContent(content),
    content,
    tags: normalizeTags(tags),
    collaborators: [],
    isPinned: false,
    isMarkdown: false,
    isPublished: false,
    shareSlug: "",
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    history: [],
    noteType: "text",
  };
}

export function createCanvasNoteDraft(title = "Untitled Canvas", tags: string[] = [], engine: CanvasEngine = "tldraw", now = new Date().toISOString()): Note {
  return {
    id: crypto.randomUUID(),
    title,
    content: "",
    tags: normalizeTags(tags),
    collaborators: [],
    isPinned: false,
    isMarkdown: false,
    isPublished: false,
    shareSlug: "",
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    history: [],
    noteType: "canvas",
    canvasEngine: engine,
  };
}

export function updateNoteContent(note: Note, content: string, now = new Date().toISOString()): Note {
  if (note.content === content) return note;

  return {
    ...note,
    content,
    title: titleFromContent(content),
    updatedAt: now,
    history: [
      {
        id: crypto.randomUUID(),
        title: note.title,
        content: note.content,
        createdAt: now,
      },
      ...note.history,
    ].slice(0, 40),
  };
}

export function normalizeTags(tags: string[]): string[] {
  return Array.from(new Set(tags.map(tag => tag.trim().toLowerCase()).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function sortNotes(notes: Note[], sortMode: SortMode): Note[] {
  return [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;

    switch (sortMode) {
      case "modified-asc":
        return a.updatedAt.localeCompare(b.updatedAt);
      case "created-desc":
        return b.createdAt.localeCompare(a.createdAt);
      case "created-asc":
        return a.createdAt.localeCompare(b.createdAt);
      case "name-asc":
        return a.title.localeCompare(b.title);
      case "name-desc":
        return b.title.localeCompare(a.title);
      case "modified-desc":
      default:
        return b.updatedAt.localeCompare(a.updatedAt);
    }
  });
}

export function filterNotes(notes: Note[], query: string, selectedTag = "all", includeDeleted = false): Note[] {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedTag = selectedTag.trim().toLowerCase();

  return notes.filter(note => {
    if (!includeDeleted && note.deletedAt) return false;
    if (normalizedTag !== "all" && !note.tags.includes(normalizedTag)) return false;
    if (!normalizedQuery) return true;

    const haystack = [note.title, note.content, ...note.tags].join(" ").toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

export function exportNotesToJson(notes: Note[]): string {
  return JSON.stringify(notes, null, 2);
}

export function importNotesFromJson(json: string): Note[] {
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) return [];
  return parsed.map(normalizeImportedNote).filter((note): note is Note => Boolean(note));
}

export function normalizeImportedNote(value: unknown): Note | null {
  if (!value || typeof value !== "object") return null;
  const note = value as Partial<Note>;
  if (
    typeof note.id !== "string" ||
    typeof note.title !== "string" ||
    typeof note.content !== "string" ||
    !Array.isArray(note.tags) ||
    typeof note.createdAt !== "string" ||
    typeof note.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    id: note.id,
    title: note.title || titleFromContent(note.content),
    content: note.content,
    tags: normalizeTags(note.tags.filter((tag): tag is string => typeof tag === "string")),
    collaborators: Array.isArray(note.collaborators) ? note.collaborators.filter((email): email is string => typeof email === "string") : [],
    isPinned: Boolean(note.isPinned),
    isMarkdown: Boolean(note.isMarkdown),
    isPublished: Boolean(note.isPublished),
    shareSlug: typeof note.shareSlug === "string" ? note.shareSlug : "",
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    deletedAt: typeof note.deletedAt === "string" ? note.deletedAt : null,
    history: Array.isArray(note.history)
      ? note.history.filter(
          (entry): entry is HistoryEntry =>
            Boolean(entry) &&
            typeof entry === "object" &&
            typeof (entry as Partial<HistoryEntry>).id === "string" &&
            typeof (entry as Partial<HistoryEntry>).title === "string" &&
            typeof (entry as Partial<HistoryEntry>).content === "string" &&
            typeof (entry as Partial<HistoryEntry>).createdAt === "string",
        )
      : [],
  };
}

export function isNote(value: unknown): value is Note {
  return Boolean(normalizeImportedNote(value));
}
