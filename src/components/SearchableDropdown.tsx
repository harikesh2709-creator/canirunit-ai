'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, X } from 'lucide-react';

// ============================================================================
// Searchable Dropdown — Shared Combobox Component
// ============================================================================

export interface DropdownGroup<T> {
  label: string;
  items: T[];
}

interface SearchableDropdownProps<T> {
  /** Groups of items to display */
  groups: DropdownGroup<T>[];
  /** Currently selected item ID */
  selectedId: string;
  /** Callback when user selects an item */
  onSelect: (id: string) => void;
  /** Placeholder text when nothing is selected */
  placeholder: string;
  /** Function to extract the unique ID from an item */
  getId: (item: T) => string;
  /** Function to render the item in the dropdown list */
  renderItem: (item: T, isSelected: boolean) => React.ReactNode;
  /** Function to render the selected item in the trigger button */
  renderSelected: (item: T) => React.ReactNode;
  /** Function to extract searchable text from an item */
  getSearchText: (item: T) => string;
  /** Optional: function to get a color for the group label */
  getGroupColor?: (label: string) => string;
  /** Label above the dropdown */
  label: string;
  /** Max height of dropdown panel */
  maxHeight?: string;
}

export default function SearchableDropdown<T>({
  groups,
  selectedId,
  onSelect,
  placeholder,
  getId,
  renderItem,
  renderSelected,
  getSearchText,
  getGroupColor,
  label,
  maxHeight = '20rem',
}: SearchableDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find selected item across all groups
  const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const selected = allItems.find((item) => getId(item) === selectedId);

  // Filter groups based on search query
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          getSearchText(item).toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, search, getSearchText]);

  // Total filtered count
  const filteredCount = filteredGroups.reduce((sum, g) => sum + g.items.length, 0);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard handling
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearch('');
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </label>

      <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-4 py-3 flex items-center justify-between gap-3
            bg-white/5 border border-white/10 rounded-xl
            text-left transition-all duration-200 cursor-pointer hover:bg-white/10
            ${isOpen ? 'ring-1 ring-teal-500/50 border-teal-500/30 bg-teal-500/5' : ''}
          `}
        >
          <div className="flex-1 min-w-0">
            {selected ? (
              renderSelected(selected)
            ) : (
              <span className="text-sm text-slate-500">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform duration-200 flex-shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute z-50 mt-2 w-full glass-card-elevated overflow-hidden"
            >
              {/* Search Input */}
              <div className="p-2 border-b border-white/5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Type to search..."
                    className="w-full pl-9 pr-8 py-2 bg-white/5 border border-white/5 rounded-lg
                               text-sm text-white placeholder-slate-600 outline-none
                               focus:border-teal-500/30 focus:bg-white/8 transition-colors"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md
                                 text-slate-500 hover:text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {search && (
                  <p className="text-[10px] text-slate-600 mt-1 px-1">
                    {filteredCount} result{filteredCount !== 1 ? 's' : ''} found
                  </p>
                )}
              </div>

              {/* Items List */}
              <div
                className="overflow-y-auto custom-scrollbar"
                style={{ maxHeight }}
              >
                {filteredGroups.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-slate-500">No matches found</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Try a different search term
                    </p>
                  </div>
                ) : (
                  filteredGroups.map((group) => (
                    <div key={group.label}>
                      <div
                        className={`sticky top-0 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest
                                    bg-[#12121f]/95 backdrop-blur-sm border-b border-white/3
                                    ${getGroupColor?.(group.label) ?? 'text-slate-500'}`}
                      >
                        {group.label}
                        <span className="ml-1.5 text-slate-600 font-normal">
                          ({group.items.length})
                        </span>
                      </div>
                      {group.items.map((item) => {
                        const id = getId(item);
                        const isSelected = id === selectedId;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              onSelect(id);
                              setIsOpen(false);
                              setSearch('');
                            }}
                            className={`
                              w-full px-3 py-2 text-left text-sm transition-all duration-100 cursor-pointer
                              ${
                                isSelected
                                  ? 'bg-teal-600/15 text-white border-l-2 border-teal-500'
                                  : 'text-slate-300 hover:bg-white/5 border-l-2 border-transparent'
                              }
                            `}
                          >
                            {renderItem(item, isSelected)}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
