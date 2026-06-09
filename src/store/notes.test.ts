import { beforeEach, describe, expect, test, vi } from "vitest";
import { createNoteDraft, type Note } from "@/lib/noteLogic";

vi.mock("./indexedDbStorage", () => ({
  indexedDbStorage: {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
  },
}));

const { selectVisibleNotes, useNotesStore } = await import("./notes");
import type { NotesState, Settings } from "./notes";

const baseTime = "2026-06-07T10:00:00.000Z";

function note(overrides: Partial<Note>): Note {
  return {
    ...createNoteDraft("Base note", [], baseTime),
    id: "note-1",
    title: "Base note",
    ...overrides,
  };
}

const settings: Settings = {
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
};

beforeEach(() => {
  useNotesStore.setState({
    notes: [],
    selectedNoteId: "",
    selectedTag: "all",
    query: "",
    settings,
  });
});

describe("notes store", () => {
  test("imports new notes and selects first imported note", () => {
    const imported = [note({ id: "imported-1" }), note({ id: "imported-2" })];

    useNotesStore.getState().importNotes(imported);

    expect(useNotesStore.getState().notes.map(item => item.id)).toEqual(["imported-1", "imported-2"]);
    expect(useNotesStore.getState().selectedNoteId).toBe("imported-1");
  });

  test("does not duplicate imported notes with existing ids", () => {
    useNotesStore.setState({ notes: [note({ id: "existing" })], selectedNoteId: "existing" });

    useNotesStore.getState().importNotes([note({ id: "existing" }), note({ id: "fresh" })]);

    expect(useNotesStore.getState().notes.map(item => item.id)).toEqual(["fresh", "existing"]);
  });

  test("handles trash restore and delete forever selection", () => {
    const active = note({ id: "active" });
    const deleted = note({ id: "deleted", deletedAt: baseTime });
    useNotesStore.setState({ notes: [active, deleted], selectedNoteId: "deleted" });

    useNotesStore.getState().restoreNote("deleted");
    expect(useNotesStore.getState().notes.find(item => item.id === "deleted")?.deletedAt).toBeNull();

    useNotesStore.getState().deleteForever("deleted");
    expect(useNotesStore.getState().notes.map(item => item.id)).toEqual(["active"]);
    expect(useNotesStore.getState().selectedNoteId).toBe("active");
  });

  test("selectVisibleNotes filters pinned view and sorts results", () => {
    const state = {
      notes: [
        note({ id: "old", title: "Old", updatedAt: "2026-06-07T09:00:00.000Z" }),
        note({ id: "pin", title: "Pin", isPinned: true, updatedAt: "2026-06-07T08:00:00.000Z" }),
        note({ id: "new", title: "New", updatedAt: "2026-06-07T11:00:00.000Z" }),
      ],
      selectedTag: "pinned",
      query: "",
      settings,
    } as NotesState;

    expect(selectVisibleNotes(state).map(item => item.id)).toEqual(["pin"]);
  });
});
