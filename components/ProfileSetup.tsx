import React, { useState } from 'react';
import { CatSilhouetteIcon, SpinnerIcon } from './Icons';
import * as apiService from '../services/apiService';
import { UserProfile } from '../types';

interface ProfileSetupProps {
  onProfileCreated: (profile: UserProfile) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onProfileCreated }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.startsWith('@') || username.length < 4 || !/^[a-zA-Z0-9_]+$/.test(username.substring(1))) {
      setError('El usuario debe empezar con @, tener al menos 3 caracteres y solo usar letras, números y guiones bajos.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await apiService.createProfile(username);
      if (result.success && result.profile) {
        onProfileCreated(result.profile);
      } else {
        setError(result.message || 'No se pudo crear el perfil.');
      }
    } catch (e) {
        setError('Ocurrió un error de red. Inténtalo de nuevo.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <CatSilhouetteIcon className="w-20 h-20 text-indigo-600 mb-2" />
          <h1 className="text-3xl font-black text-gray-800">¡Casi listo!</h1>
        </div>

        <h2 className="text-xl font-bold text-center text-gray-700 mb-2">Crea tu perfil</h2>
        <p className="text-sm text-center text-gray-500 mb-6">Elige un nombre de usuario único para identificarte en PictoCat.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="text-sm font-bold text-gray-600">
              Nombre de Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@tu_usuario"
              required
              disabled={isLoading}
              className="w-full px-4 py-2 mt-2 border-2 border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-slate-100"
            />
          </div>

          {error && <p className="text-sm text-red-500 text-center font-semibold">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105 flex justify-center items-center disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <SpinnerIcon className="w-6 h-6 animate-spin" />
              ) : (
                'Guardar y Jugar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
