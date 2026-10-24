import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LayoutDashboard, ShieldCheck, LogOut, CircleUserRound } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { username, role, logout } = useAuth();
  const navigate = useNavigate(); const location = useLocation();
  const linkClass = (path: string) => `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${location.pathname===path?'bg-blue-50 text-blue-800':'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`;
  return <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
    <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-8"><Link to="/dashboard" className="flex items-center gap-2.5 text-[#172d4f]"><span className="rounded-xl bg-blue-50 p-2 text-blue-800"><GraduationCap size={21}/></span><span className="text-lg font-bold tracking-tight">Campus<span className="text-blue-700">Hub</span></span></Link>
        <div className="hidden items-center gap-1 sm:flex"><Link className={linkClass('/dashboard')} to="/dashboard"><LayoutDashboard size={16}/>Overview</Link>{role==='ADMIN'&&<Link className={linkClass('/admin')} to="/admin"><ShieldCheck size={16}/>Directory</Link>}</div>
      </div>
      <div className="flex items-center gap-3"><div className="hidden items-center gap-2 sm:flex"><CircleUserRound size={18} className="text-slate-400"/><span className="text-sm font-medium text-slate-700">{username}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">{role==='USER'?'STUDENT':role}</span></div><button onClick={()=>{logout();navigate('/login');}} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"><LogOut size={16}/><span className="hidden sm:inline">Sign out</span></button></div>
    </div>
  </nav>;
};
