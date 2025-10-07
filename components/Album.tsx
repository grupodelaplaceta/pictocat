import React, { useState, useMemo } from 'react';
import { CatImage } from '../types';
import { CloseIcon, SearchIcon } from './Icons';

interface AlbumProps {
  unlockedImages: CatImage[];
  onClose: () => void;
}

const Album: React.FC<AlbumProps> = ({ unlockedImages, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const themes = useMemo(() => {
    const themeSet = new Set(unlockedImages.map(img => img.theme));
    return ['Todos', ...Array.from(themeSet).sort()];
  }, [unlockedImages]);
  
  const [selectedTheme, setSelectedTheme] = useState('Todos');

  const filteredImages = useMemo(() => {
    return unlockedImages.filter(image => {
      const matchesTheme = selectedTheme === 'Todos' || image.theme === selectedTheme;
      const matchesSearch = image.theme.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTheme && matchesSearch;
    });
  }, [unlockedImages, selectedTheme, searchTerm]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-slate-100 rounded-lg shadow-2xl p-4 w-full h-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center mb-4 pb-2 border-b">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Álbum de Gatos</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <CloseIcon className="w-7 h-7" />
          </button>
        </header>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
                 <input
                    type="text"
                    placeholder="Buscar por tema..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-full"
                 />
                 <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="px-4 py-2 border rounded-full bg-white"
            >
                {themes.map(theme => (
                    <option key={theme} value={theme}>{theme}</option>
                ))}
            </select>
        </div>

        <main className="flex-grow overflow-y-auto pr-2">
            {filteredImages.length > 0 ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredImages.map(image => (
                        <div key={image.id} className="aspect-square rounded-lg overflow-hidden shadow-md group">
                            <img src={image.url} alt={image.theme} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <p className="text-lg">No se encontraron gatos.</p>
                    <p className="text-sm">Sigue jugando para desbloquear más.</p>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default Album;