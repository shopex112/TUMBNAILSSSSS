import React, { useState, useEffect, useCallback } from 'react';

interface Icon {
  name: string;
}

interface Props {
  onClose: () => void;
  onIconSelect: (svgString: string) => void;
}

// Debounce hook to delay API calls
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

export const IconLibraryModal: React.FC<Props> = ({ onClose, onIconSelect }) => {
  const [query, setQuery] = useState('arrow');
  const [results, setResults] = useState<Icon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 500);

  const searchIcons = useCallback(async (searchQuery: string) => {
    if (!searchQuery) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.iconify.design/search?query=${searchQuery}&limit=96`);
      const data = await response.json();
      setResults(data.icons || []);
    } catch (error) {
      console.error("Failed to fetch icons:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    searchIcons(debouncedQuery);
  }, [debouncedQuery, searchIcons]);
    
  const handleIconClick = async (iconName: string) => {
      try {
        const response = await fetch(`https://api.iconify.design/${iconName}.svg`);
        const svgString = await response.text();
        onIconSelect(svgString);
      } catch(error) {
        console.error("Failed to fetch SVG data", error);
        alert("לא ניתן היה לטעון את האייקון.");
      }
  };

  return (
    <div className="fixed inset-0 z-[110] glass flex items-center justify-center p-6 backdrop-blur-3xl animate-fade-in">
      <div className="w-full max-w-4xl h-[80vh] bg-slate-950 border border-white/10 rounded-[3rem] p-8 flex flex-col shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors text-2xl">✕</button>
        <div className="space-y-2 text-right mb-6">
          <h2 className="text-3xl font-black text-white">ספריית אייקונים</h2>
          <p className="text-slate-500 text-sm font-bold">חפש מתוך אלפי אייקונים ולחץ כדי להוסיף</p>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חפש אייקון (באנגלית)... לדוגמה: money, fire, smile"
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-right outline-none focus:border-indigo-500 transition-colors mb-6"
        />
        <div className="flex-1 overflow-y-auto custom-scrollbar -mr-4 pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
              {results.map(icon => (
                <button
                  key={icon.name}
                  onClick={() => handleIconClick(icon.name)}
                  className="aspect-square bg-black/30 rounded-xl flex items-center justify-center p-3 hover:bg-indigo-500/20 transition-colors"
                >
                  <img src={`https://api.iconify.design/${icon.name}.svg?color=white`} className="w-full h-full" alt={icon.name} />
                </button>
              ))}
            </div>
          )}
          {!isLoading && results.length === 0 && debouncedQuery && (
              <p className="text-center text-slate-500 mt-8">לא נמצאו תוצאות עבור "{debouncedQuery}"</p>
          )}
        </div>
      </div>
    </div>
  );
};
