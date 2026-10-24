import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginApi, registerApi } from '../services/api';
import { GraduationCap, Eye, EyeOff, Loader2, AlertCircle, BookOpen, ShieldCheck } from 'lucide-react';
import { AxiosError } from 'axios';

export const Login: React.FC = () => {
  const [register, setRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(null); setSuccess(null); setLoading(true);
    try {
      if (register) {
        await registerApi({ username, email, password, role });
        setSuccess('Account created. You can now sign in.'); setRegister(false); setPassword('');
      } else {
        login(await loginApi({ username, password })); navigate('/dashboard');
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.data?.message) setError(err.response.data.message);
      else if (err instanceof AxiosError) setError(err.message === 'Network Error' ? 'Server se connection nahi ho raha. Backend check karein.' : err.message);
      else setError('Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return <main className="min-h-screen bg-[#f5f7fb] grid lg:grid-cols-[1.05fr_.95fr]">
    <section className="hidden lg:flex flex-col justify-between bg-[#172d4f] p-14 text-white relative overflow-hidden">
      <div className="absolute -right-32 -bottom-32 w-[520px] h-[520px] rounded-full border border-white/10" />
      <div className="absolute -right-10 -bottom-10 w-[280px] h-[280px] rounded-full border border-white/10" />
      <div className="flex items-center gap-3 relative"><div className="bg-white/10 p-2.5 rounded-xl"><GraduationCap size={25}/></div><span className="font-bold text-lg">Campus<span className="text-sky-300">Hub</span></span></div>
      <div className="max-w-lg relative"><span className="uppercase tracking-[.22em] text-sky-300 text-xs font-bold">Your campus, connected</span><h1 className="mt-5 text-5xl leading-tight font-semibold">A smarter way to stay on top of college.</h1><p className="mt-5 text-blue-100/75 leading-7">One place for students, teachers and administrators to keep learning moving forward.</p><div className="mt-9 flex gap-7 text-sm text-blue-100/80"><span className="flex gap-2 items-center"><BookOpen size={16}/> Academic records</span><span className="flex gap-2 items-center"><ShieldCheck size={16}/> Secure access</span></div></div>
      <p className="text-xs text-blue-100/50 relative">CampusHub · College management portal</p>
    </section>
    <section className="flex items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-md">
        <div className="lg:hidden flex justify-center mb-9"><div className="flex items-center gap-2 font-bold text-xl text-[#172d4f]"><GraduationCap/> CampusHub</div></div>
        <p className="text-sm font-semibold text-blue-700">COLLEGE PORTAL</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{register ? 'Create your account' : 'Welcome back'}</h2>
        <p className="mt-2 text-sm text-slate-500">{register ? 'Join your campus community in a few steps.' : 'Sign in to continue to your campus dashboard.'}</p>
        <div className="mt-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-7">
          {error && <div className="mb-5 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700 flex gap-2"><AlertCircle size={18}/>{error}</div>}
          {success && <div className="mb-5 rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-sm text-emerald-700">{success}</div>}
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Username<input required minLength={3} value={username} onChange={e=>setUsername(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Your username" /></label>
            {register && <>
              <label className="block text-sm font-medium text-slate-700">Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="you@college.edu" /></label>
              <label className="block text-sm font-medium text-slate-700">I am a<select value={role} onChange={e=>setRole(e.target.value as 'STUDENT'|'TEACHER')} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-3 bg-white"><option value="STUDENT">Student</option><option value="TEACHER">Teacher</option></select></label>
            </>}
            <label className="block text-sm font-medium text-slate-700">Password<div className="mt-1.5 relative"><input required minLength={6} type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3.5 py-3 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="At least 6 characters"/><button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400">{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
            <button disabled={loading} className="w-full rounded-lg bg-[#1c4778] py-3 text-white font-semibold hover:bg-[#163b66] disabled:opacity-60 flex items-center justify-center gap-2">{loading&&<Loader2 size={17} className="animate-spin"/>}{register?'Create account':'Sign in'}</button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">{register?'Already have an account?':'New to CampusHub?'} <button onClick={()=>{setRegister(!register);setError(null);setSuccess(null);}} className="font-semibold text-blue-700 hover:text-blue-900">{register?'Sign in':'Create account'}</button></p>
        </div>
        {!register && <div className="mt-5 text-center text-xs text-slate-400">Admin account is managed by your college administrator.</div>}
      </div>
    </section>
  </main>;
};
