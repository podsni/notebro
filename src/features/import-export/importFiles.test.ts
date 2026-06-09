import { describe, expect, test } from "vitest";
import { classifyImportFile, createTextImportNote, importFiles } from "./importFiles";

const worker = {
  describePdf: (name: string, size: number) => `${name} ${size}`,
};

function file(name: string, content: string, type = "text/plain") {
  return new File([content], name, { type });
}

describe("import files", () => {
  test("classifies supported extensions case-insensitively", () => {
    expect(classifyImportFile("note.md")).toBe("markdown");
    expect(classifyImportFile("note.MD")).toBe("markdown");
    expect(classifyImportFile("note.txt")).toBe("text");
    expect(classifyImportFile("note.TXT")).toBe("text");
    expect(classifyImportFile("archive.JSON")).toBe("json");
  });

  test("creates markdown and text notes from filenames", () => {
    expect(createTextImportNote("Plan.MD", "# Plan").isMarkdown).toBe(true);
    expect(createTextImportNote("Plan.MD", "# Plan").title).toBe("Plan");
    expect(createTextImportNote("Draft.TXT", "Draft").isMarkdown).toBe(false);
  });

  test("imports markdown and text files as notes", async () => {
    const results = await importFiles([file("Plan.MD", "# Plan"), file("Draft.TXT", "Draft")], worker);

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({ status: "success", fileName: "Plan.MD" });
    expect(results[0]?.status === "success" ? results[0].notes[0]?.isMarkdown : false).toBe(true);
    expect(results[1]?.status === "success" ? results[1].notes[0]?.isMarkdown : true).toBe(false);
  });

  test("imports valid json and reports invalid json per file", async () => {
    const json = JSON.stringify([
      { id: "json-note", title: "JSON note", content: "Body", tags: [], createdAt: "2026-06-07T10:00:00.000Z", updatedAt: "2026-06-07T10:00:00.000Z" },
    ]);

    const results = await importFiles([file("notes.json", json, "application/json"), file("bad.json", "{", "application/json")], worker);

    expect(results[0]?.status === "success" ? results[0].notes.map(note => note.id) : []).toEqual(["json-note"]);
    expect(results[1]).toMatchObject({ status: "error", fileName: "bad.json" });
  });

  test("keeps mixed batch successes when one file fails", async () => {
    const results = await importFiles([file("one.md", "One"), file("bad.json", "{"), file("two.txt", "Two")], worker);

    expect(results.map(result => result.status)).toEqual(["success", "error", "success"]);
  });
});
