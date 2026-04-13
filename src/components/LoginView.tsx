import React, { useState } from 'react';
import { Building2, Code2, ArrowRight, Lock, Mail } from 'lucide-react';
import { logoBase64 } from '../utils/logoBase64';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export type Role = 'operasional' | 'mitra';

interface LoginViewProps {
  onLogin: (role: Role) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<Role>('operasional');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onLogin(selectedRole);
    } catch (err: any) {
      console.error(err);
      setError('Gagal login dengan Google: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-[url('https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <img src={logoBase64} alt="Umaroh Logo" className="h-16" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Login ke Sistem
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Silakan pilih peran dan masukkan kredensial Anda
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('operasional');
                setError('');
              }}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                selectedRole === 'operasional' 
                  ? 'border-amber-500 bg-amber-50 text-amber-700' 
                  : 'border-gray-200 hover:border-amber-200 hover:bg-gray-50 text-gray-500'
              }`}
            >
              <Building2 className={`w-6 h-6 mb-2 ${selectedRole === 'operasional' ? 'text-amber-600' : 'text-gray-400'}`} />
              <span className="text-xs font-bold uppercase tracking-wider">Operasional</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('mitra');
                setError('');
              }}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                selectedRole === 'mitra' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50 text-gray-500'
              }`}
            >
              <Code2 className={`w-6 h-6 mb-2 ${selectedRole === 'mitra' ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-center">Mitra Dev</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                  selectedRole === 'operasional' 
                    ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Memproses...' : `Login dengan Google sebagai ${selectedRole === 'operasional' ? 'Operasional' : 'Mitra Dev'}`}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
