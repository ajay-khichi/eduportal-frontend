import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

import toast from 'react-hot-toast';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);



  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {

    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      // toast shown in login()
    } finally {
      setLoading(false);
    }
  };




      localStorage.removeItem('eduportal_api_url');
      toast.success('Reset to default API URL');
    } else {
      localStorage.setItem('eduportal_api_url', apiUrl.trim());
      toast.success('Backend API URL saved! Re-attempting connection.');
    }
    setShowConfig(false);
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Sign In to EduPortal</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Enter your institutional credentials to access your portal
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@eduportal.edu"
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs tracking-wide shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            'Verifying...'
          ) : (
            <>
              Sign In to Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
          Register Student Account
        </Link>
      </div>


      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setShowConfig((prev) => !prev)}
          className="w-full text-center text-[11px] font-semibold text-slate-400 hover:text-indigo-500 transition flex items-center justify-center gap-1.5"
        >
          <Server className="w-3.5 h-3.5" />
          API Server: <span className="font-mono text-slate-500 truncate max-w-[200px]">{getBaseURL()}</span>
          <Settings2 className="w-3.5 h-3.5 ml-1" />
        </button>

        {showConfig && (
          <form onSubmit={handleSaveApiUrl} className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-left">
            <label className="block text-[10px] font-bold uppercase text-slate-500">
              Backend API Base URL (e.g. https://api.yourdomain.com/api)
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:8080/api or https://api.example.com/api"
              className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setApiUrl('http://localhost:8080/api');
                  localStorage.removeItem('eduportal_api_url');
                  setShowConfig(false);
                }}
                className="px-2.5 py-1 text-[11px] text-slate-500 hover:text-slate-700"
              >
                Reset Default
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold"
              >
                Save URL
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
