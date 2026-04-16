import { ResumeAnalysisResult } from "../types/resume";

export function normalizeResumeAnalysis(
  data: any,
): ResumeAnalysisResult | null {
  if (!data || typeof data !== "object") return null;

  const extractedSkills = Array.isArray(data.extractedSkills)
    ? data.extractedSkills
        .filter((s: any) => s && typeof s.name === "string")
        .map((s: any) => ({
          name: s.name,
          category: typeof s.category === "string" ? s.category : "General",
          level: typeof s.level === "number" ? s.level : undefined,
        }))
    : [];

  const skillGaps = Array.isArray(data.skillGaps)
    ? data.skillGaps
        .filter((g: any) => g && typeof g.skill === "string")
        .map((g: any) => ({
          skill: g.skill,
          importance:
            typeof g.importance === "string" ? g.importance : "medium",
          recommendation:
            typeof g.recommendation === "string"
              ? g.recommendation
              : "No recommendation available.",
        }))
    : [];

  const suggestedQuestions = Array.isArray(data.suggestedQuestions)
    ? data.suggestedQuestions
        .filter((q: any) => q && typeof q.question === "string")
        .map((q: any) => ({
          question: q.question,
          category: typeof q.category === "string" ? q.category : "general",
          difficulty:
            typeof q.difficulty === "string" ? q.difficulty : "medium",
        }))
    : [];

  return {
    extractedSkills,
    skillGaps,
    suggestedQuestions,
    matchScore:
      typeof data.matchScore === "number"
        ? data.matchScore
        : Number(data.matchScore) || 0,
    analyzedAt:
      typeof data.analyzedAt === "string"
        ? data.analyzedAt
        : new Date().toISOString(),
    fileName:
      typeof data.fileName === "string" && data.fileName.trim().length > 0
        ? data.fileName
        : "Uploaded Resume",
    targetJobPosition:
      typeof data.targetJobPosition === "string"
        ? data.targetJobPosition
        : undefined,
    targetJobDescription:
      typeof data.targetJobDescription === "string"
        ? data.targetJobDescription
        : undefined,
  };
}

export function formatAnalysisDate(value: string | undefined): string {
  if (!value) return "Unknown";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  return parsed.toLocaleString();
}

export function isAnalysisStale(
  analyzedAt: string | undefined,
  staleAfterDays = 30,
): boolean {
  if (!analyzedAt) return false;
  const parsed = new Date(analyzedAt);
  if (Number.isNaN(parsed.getTime())) return false;

  const staleThreshold = Date.now() - staleAfterDays * 24 * 60 * 60 * 1000;
  return parsed.getTime() < staleThreshold;
}
