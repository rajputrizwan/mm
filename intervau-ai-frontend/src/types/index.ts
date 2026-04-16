// Re-export all types from models.ts
export * from "./models";

// Legacy type definitions (kept for backward compatibility)
export type UserRole = "candidate" | "hr";

export interface Interview {
  id: string;
  candidateId: string;
  type: "mock" | "live";
  position: string;
  date: string;
  status: "completed" | "in-progress" | "scheduled";
  score?: number;
}

export interface Resume {
  id: string;
  candidateId: string;
  fileName: string;
  uploadDate: string;
  skills: string[];
  summary: string;
  experience: string[];
}
