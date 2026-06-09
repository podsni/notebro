import { BlobReader, TextWriter, ZipReader } from "@zip.js/zip.js";
import { createNoteDraft, importNotesFromJson, normalizeTags, titleFromContent, type Note } from "@/lib/noteLogic";
import type { ImportFileKind, ImportFileResult, ImportWorker } from "./importTypes";

const markdownExtensions = new Set(["md", "markdown"]);
const textExtensions = new Set(["txt", "text"]);
const knownTextExtensions = new Set([...markdownExtensions, ...textExtensions]);

export const importDropzoneAccept = {
  "text/markdown": [".md", ".markdown"],
  "text/plain": [".txt", ".text"],
  "application/json": [".json"],
  "application/zip": [".zip"],
  "application/pdf": [".pdf"],
};

export function getFileExtension(fileName: string): string {
  const match = /\.([^.]+)$/.exec(fileName.trim());
  return match?.[1]?.toLowerCase() || "";
}

export function classifyImportFile(fileName: string): ImportFileKind {
  const extension = getFileExtension(fileName);
  if (markdownExtensions.has(extension)) return "markdown";
  if (textExtensions.has(extension)) return "text";
  if (extension === "json") return "json";
  if (extension === "zip") return "zip";
  if (extension === "pdf") return "pdf";
  return "unknown";
}

export function titleFromFileName(fileName: string): string {
  return fileName.replace(/\.[^.]+$/i, "").trim() || titleFromContent(fileName);
}

export function createTextImportNote(fileName: string, content: string, now = new Date().toISOString()): Note {
  const kind = classifyImportFile(fileName);
  return {
    ...createNoteDraft(content, ["imported"], now),
    title: titleFromFileName(fileName),
    tags: normalizeTags(["imported"]),
    isMarkdown: kind === "markdown",
  };
}

function createResult(fileName: string, notes: Note[], message: string): ImportFileResult {
  return { status: "success", fileName, message, notes };
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Could not import this file.";
}

async function importZip(file: File): Promise<Note[]> {
  const reader = new ZipReader(new BlobReader(file));
  try {
    const entries = await reader.getEntries();
    const jsonEntry = entries.find(entry => classifyImportFile(entry.filename) === "json");
    if (!jsonEntry || !("getData" in jsonEntry) || typeof jsonEntry.getData !== "function") return [];
    return importNotesFromJson(await jsonEntry.getData(new TextWriter()));
  } finally {
    await reader.close();
  }
}

export async function importSingleFile(file: File, worker: ImportWorker): Promise<ImportFileResult> {
  try {
    const kind = classifyImportFile(file.name);
    if (kind === "pdf") {
      const pdfUrl = URL.createObjectURL(file);
      const pdfStatus = await worker.describePdf(file.name, file.size);
      return { status: "success", fileName: file.name, message: "PDF ready for preview.", notes: [], pdfUrl, pdfStatus };
    }

    if (kind === "zip") {
      const notes = await importZip(file);
      return createResult(file.name, notes, notes.length ? `Imported ${notes.length} notes from ZIP.` : "No exported JSON notes found in ZIP.");
    }

    const text = await file.text();
    if (kind === "json") {
      const notes = importNotesFromJson(text);
      return createResult(file.name, notes, notes.length ? `Imported ${notes.length} notes from JSON.` : "No valid notes found in JSON.");
    }

    const note = createTextImportNote(file.name, text);
    const extension = getFileExtension(file.name);
    const fallback = extension && !knownTextExtensions.has(extension) ? " Imported as plain text." : "";
    return createResult(file.name, [note], `${kind === "markdown" ? "Markdown" : "Text"} note imported.${fallback}`);
  } catch (error) {
    return { status: "error", fileName: file.name, message: errorMessage(error) };
  }
}

export async function importFiles(files: File[], worker: ImportWorker): Promise<ImportFileResult[]> {
  const results: ImportFileResult[] = [];
  for (const file of files) results.push(await importSingleFile(file, worker));
  return results;
}
