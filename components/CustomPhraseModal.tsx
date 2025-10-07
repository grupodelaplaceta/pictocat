import React, { useState, useEffect } from 'react';
import { CatImage, Phrase } from '../types';
import { CloseIcon, TrashIcon } from './Icons';

interface CustomPhraseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { text: string; selectedImageId: number | null }) => void;
    onDelete: (phraseId: string) => void;
    phraseToEdit: Phrase | null;
    unlockedImages: CatImage[];
}

const CustomPhraseModal: React.FC<CustomPhraseModalProps> = ({
    isOpen,
    onClose,
    onSave,
    onDelete,
    phraseToEdit,
    unlockedImages
}) => {
    const [text, setText] = useState('');
    const [selectedImageId, setSelectedImageId] = useState<number | null>(null);

    useEffect(() => {
        if (phraseToEdit) {
            setText(phraseToEdit.text);
            setSelectedImageId(phraseToEdit.selectedImageId);
        } else {
            // Reset for new phrase
            setText('');
            setSelectedImageId(null);
        }
    }, [phraseToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({ text, selectedImageId });
    };

    const handleDelete = () => {
        if (phraseToEdit) {
            onDelete(phraseToEdit.id);
        }
    };
    
    const canSave = text.trim().length > 0 && selectedImageId !== null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-center mb-4 pb-4 border-b">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                        {phraseToEdit ? 'Editar Frase' : 'Crear Nueva Frase'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <CloseIcon className="w-7 h-7" />
                    </button>
                </header>

                <div className="mb-4">
                    <label htmlFor="phrase-text" className="block text-sm font-medium text-gray-700 mb-1">Texto de la Frase</label>
                    <input
                        id="phrase-text"
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Escribe algo..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Elige una imagen</label>
                <main className="flex-grow overflow-y-auto pr-2 border rounded-lg p-2 bg-gray-50 min-h-[200px]">
                    {unlockedImages.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {unlockedImages.map(image => (
                                <button
                                    key={image.id}
                                    onClick={() => setSelectedImageId(image.id)}
                                    className={`aspect-square rounded-lg overflow-hidden border-4 transition-all duration-200 ${selectedImageId === image.id ? 'border-blue-500 ring-2 ring-blue-500 scale-105' : 'border-transparent hover:border-orange-400'}`}
                                >
                                    <img src={image.url} alt={image.theme} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center text-gray-600 py-10">
                            <p>No tienes imágenes desbloqueadas.</p>
                         </div>
                    )}
                </main>

                <footer className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:items-center">
                    <div>
                        {phraseToEdit && (
                            <button
                                onClick={handleDelete}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-colors"
                            >
                                <TrashIcon className="w-5 h-5" />
                                <span>Eliminar</span>
                            </button>
                        )}
                    </div>
                    <div className="flex flex-col w-full sm:w-auto sm:flex-row gap-3">
                        <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-full transition-colors">
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!canSave}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Guardar
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default CustomPhraseModal;