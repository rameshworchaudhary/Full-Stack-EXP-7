import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowUpRight, Award, BookOpen, CalendarDays, GraduationCap, ShieldCheck, Upload, Users, Loader2, CircleAlert, CheckCircle2, Trash2, Copy, Check } from 'lucide-react';
import { AxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { deleteMarkApi, getMarksApi, getStudentsApi, getUsersApi, uploadMarkApi } from '../services/api';
import type { Mark, User } from '../types/auth';

const card = 'rounded-2xl border border-slate-200/80 bg-white shadow-[0_3px_18px_rgba(22,45,79,.04)]';
export const Dashboard: React.FC = () => {
  const { username, role, token, refreshToken, tokenType, expiresIn } = useAuth();
  const [marks, setMarks] = useState<Mark[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [copiedToken, setCopiedToken] = useState<'access' | 'refresh' | null>(null);
  const [form, setForm] = useState({ studentId: '', subject: '', assessment: 'Midterm', score: '', maxScore: '100' });
  const isAdmin = role === 'ADMIN';
  const canUpload = role === 'TEACHER' || isAdmin;

  const refresh = async () => {
    setLoading(true); setError('');
    try {
      const [markRows, studentRows] = await Promise.all([
        getMarksApi(),
        canUpload ? (isAdmin ? getUsersApi() : getStudentsApi()) : Promise.resolve([]),
      ]);
      setMarks(markRows);
      setStudents(studentRows.filter(user => user.role === 'STUDENT' || user.role === 'USER'));
    } catch (err) {
      setError(err instanceof AxiosError ? (err.response?.data?.message || err.message) : 'Could not load the dashboard.');
    } finally { setLoading(false); }
  };
  useEffect(() => { void refresh(); }, [role]);

  const average = useMemo(() => marks.length ? Math.round(marks.reduce((sum, mark) => sum + mark.score / mark.maxScore * 100, 0) / marks.length) : 0, [marks]);
  const submitMark = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      await uploadMarkApi({ studentId: Number(form.studentId), subject: form.subject, assessment: form.assessment, score: Number(form.score), maxScore: Number(form.maxScore) });
      setMessage('Marks uploaded successfully.'); setForm({ ...form, subject: '', score: '' }); await refresh();
    } catch (err) { setError(err instanceof AxiosError ? (err.response?.data?.message || err.message) : 'Marks upload failed.'); }
    finally { setBusy(false); }
  };
  const removeMark = async (id: number) => {
    if (!window.confirm('Delete this marks record?')) return;
    try { await deleteMarkApi(id); setMarks(rows => rows.filter(mark => mark.id !== id)); }
    catch (err) { setError(err instanceof AxiosError ? (err.response?.data?.message || err.message) : 'Could not delete the marks record.'); }
  };

  const copyToken = async (kind: 'access' | 'refresh', value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedToken(kind);
      window.setTimeout(() => setCopiedToken(current => current === kind ? null : current), 1800);
    } catch {
      setError('Clipboard access is unavailable. Select and copy the token text instead.');
    }
  };

  const label = isAdmin ? 'Administrator' : role === 'TEACHER' ? 'Teacher' : 'Student';
  return <div className="space-y-6 pb-8">
    <section className="relative overflow-hidden rounded-3xl bg-[#172d4f] px-7 py-8 text-white md:px-10 md:py-10">
      <div className="absolute right-[-50px] top-[-150px] h-80 w-80 rounded-full border border-white/10"/><div className="absolute right-16 top-[-82px] h-52 w-52 rounded-full border border-white/10"/>
      <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div><div className="flex items-center gap-2 text-sm text-sky-200"><CalendarDays size={16}/> Campus overview · Academic year 2025–26</div><h1 className="mt-4 text-3xl font-semibold md:text-4xl">Good to see you, {username}.</h1><p className="mt-2 max-w-lg text-sm leading-6 text-blue-100/75">Your college workspace is ready. Check in on academic progress and keep everything moving.</p></div>
        <div className="flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm"><span className="h-2 w-2 rounded-full bg-emerald-300"/>{label} portal</div>
      </div>
    </section>

    <section className={`${card} p-5 sm:p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">Authentication upgrade</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Experiment 7.1 → Experiment 7.2</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">Experiment 7.1 used one JWT for authentication. Experiment 7.2 adds a short-lived access token and a separate refresh token that can be rotated and revoked.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{tokenType || 'Bearer'} authentication</span>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <TokenPanel label="Access token (JWT)" value={token} kind="access" onCopy={copyToken} detail={expiresIn ? `Expires in ${Math.round(expiresIn / 60)} minutes` : 'Used on API requests'} copied={copiedToken === 'access'} />
        <TokenPanel label="Refresh token" value={refreshToken} kind="refresh" onCopy={copyToken} detail={refreshToken ? 'Opaque token · rotate at /api/auth/refresh' : 'Not returned by this server response'} copied={copiedToken === 'refresh'} />
      </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500">Demo view: tokens are bearer credentials. Keep them private and sign out when finished.</p>
          <p className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold tracking-wide text-blue-800">Student ID: 24BAI71012</p>
        </div>
    </section>

    {error && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><CircleAlert size={18}/>{error}</div>}
    {message && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"><CheckCircle2 size={18}/>{message}</div>}

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        { title: 'My assessments', value: marks.length, note: 'Marks records available', icon: BookOpen, color: 'text-blue-700 bg-blue-50' },
        { title: 'Average score', value: `${average}%`, note: marks.length ? 'Across your assessments' : 'No marks posted yet', icon: Activity, color: 'text-violet-700 bg-violet-50' },
        { title: canUpload ? 'Students' : 'Academic status', value: canUpload ? students.length : (average >= 75 ? 'On track' : 'In progress'), note: canUpload ? 'In your college directory' : 'Keep up your great work', icon: GraduationCap, color: 'text-emerald-700 bg-emerald-50' },
        { title: 'Campus access', value: label, note: 'Your role based workspace', icon: ShieldCheck, color: 'text-amber-700 bg-amber-50' },
      ].map(item => <div key={item.title} className={`${card} p-5`}><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500">{item.title}</p><p className="mt-3 text-2xl font-bold text-slate-900">{item.value}</p></div><div className={`rounded-xl p-2.5 ${item.color}`}><item.icon size={20}/></div></div><p className="mt-3 text-xs text-slate-400">{item.note}</p></div>)}
    </section>

    {canUpload && <section className={`${card} p-6`}>
      <div className="flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><Upload size={20}/></div><div><h2 className="font-semibold text-slate-900">Upload student marks</h2><p className="text-sm text-slate-500">Add an assessment score to a student's academic record.</p></div></div>
      <form onSubmit={submitMark} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-xs font-semibold text-slate-600">Student<select required value={form.studentId} onChange={e=>setForm({...form, studentId:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal"><option value="">Choose student</option>{students.map(student=><option key={student.id} value={student.id}>{student.username} · #{student.id}</option>)}</select></label>
        <label className="text-xs font-semibold text-slate-600">Subject<input required value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="e.g. Mathematics" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal"/></label>
        <label className="text-xs font-semibold text-slate-600">Assessment<input required value={form.assessment} onChange={e=>setForm({...form,assessment:e.target.value})} placeholder="Midterm" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal"/></label>
        <div className="grid grid-cols-2 gap-2"><label className="text-xs font-semibold text-slate-600">Score<input required type="number" min="0" step="0.5" value={form.score} onChange={e=>setForm({...form,score:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal"/></label><label className="text-xs font-semibold text-slate-600">Out of<input required type="number" min="1" step="0.5" value={form.maxScore} onChange={e=>setForm({...form,maxScore:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal"/></label></div>
        <button disabled={busy||students.length===0} className="self-end rounded-lg bg-[#1c4778] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163b66] disabled:opacity-50 flex items-center justify-center gap-2">{busy?<Loader2 size={16} className="animate-spin"/>:<Upload size={16}/>}Post marks</button>
      </form>
      {students.length===0&&!loading&&<p className="mt-3 text-xs text-amber-700">No student accounts found. Register students before uploading marks.</p>}
    </section>}

    <section className={`${card} overflow-hidden`}>
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h2 className="font-semibold text-slate-900">{isAdmin?'College marks ledger':role==='TEACHER'?'Recently uploaded marks':'My marks'}</h2><p className="mt-1 text-sm text-slate-500">{isAdmin?'Review academic records across the college.':'Your latest academic assessment records.'}</p></div><span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{marks.length} records</span></div>
      {loading?<div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-700"/></div>:marks.length===0?<div className="p-12 text-center"><div className="mx-auto w-fit rounded-2xl bg-slate-50 p-3 text-slate-400"><Award size={24}/></div><p className="mt-3 font-medium text-slate-700">No marks posted yet</p><p className="mt-1 text-sm text-slate-500">Assessment records will show here when available.</p></div>:<div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr>{(isAdmin?['Student','Subject','Assessment','Score','Uploaded by','']:['Subject','Assessment','Score','Grade','Posted by']).map(h=><th key={h} className="px-5 py-3.5 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{marks.map(mark=><tr key={mark.id} className="hover:bg-slate-50/70">{isAdmin&&<td className="px-5 py-4 font-medium text-slate-800">{mark.studentName}</td>}<td className="px-5 py-4 font-medium text-slate-800">{mark.subject}</td><td className="px-5 py-4 text-slate-600">{mark.assessment}</td><td className="px-5 py-4"><span className="font-semibold text-slate-900">{mark.score}</span><span className="text-slate-400"> / {mark.maxScore}</span><div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{width:`${Math.min(100,mark.score/mark.maxScore*100)}%`}}/></div></td>{isAdmin?<td className="px-5 py-4 text-slate-600">{mark.uploadedBy}</td>:<td className="px-5 py-4 text-slate-600">{mark.uploadedBy}</td>}{isAdmin&&<td className="px-5 py-4 text-right"><button onClick={()=>void removeMark(mark.id)} title="Delete marks record" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16}/></button></td>}</tr>)}</tbody></table></div>}
      {isAdmin&&<div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-3 text-xs text-slate-500"><span>College-wide academic records</span><Link to="/admin" className="flex items-center gap-1 font-semibold text-blue-700">Manage directory <ArrowUpRight size={14}/></Link></div>}
    </section>

    {isAdmin&&<Link to="/admin" className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/70 p-5 text-blue-900"><span className="flex items-center gap-3"><Users size={20}/><span><b className="block text-sm">College directory</b><span className="text-xs text-blue-800/70">Update account details, manage roles, and remove accounts</span></span></span><ArrowUpRight size={19}/></Link>}
  </div>;
};

interface TokenPanelProps {
  label: string;
  value: string | null;
  kind: 'access' | 'refresh';
  detail: string;
  copied: boolean;
  onCopy: (kind: 'access' | 'refresh', value: string) => void;
}

const TokenPanel: React.FC<TokenPanelProps> = ({ label, value, kind, detail, copied, onCopy }) => (
  <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">{label}</h3>
        <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
      </div>
      {value && <button type="button" onClick={() => void onCopy(kind, value)} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100" aria-label={`Copy ${label}`}>
        {copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copied' : 'Copy'}
      </button>}
    </div>
    <code className="mt-3 block max-h-24 overflow-auto break-all rounded-lg bg-white p-3 text-xs leading-5 text-slate-700 ring-1 ring-slate-200/70">{value || '—'}</code>
  </div>
);
