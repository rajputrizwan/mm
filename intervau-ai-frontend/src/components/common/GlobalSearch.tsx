import { useEffect, useRef } from "react";
import {
  Search,
  X,
  Loader2,
  LayoutDashboard,
  FileText,
  History,
  Settings,
  PlayCircle,
  Briefcase,
  Users,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useGlobalSearch } from "../../hooks/useGlobalSearch";
import LogoIcon from "./LogoIcon";

// Icon mapping
const iconMap: Record<string, any> = {
  LayoutDashboard,
  FileText,
  Video: LogoIcon,
  History,
  Settings,
  PlayCircle,
  Briefcase,
  Users,
  Plus,
};

export default function GlobalSearch() {
  const {
    query,
    setQuery,
    results,
    loading,
    isOpen,
    setIsOpen,
    selectedIndex,
    handleKeyDown,
    handleResultClick,
    clearSearch,
  } = useGlobalSearch();

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  // Group results by category
  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = [];
      }
      acc[result.category].push(result);
      return acc;
    },
    {} as Record<string, typeof results>,
  );

  const categories = ["Pages", "Actions", "Recent"];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search... (Ctrl+K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          className="w-64 pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 dark:text-gray-500" />

        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query && (
        <div className="absolute top-full mt-2 w-96 max-w-[calc(100vw-2rem)] right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-lg bg-opacity-95 dark:bg-opacity-95">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                Searching...
              </span>
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center">
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                No results found for "{query}"
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {categories.map((category) => {
                const categoryResults = groupedResults[category];
                if (!categoryResults || categoryResults.length === 0)
                  return null;

                return (
                  <div
                    key={category}
                    className="border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    {/* Category Header */}
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50">
                      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {category}
                      </h3>
                    </div>

                    {/* Category Results */}
                    {categoryResults.map((result) => {
                      const globalIndex = results.indexOf(result);
                      const isSelected = globalIndex === selectedIndex;
                      const IconComponent = iconMap[result.icon] || Search;

                      return (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result.route)}
                          className={`w-full px-4 py-3 flex items-start space-x-3 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors ${
                            isSelected ? "bg-blue-50 dark:bg-gray-700/50" : ""
                          }`}
                        >
                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                              category === "Actions"
                                ? "bg-gradient-to-br from-green-500 to-emerald-500"
                                : "bg-gradient-to-br from-blue-500 to-cyan-500"
                            }`}
                          >
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {result.title}
                            </p>
                            {result.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                {result.description}
                              </p>
                            )}
                          </div>

                          {/* Arrow */}
                          <div className="flex-shrink-0">
                            <ArrowRight
                              className={`w-4 h-4 transition-opacity ${
                                isSelected
                                  ? "text-blue-500 opacity-100"
                                  : "text-gray-400 opacity-0 group-hover:opacity-100"
                              }`}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}

              {/* Keyboard Shortcuts Footer */}
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">
                        ↑↓
                      </kbd>
                      <span>Navigate</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">
                        ↵
                      </kbd>
                      <span>Select</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">
                        Esc
                      </kbd>
                      <span>Close</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
