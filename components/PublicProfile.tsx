import React from 'react';
import { PublicProfileData } from '../types';
import { ArrowLeftIcon, CatSilhouetteIcon, SpinnerIcon, VerifiedIcon } from '../hooks/Icons';

interface PublicProfileProps {
    profileData: PublicProfileData | null;
    error: string;
    onBack: () => void;
}

const PublicProfile: React.FC<PublicProfileProps> = ({ profileData, error, onBack }) => {
    
    const renderContent = () => {
        if (error) {
            return <p className="text-center text-red-500 font-bold p-10">{error}</p>;
        }

        if (!profileData) {
            return (
                 <div className="flex justify-center items-center p-10">
                    <SpinnerIcon className="w-10 h-10 animate-spin text-liver" />
                </div>
            );
        }

        return (
            <div>
                <div className="flex items-center gap-2 mb-6">
                    <h1 className="text-3xl font-black text-liver">{profileData.username}</h1>
                    {profileData.isVerified && <VerifiedIcon className="w-7 h-7 text-blue-500" />}
                </div>

                {profileData.phrases.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {profileData.phrases.map(phrase => (
                            <div key={phrase.publicPhraseId} className="card-cartoon group relative aspect-square flex flex-col justify-between overflow-hidden">
                                <img src={phrase.imageUrl} alt={phrase.text} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-center">
                                    <p className="font-bold text-lg drop-shadow-md">{phrase.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-liver/70 bg-wheat rounded-lg border-2 border-liver/20">
                         <CatSilhouetteIcon className="w-16 h-16 mx-auto mb-4" />
                         <p className="font-bold">{profileData.username} no ha publicado ninguna frase todavía.</p>
                    </div>
                )}
            </div>
        );
    }


    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6">
             <button onClick={onBack} className="flex items-center gap-2 text-liver/80 hover:text-liver mb-4 font-bold">
                <ArrowLeftIcon className="w-5 h-5"/>
                Volver a la búsqueda
            </button>
            {renderContent()}
        </div>
    );
};

export default PublicProfile;