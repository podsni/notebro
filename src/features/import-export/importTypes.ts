import type { Note } from "@/lib/noteLogic";

export type ImportFileKind = "markdown" | "text" | "json" | "zip" | "pdf" | "unknown";

export type ImportSuccessResult = {
  status: "success";
  fileName: string;
  message: string;
  notes: Note[];
  pdfUrl?: string;
  pdfStatus?: string;
};

export type ImportErrorResult = {
  status: "error";
  fileName: string;
  message: string;
};

export type ImportFileResult = ImportSuccessResult | ImportErrorResult;

export type ImportWorker = {
  describePdf: (name: string, size: number) => string | Promise<string>;
};
