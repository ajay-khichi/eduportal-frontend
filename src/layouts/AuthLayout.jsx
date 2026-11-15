import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShieldCheck, QrCode, MapPin, ScanFace } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-500/30">
            EP
          </div>
          <div className="text-left">
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Edu<span className="text-indigo-400">Portal</span>
            </span>
            <p className="text-xs text-indigo-200/70 font-medium">Enterprise Smart Attendance & ERP</p>
          </div>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/20 dark:border-slate-800">
          <Outlet />
        </div>

        {/* Feature pillars */}
        <div className="mt-8 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400">
          <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <QrCode className="w-4 h-4 text-indigo-400" />
            <span>Rolling QR</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>GPS Geofence</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <ScanFace className="w-4 h-4 text-purple-400" />
            <span>Biometrics</span>
          </div>
        </div>
      </div>
    </div>
  );
}
