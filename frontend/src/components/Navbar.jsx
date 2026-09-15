import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, FileText, Briefcase, LayoutDashboard, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              AI <span className="text-blue-500">CareerFit</span>
            </span>
          </Link>

          {/* Nav Items */}
          {user ? (
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard') ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              
              <Link
                to="/resume"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/resume') ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-4 h-4" />
                Master Resume
              </Link>

              <Link
                to="/jobs"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/jobs') ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Job Analyses
              </Link>
            </div>
          ) : null}

          {/* Right Action */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-slate-200">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg shadow-blue-600/25 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
