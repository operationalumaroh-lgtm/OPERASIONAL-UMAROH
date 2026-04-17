import React, { useState } from 'react';
import { Building2, Code2, ArrowRight, User as UserIcon } from 'lucide-react';
import { logoBase64 } from '../utils/logoBase64';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type Role = 'operasional' | 'mitra' | 'jamaah' | 'admin';

interface LoginViewProps {
  onLogin: (role: Role, subRole?: string) => void;
  onGoToRegister?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onGoToRegister }) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<'mitra' | 'jamaah'>('jamaah');

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        onLogin(userData.role as Role, userData.subRole);
      } else {
        // User doesn't exist, needs to register
        setTempUser(user);
        setNeedsRegistration(true);
      }
    } catch (err: any) {
      console.error(err);
      setError('Gagal login dengan Google: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async () => {
    if (!tempUser) return;
    setError('');
    setIsLoading(true);
    try {
      const userDocRef = doc(db, 'users', tempUser.uid);
      const newUserData = {
        uid: tempUser.uid,
        name: tempUser.displayName || 'User',
        email: tempUser.email || '',
        role: selectedRole,
        subRole: '',
        createdAt: new Date().toISOString()
      };
      
      await setDoc(userDocRef, newUserData);
      
      // If Mitra, create a wallet for them
      if (selectedRole === 'mitra') {
        const walletRef = doc(db, 'wallets', tempUser.uid);
        await setDoc(walletRef, {
          userId: tempUser.uid,
          balance: 0,
          updatedAt: new Date().toISOString()
        });
      }

      onLogin(selectedRole);
    } catch (err: any) {
      console.error(err);
      setError('Gagal mendaftar: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (needsRegistration) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center" />
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="flex justify-center">
            <img src={logoBase64} alt="Umaroh Logo" className="h-16" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Selesaikan Pendaftaran
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Pilih jenis akun Anda untuk melanjutkan
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => setSelectedRole('jamaah')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  selectedRole === 'jamaah' 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                    : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50 text-gray-500'
                }`}
              >
                <UserIcon className={`w-6 h-6 mb-2 ${selectedRole === 'jamaah' ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className="text-xs font-bold uppercase tracking-wider">Jamaah</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('mitra')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  selectedRole === 'mitra' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50 text-gray-500'
                }`}
              >
                <Code2 className={`w-6 h-6 mb-2 ${selectedRole === 'mitra' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-center">Mitra</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <button
              onClick={handleCompleteRegistration}
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                selectedRole === 'jamaah' 
                  ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Memproses...' : 'Selesaikan Pendaftaran'}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          Gunakan akun Google Anda untuk masuk
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Memproses...' : 'Login dengan Google'}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </button>
            
            {onGoToRegister && (
              <div className="mt-6 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Atau</span>
                  </div>
                </div>
                <button
                  onClick={onGoToRegister}
                  className="mt-6 w-full flex justify-center items-center py-3 px-4 border border-amber-600 rounded-lg shadow-sm text-sm font-bold text-amber-600 bg-white hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                >
                  Daftar sebagai Mitra
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
