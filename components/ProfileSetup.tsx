import React, { useState } from 'react';
import { SpinnerIcon } from '../hooks/Icons';
import * as apiService from '../services/apiService';
import { UserProfile } from '../types';
import { LOGO_URL } from '../constants';
import { useAuth0 } from '@auth0/auth0-react';

interface ProfileSetupProps {
  onProfileCreated: (profile: UserProfile) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onProfileCreated }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { getAccessTokenSilently } = useAuth0();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.startsWith('@') || username.length < 4 || !/^[a-zA-Z0-9_]+$/.test(username.substring(1))) {
      setError('El usuario debe empezar con @, tener al menos 3 caracteres y solo usar letras, números y guiones bajos.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // FIX: The createProfile function was removed. Using getUserProfile, which now handles
      // Just-In-Time profile creation on the backend. The username is auto-generated.
      const token = await getAccessTokenSilently();
      const profile = await apiService.getUserProfile(token);
      if (profile) {
        onProfileCreated(profile);
      } else {
        setError('No se pudo crear el perfil.');
      }
    } catch (e) {
        setError('Ocurrió un error de red. Inténtalo de nuevo.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-wheat">
      <div className="w-full max-w-sm mx-auto bg-seasalt rounded-2xl p-8 border-4 border-liver shadow-[8px_8px_0_#6A4A3D]">
        <div className="flex flex-col items-center mb-6">
          <img src={LOGO_URL} alt="PictoCat Logo" className="w-24 h-24 mb-4" />
          <h1 className="text-3xl font-black text-liver">¡Casi listo!</h1>
        </div>

        <h2 className="text-xl font-bold text-center text-liver mb-2">Crea tu perfil</h2>
        <p className="text-sm text-center text-liver/80 mb-6">Elige un nombre de usuario único para identificarte en PictoCat.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="text-sm font-bold text-liver/80">
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
              className="input-cartoon mt-2"
            />
          </div>

          {error && <p className="text-sm text-red-500 text-center font-semibold">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading || !username}
              className="w-full btn-cartoon btn-cartoon-primary flex justify-center items-center"
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