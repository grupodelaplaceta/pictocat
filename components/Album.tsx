import React, { useState, useMemo } from 'react';
import { CatImage } from '../types';
import { CloseIcon, SearchIcon } from '../hooks/Icons';

interface AlbumProps {
  isOpen: boolean;
  unlockedImages: CatImage[];
  onClose: () => void;
}

const Album: React.FC<AlbumProps> = ({ isOpen, unlockedImages, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // FIX: Conditionally render the component based on the isOpen prop.
  if (!isOpen) return null;

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
    <div className="modal-cartoon-overlay">
      <div className="modal-cartoon-content p-4 sm:p-6 w-full max-w-4xl">
        <header className="flex justify-between items-center mb-4 pb-4 border-b-2 border-liver/20">
          <h2 className="text-xl sm:text-2xl font-black text-liver">Álbum de Gatos</h2>
          <button onClick={onClose} className="text-liver/70 hover:text-liver">
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
                    className="input-cartoon pl-10"
                 />
                 <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-liver/40" />
            </div>
            <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="input-cartoon"
            >
                {themes.map(theme => (
                    <option key={theme} value={theme}>{theme}</option>
                ))}
            </select>
        </div>

        <main className="flex-grow overflow-y-auto bg-wheat p-2 rounded-lg border-2 border-liver/20">
            {filteredImages.length > 0 ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-2">
                    {filteredImages.map(image => (
                        <div key={image.id} className="aspect-square rounded-lg overflow-hidden border-2 border-liver/30 shadow-md group">
                            <img src={image.url} alt={image.theme} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-liver/70">
                    <p className="text-lg font-bold">No se encontraron gatos.</p>
                    <p className="text-sm">Sigue jugando para desbloquear más.</p>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default Album;