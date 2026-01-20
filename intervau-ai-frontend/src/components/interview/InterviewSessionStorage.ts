/**
 * InterviewSessionStorage - Manages interview session persistence
 * Saves session state to localStorage to prevent progress loss on page refresh
 */

const STORAGE_KEY = 'intervau_interview_session';
const EXPIRY_HOURS = 2; // Sessions expire after 2 hours

export interface InterviewSessionData {
    sessionId: string;
    candidateName: string;
    candidateEmail: string;
    jobPosition: string;
    shareableLink: string;
    currentQuestionIndex: number;
    totalQuestions: number;
    transcript: Array<{
        speaker: string;
        text: string;
        timestamp: string;
    }>;
    startedAt: string;
    lastUpdated: string;
}

/**
 * Save current session state to localStorage
 */
export function saveSession(data: InterviewSessionData): void {
    try {
        const sessionData = {
            ...data,
            lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    } catch (error) {
        console.error('Failed to save interview session:', error);
    }
}

/**
 * Load session from localStorage
 * Returns null if no session exists or if session has expired
 */
export function loadSession(): InterviewSessionData | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const session = JSON.parse(stored) as InterviewSessionData;

        // Check if session has expired
        const lastUpdated = new Date(session.lastUpdated);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

        if (hoursDiff > EXPIRY_HOURS) {
            clearSession();
            return null;
        }

        return session;
    } catch (error) {
        console.error('Failed to load interview session:', error);
        return null;
    }
}

/**
 * Clear the stored session
 */
export function clearSession(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear interview session:', error);
    }
}

/**
 * Update specific fields in the session
 */
export function updateSession(updates: Partial<InterviewSessionData>): void {
    const current = loadSession();
    if (current) {
        saveSession({ ...current, ...updates });
    }
}

/**
 * Add a transcript entry to the session
 */
export function addTranscriptEntry(
    speaker: string,
    text: string
): void {
    const current = loadSession();
    if (current) {
        saveSession({
            ...current,
            transcript: [
                ...current.transcript,
                {
                    speaker,
                    text,
                    timestamp: new Date().toISOString(),
                },
            ],
        });
    }
}

/**
 * Increment the question index
 */
export function advanceQuestion(): void {
    const current = loadSession();
    if (current && current.currentQuestionIndex < current.totalQuestions - 1) {
        saveSession({
            ...current,
            currentQuestionIndex: current.currentQuestionIndex + 1,
        });
    }
}

/**
 * Check if there's an active session for a specific interview
 */
export function hasActiveSession(shareableLink: string): boolean {
    const session = loadSession();
    return session !== null && session.shareableLink === shareableLink;
}

/**
 * Get session duration in minutes
 */
export function getSessionDuration(): number {
    const session = loadSession();
    if (!session) return 0;

    const started = new Date(session.startedAt);
    const now = new Date();
    return Math.round((now.getTime() - started.getTime()) / (1000 * 60));
}

export default {
    saveSession,
    loadSession,
    clearSession,
    updateSession,
    addTranscriptEntry,
    advanceQuestion,
    hasActiveSession,
    getSessionDuration,
};
