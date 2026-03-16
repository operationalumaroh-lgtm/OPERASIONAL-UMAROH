import React, { useState } from 'react';
import { Building2, Code2, ArrowRight, Lock, Mail } from 'lucide-react';
import { logoBase64 } from '../utils/logoBase64';

export type Role = 'operasional' | 'mitra';

interface LoginViewProps {
  onLogin: (role: Role) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<Role>('operasional');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedRole === 'operasional') {
      if (email === 'operasional@umaroh.com' && password === 'Ops12345') {
        onLogin(selectedRole);
      } else {
        setError('Email atau password operasional salah.');
      }
    } else if (selectedRole === 'mitra') {
      if ((email === 'md@umaroh.com' || email === 'md@umaorh.com') && password === 'Md123456') {
        onLogin(selectedRole);
      } else {
        setError('Email atau password mitra dev salah.');
      }
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

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 sm:text-sm outline-none"
                  placeholder={selectedRole === 'operasional' ? 'operasional@umaroh.com' : 'md@umaroh.com'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 sm:text-sm outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Ingat saya
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-amber-600 hover:text-amber-500">
                  Lupa password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                  selectedRole === 'operasional' 
                    ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                Masuk sebagai {selectedRole === 'operasional' ? 'Operasional' : 'Mitra Dev'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
