import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

export type Theme = "light" | "dark";
export type Language = "en" | "es" | "fr" | "de" | "pt";

export interface Notification {
  id: string;
  title?: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
  dismissed: boolean;
  /** true → stored in bell-panel history; false → ephemeral toast only */
  persistent: boolean;
}

interface AppState {
  theme: Theme;
  language: Language;
  sidebarOpen: boolean;
  notifications: Notification[];
}

interface AppContextType extends AppState {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLanguage: (language: Language) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  /** Add a PERSISTENT notification — stored in the bell-panel history */
  addNotification: (
    message: string,
    type: Notification["type"],
    title?: string,
  ) => void;
  /** Add a TOAST-ONLY notification — shown in overlay for 3 s, never in bell panel */
  addToast: (message: string, type: Notification["type"]) => void;
  removeNotification: (id: string) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  /** Count of unread PERSISTENT notifications (used for bell badge) */
  unreadCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");
    return (saved as Theme) || "light";
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "en";
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  // Clear all notifications when the user logs out
  useEffect(() => {
    const handleUserLogout = () => setNotifications([]);
    window.addEventListener("userLogout", handleUserLogout);
    return () => window.removeEventListener("userLogout", handleUserLogout);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  /** Persistent notification → added to bell-panel history */
  const addNotification = (
    message: string,
    type: Notification["type"],
    title?: string,
  ) => {
    const notification: Notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date(),
      read: false,
      dismissed: false,
      persistent: true,
    };
    setNotifications((prev) => [notification, ...prev]);
  };

  /** Toast-only notification → shows in overlay, never in bell panel */
  const addToast = (message: string, type: Notification["type"]) => {
    const notification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
      read: true,
      dismissed: false,
      persistent: false,
    };
    setNotifications((prev) => [notification, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, dismissed: true } : n)),
    );
  };

  const clearNotifications = () => {
    // Only clear persistent ones; let transient toasts self-dismiss
    setNotifications((prev) => prev.filter((n) => !n.persistent));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  /** Badge count: only unread persistent notifications */
  const unreadCount = notifications.filter(
    (n) => n.persistent && !n.read,
  ).length;

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        language,
        setLanguage,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        notifications,
        addNotification,
        addToast,
        removeNotification,
        dismissNotification,
        clearNotifications,
        markAsRead,
        markAllAsRead,
        unreadCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
