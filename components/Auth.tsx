import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { LOGO_URL } from '../constants';

const Auth: React.FC = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-wheat">
      <div className="w-full max-w-sm mx-auto bg-seasalt rounded-2xl p-8 border-4 border-liver shadow-[8px_8px_0_#6A4A3D]">
        <div className="flex flex-col items-center mb-6">
          <img src={LOGO_URL} alt="PictoCat Logo" className="w-24 h-24 mb-4" />
          <h1 className="text-3xl font-black text-liver">Bienvenido a PictoCat</h1>
        </div>
        
        <p className="text-center text-liver/80 mb-8">
          Un comunicador visual divertido donde coleccionas gatos y juegas para desbloquear más.
        </p>

        <button
          onClick={() => loginWithRedirect()}
          className="w-full btn-cartoon btn-cartoon-primary"
        >
          Iniciar Sesión / Registrarse
        </button>

        <p className="text-xs text-center text-liver/50 mt-6">
          Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad.
        </p>
      </div>
    </div>
  );
};

export default Auth;