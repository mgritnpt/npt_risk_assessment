import React from 'react';
import { ShieldAlert, LayoutDashboard, FileSpreadsheet, Database, CheckCircle2 } from 'lucide-react';

export default function Navbar({ currentTab, setCurrentTab, onOpenCreateModal }) {
  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-sm">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">IT Risk Management System</h1>
              <p className="text-xs text-slate-400">IATF 16949 • ISO 9001 • JAMA/JAPIA • ISO/IEC 27001</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentTab('register')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab === 'register'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Risk Register</span>
            </button>

            <button
              onClick={() => setCurrentTab('master')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab === 'master'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Master Data</span>
            </button>
          </nav>

          {/* Action Button */}
          <div>
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              + Create IT Risk
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
