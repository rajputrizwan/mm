import { ReactNode } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useApp } from "../../contexts/AppContext";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const { user } = useAuth();
  const { sidebarOpen } = useApp();

  if (!user) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300`}
      >
        <Header title={title} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>

        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
              <p>© 2025 Intervau.AI. All rights reserved.</p>
              <div className="flex space-x-6 mt-2 md:mt-0">
                <button className="hover:text-gray-900 transition-colors">
                  Privacy
                </button>
                <button className="hover:text-gray-900 transition-colors">
                  Terms
                </button>
                <button className="hover:text-gray-900 transition-colors">
                  Support
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
