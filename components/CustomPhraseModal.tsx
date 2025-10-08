import React, { useState, useEffect } from 'react';
import { CatImage, Phrase } from '../types';
import { CloseIcon, TrashIcon, GlobeIcon } from '../hooks/Icons';

interface CustomPhraseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { text: string; selectedImageId: number | null; isPublic: boolean }) => void;
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
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        if (phraseToEdit) {
            setText(phraseToEdit.text);
            setSelectedImageId(phraseToEdit.selectedImageId);
            setIsPublic(phraseToEdit.isPublic || false);
        } else {
            // Reset for new phrase
            setText('');
            setSelectedImageId(null);
            setIsPublic(false);
        }
    }, [phraseToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({ text, selectedImageId, isPublic });
    };

    const handleDelete = () => {
        if (phraseToEdit) {
            onDelete(phraseToEdit.id);
        }
    };
    
    const canSave = text.trim().length > 0 && selectedImageId !== null;

    return (
        <div className="modal-cartoon-overlay">
            <div className="modal-cartoon-content p-4 sm:p-6 w-full max-w-2xl">
                <header className="flex justify-between items-center mb-4 pb-4 border-b-2 border-liver/20">
                    <h2 className="text-xl sm:text-2xl font-black text-liver">
                        {phraseToEdit ? 'Editar Frase' : 'Crear Nueva Frase'}
                    </h2>
                    <button onClick={onClose} className="text-liver/70 hover:text-liver">
                        <CloseIcon className="w-7 h-7" />
                    </button>
                </header>

                <div className="mb-4">
                    <label htmlFor="phrase-text" className="block text-sm font-bold text-liver/80 mb-1">Texto de la Frase</label>
                    <input
                        id="phrase-text"
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Escribe algo..."
                        className="input-cartoon"
                    />
                </div>

                <label className="block text-sm font-bold text-liver/80 mb-2">Elige una imagen</label>
                <main className="flex-grow overflow-y-auto pr-2 border-2 border-liver/20 rounded-lg p-2 bg-wheat min-h-[200px]">
                    {unlockedImages.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {unlockedImages.map(image => (
                                <button
                                    key={image.id}
                                    onClick={() => setSelectedImageId(image.id)}
                                    className={`aspect-square rounded-lg overflow-hidden border-4 transition-all duration-200 ${selectedImageId === image.id ? 'border-buff ring-4 ring-buff/50 scale-105' : 'border-transparent hover:border-buff'}`}
                                >
                                    <img src={image.url} alt={image.theme} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center text-liver/80 py-10">
                            <p>No tienes imágenes desbloqueadas.</p>
                         </div>
                    )}
                </main>
                
                 <div className="mt-4">
                    <label htmlFor="is-public-checkbox" className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-wheat transition-colors">
                        <input
                            id="is-public-checkbox"
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="h-5 w-5 rounded border-gray-300 text-buff focus:ring-buff"
                        />
                        <div className="flex items-center gap-2 text-liver">
                            <GlobeIcon className="w-5 h-5" />
                            <span className="font-medium">Publicar en mi perfil</span>
                        </div>
                    </label>
                </div>


                <footer className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:items-center">
                    <div>
                        {phraseToEdit && (
                            <button
                                onClick={handleDelete}
                                className="w-full sm:w-auto btn-cartoon btn-cartoon-danger"
                            >
                                <TrashIcon className="w-5 h-5 inline-block -mt-1 mr-1" />
                                <span>Eliminar</span>
                            </button>
                        )}
                    </div>
                    <div className="flex flex-col w-full sm:w-auto sm:flex-row gap-3">
                        <button onClick={onClose} className="btn-cartoon bg-wheat">
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!canSave}
                            className="btn-cartoon btn-cartoon-primary"
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