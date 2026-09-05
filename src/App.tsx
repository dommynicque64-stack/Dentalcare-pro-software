import { useEffect, useState, useMemo } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import supabase from './lib/supabase'
import { 
  LayoutDashboard, Users, CalendarDays, Stethoscope, CreditCard,
  BarChart3, UserCog, Settings, LogOut, Search, Bell, Menu, X,
  Plus, ChevronLeft, ChevronRight, Filter, TrendingUp, DollarSign,
  Clock, AlertCircle, Calendar, Pill, FileImage, Smile as Tooth, Activity,
  Eye, Edit3, Trash2, Check, Ban, RotateCcw, UserPlus, Mail, Phone,
  MapPin, Shield, Wallet, Download, Upload, Image as ImageIcon
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// All API requests carry the current Supabase access token.
async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(init.headers);
  if (session?.access_token) headers.set('Authorization', `Bearer ${session.access_token}`);
  return fetch(input, { ...init, headers });
}

// --- Types ---
type View = 'dashboard'|'patients'|'appointments'|'treatments'|'billing'|'reports'|'staff'|'settings'
type Role = 'Admin'|'Dentist'|'Receptionist'|'Accountant'

const rolePermissions: Record<Role, View[]> = {
  Admin: ['dashboard','patients','appointments','treatments','billing','reports','staff','settings'],
  Dentist: ['dashboard','patients','appointments','treatments','billing','reports'],
  Receptionist: ['dashboard','patients','appointments','billing'],
  Accountant: ['dashboard','billing','reports'],
}

const navItems: {id:View,label:string,icon:any, desc:string}[] = [
  {id:'dashboard', label:'Dashboard', icon:LayoutDashboard, desc:'Overview'},
  {id:'patients', label:'Patients', icon:Users, desc:'Manage patients'},
  {id:'appointments', label:'Appointments', icon:CalendarDays, desc:'Schedule'},
  {id:'treatments', label:'Treatments', icon:Stethoscope, desc:'Clinical'},
  {id:'billing', label:'Billing', icon:CreditCard, desc:'Payments'},
  {id:'reports', label:'Reports', icon:BarChart3, desc:'Analytics'},
  {id:'staff', label:'Staff', icon:UserCog, desc:'Team'},
  {id:'settings', label:'Settings', icon:Settings, desc:'Configuration'},
]

// Zod schema for patient registration
const patientSchema = z.object({
  first_name: z.string().min(2,"At least 2 chars"),
  last_name: z.string().min(2,"At least 2 chars"),
  phone: z.string().min(10,"Valid phone required"),
  email: z.string().email("Valid email").optional().or(z.literal("")),
  dob: z.string().min(1,"DOB required"),
  gender: z.enum(["Male","Female","Other"]),
  address: z.string().optional(),
  allergies: z.string().optional(),
  medical_history: z.string().optional(),
  insurance: z.string().optional(),
})
type PatientForm = z.infer<typeof patientSchema>

function LoginView(){
  const { login } = useAuth()
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)
  const [showForgot,setShowForgot]=useState(false)
  const [forgotEmail,setForgotEmail]=useState('')
  const [forgotSent,setForgotSent]=useState(false)
  const [forgotLoading,setForgotLoading]=useState(false)
  const handleLogin=async(e:React.FormEvent)=>{
    e.preventDefault(); setError(''); setLoading(true);
    try{ await login(email,password); }catch(err:any){ setError(err.message||'Login failed'); }finally{ setLoading(false); }
  }
  const handleForgot=async(e:React.FormEvent)=>{
    e.preventDefault(); setError(''); setForgotLoading(true);
    try{ 
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, { redirectTo: window.location.origin }); 
      if(error) throw error; 
      setForgotSent(true);
    }catch(err:any){
      setError(err?.message || 'Unable to send password reset email. Please try again.');
    }finally{ setForgotLoading(false); }
  }
  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-black/10"/>
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"/>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl"/>
        <div className="relative z-10 max-w-lg text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center"><Tooth className="w-7 h-7 text-teal-600"/></div>
            <span className="text-2xl font-bold tracking-tight">DentaCare Pro</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">Modern care,<br/>seamless management.</h1>
          <p className="text-white/80 text-lg mb-8 leading-relaxed">The complete dental clinic operating system — patients, appointments, charts, billing and reports in one beautiful workspace.</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20"><div className="font-semibold">HIPAA-ready</div><div className="text-white/70">Secure & compliant</div></div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20"><div className="font-semibold">4 Roles</div><div className="text-white/70">RBAC enforced</div></div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20"><div className="font-semibold">Realtime</div><div className="text-white/70">No overlap bookings</div></div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20"><div className="font-semibold">Storage</div><div className="text-white/70">X-rays & docs</div></div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center"><Tooth className="w-6 h-6 text-white"/></div>
            <span className="text-xl font-bold text-slate-800">DentaCare Pro</span>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 mt-1 mb-6">Sign in to your clinic workspace</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@dentacare.com" className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-slate-900 placeholder:text-slate-400"/>
              </div>
              <div>
                <div className="flex items-center justify-between"><label className="text-sm font-medium text-slate-700">Password</label><button type="button" onClick={()=>setShowForgot(true)} className="text-sm text-teal-600 hover:text-teal-700 font-medium">Forgot password?</button></div>
                <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"/>
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex gap-2"><AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0"/>{error}</div>}
              <button disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
                {loading? 'Signing in…':'Sign in'} { loading ? null : <ChevronRight className="w-4 h-4"/>}
              </button>
            </form>

          </div>
          <p className="text-center text-xs text-slate-400 mt-4">Protected routes • Server permission checks • PostgreSQL + Supabase Auth</p>
        </div>
      </div>
      {showForgot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            {!forgotSent ? (
              <form onSubmit={handleForgot}>
                <h3 className="text-lg font-bold text-slate-900">Reset password</h3>
                <p className="text-sm text-slate-500 mt-1">We'll send a secure reset link to your email.</p>
                <input value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)} placeholder="you@clinic.com" className="mt-4 w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none" required/>
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={()=>setShowForgot(false)} className="flex-1 py-3 rounded-xl border border-slate-200 font-medium hover:bg-slate-50">Cancel</button>
                  <button disabled={forgotLoading} className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-60">{forgotLoading?'Sending…':'Send reset link'}</button>
                </div>
              </form>
            ):(
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3"><Mail className="w-7 h-7 text-emerald-600"/></div>
                <h3 className="font-bold text-slate-900">Check your email</h3>
                <p className="text-sm text-slate-500 mt-1">If an account exists for <span className="font-medium text-slate-700">{forgotEmail}</span>, you'll receive a reset link shortly.</p>
                <button onClick={()=>{setShowForgot(false); setForgotSent(false); setForgotEmail('')}} className="mt-6 w-full py-3 rounded-xl bg-slate-900 text-white font-semibold">Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function AppShell(){
  const { user, loading, logout } = useAuth()
  const [view,setView]=useState<View>('dashboard')
  const [mobileOpen,setMobileOpen]=useState(false)
  const [globalQuery,setGlobalQuery]=useState('')
  const [globalResults,setGlobalResults]=useState<any[]>([])
  const [showProfile,setShowProfile]=useState(false)
  const [notifOpen,setNotifOpen]=useState(false)
  const [selectedPatient,setSelectedPatient]=useState<any>(null)

  // check permission
  useEffect(()=>{
    if(user && !rolePermissions[user.role].includes(view)){
      setView(rolePermissions[user.role][0])
    }
  },[user, view])

  // global search debounce
  useEffect(()=>{
    if(!globalQuery.trim()){ setGlobalResults([]); return; }
    const id=setTimeout(async()=>{
      try{ const r=await apiFetch(`/api/patients?search=${encodeURIComponent(globalQuery)}&limit=5`); const j=await r.json(); setGlobalResults(j.data||[]); }catch{ setGlobalResults([]); }
    },300)
    return ()=>clearTimeout(id)
  },[globalQuery])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          Loading your clinic workspace...
        </div>
      </div>
    )
  }
  if(!user) return <LoginView/>
  const allowed = rolePermissions[user.role]
  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[280px] flex-col bg-white border-r border-slate-200 fixed inset-y-0 left-0 z-30">
        <div className="h-[64px] px-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center"><Tooth className="w-5 h-5 text-white"/></div>
          <div>
            <div className="font-bold text-slate-900 leading-none">DentaCare Pro</div>
            <div className="text-xs text-slate-500">Clinic OS • v1.0</div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item=>{
            const isActive = view===item.id
            const isAllowed = allowed.includes(item.id)
            return (
              <button key={item.id} onClick={()=> isAllowed && setView(item.id)} disabled={!isAllowed}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition text-left ${isActive? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : isAllowed ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' : 'text-slate-300 cursor-not-allowed'}`}>
                <item.icon className={`w-5 h-5 ${isActive? 'text-white' : isAllowed ? 'text-slate-400' : 'text-slate-300'}`}/>
                <span className="flex-1">{item.label}</span>
                {!isAllowed && <Shield className="w-3.5 h-3.5"/>}
                {isActive && <div className="w-2 h-2 bg-white rounded-full"/>}
              </button>
            )
          })}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-teal-700 font-semibold text-sm"><Activity className="w-4 h-4"/> Today's focus</div>
            <p className="text-xs text-slate-600 mt-1">Your access is controlled by your clinic role.</p>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">{user.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">{user.name}</div>
              <div className="text-xs text-slate-500 truncate">{user.email}</div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${user.role==='Admin'?'bg-slate-900 text-white': user.role==='Dentist'?'bg-teal-600 text-white': user.role==='Receptionist'?'bg-blue-600 text-white':'bg-emerald-600 text-white'}`}>{user.role}</span>
          </div>
          <button onClick={logout} className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"><LogOut className="w-4 h-4"/> Sign out</button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={()=>setMobileOpen(false)}/>
          <div className="w-[300px] bg-white h-full overflow-y-auto">
            <div className="h-[64px] px-6 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3"><div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center"><Tooth className="w-5 h-5 text-white"/></div><span className="font-bold">DentaCare Pro</span></div>
              <button onClick={()=>setMobileOpen(false)} className="p-2 rounded-xl hover:bg-slate-100"><X className="w-5 h-5"/></button>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map(item=>{
                const isActive=view===item.id; const ok=allowed.includes(item.id);
                return <button key={item.id} disabled={!ok} onClick={()=>{ if(ok){ setView(item.id); setMobileOpen(false);} }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium ${isActive?'bg-teal-600 text-white': ok?'text-slate-600 hover:bg-slate-50':'text-slate-300'}`}><item.icon className="w-5 h-5"/>{item.label}</button>
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-[280px] min-w-0">
        {/* Top Bar */}
        <header className="h-[64px] bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center gap-4 px-4 lg:px-6">
          <button onClick={()=>setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100"><Menu className="w-5 h-5"/></button>
          <div className="flex-1 max-w-xl relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
            <input value={globalQuery} onChange={e=>setGlobalQuery(e.target.value)} placeholder="Global patient search — name, ID, phone…" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm placeholder:text-slate-400"/>
            {globalResults.length>0 && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-30">
                {globalResults.map((p:any)=>(
                  <button key={p.id} onClick={()=>{ setSelectedPatient(p); setView('patients'); setGlobalQuery(''); setGlobalResults([]); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 border-b last:border-0 border-slate-100">
                    <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">{p.first_name[0]}{p.last_name[0]}</div>
                    <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-slate-900 truncate">{p.first_name} {p.last_name} <span className="font-normal text-slate-500">• {p.patient_id}</span></div><div className="text-xs text-slate-500">{p.phone} • {p.status}</div></div>
                    <ChevronRight className="w-4 h-4 text-slate-300"/>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={()=>setNotifOpen(v=>!v)} className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 relative">
                <Bell className="w-5 h-5 text-slate-600"/>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">3</span>
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-30">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between"><span className="font-semibold text-sm">Notifications</span><span className="text-xs bg-slate-900 text-white px-2 py-1 rounded-full">3 new</span></div>
                  {[
                    {t:'Appointment confirmed', d:'Emma Johnson — Today 2:30 PM with Dr. Chen', c:'text-emerald-600'},
                    {t:'Payment overdue', d:'Invoice INV-2026-004 • Ksh 320 outstanding', c:'text-amber-600'},
                    {t:'New patient registered', d:'Alex Rivera — PT-2026-0019', c:'text-blue-600'},
                  ].map((n,i)=>(
                    <div key={i} className="px-4 py-3 hover:bg-slate-50 border-b last:border-0 border-slate-100 flex gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${n.c.replace('text-','bg-')}`}/>
                      <div><div className="text-sm font-medium text-slate-900">{n.t}</div><div className="text-xs text-slate-500">{n.d}</div></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-3 pl-3 ml-1 border-l border-slate-200">
              <div className="text-right hidden md:block"><div className="text-sm font-semibold text-slate-900 leading-none">{user.name}</div><div className="text-xs text-slate-500">{user.role}</div></div>
              <button onClick={()=>setShowProfile(v=>!v)} className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm relative">{user.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</button>
            </div>
            <button onClick={()=>setShowProfile(v=>!v)} className="sm:hidden w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">{user.name[0]}</button>
          </div>
          {showProfile && (
            <div className="absolute right-4 top-[64px] mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">{user.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                <div><div className="font-semibold text-slate-900">{user.name}</div><div className="text-sm text-slate-500">{user.email}</div><span className="inline-flex mt-1 text-[10px] font-bold tracking-widest uppercase bg-teal-600 text-white px-2 py-0.5 rounded-full">{user.role}</span></div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600"><Mail className="w-4 h-4"/>{user.email}</div>
                <div className="flex items-center gap-2 text-slate-600"><Shield className="w-4 h-4"/> Server-side RBAC enforced</div>
              </div>
              <button onClick={logout} className="mt-4 w-full py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 flex items-center justify-center gap-2"><LogOut className="w-4 h-4"/> Logout</button>
            </div>
          )}
        </header>

        <main className="p-4 lg:p-6 max-w-[1600px] mx-auto">
          {view==='dashboard' && <DashboardView onQuick={(v)=>setView(v as View)} onSelectPatient={(p)=>{ setSelectedPatient(p); setView('patients'); }} />}
          {view==='patients' && <PatientsView selectedPatient={selectedPatient} onClearSelected={()=>setSelectedPatient(null)} user={user}/>}
          {view==='appointments' && <AppointmentsView user={user}/>}
          {view==='treatments' && <TreatmentsView user={user}/>}
          {view==='billing' && <BillingView user={user}/>}
          {view==='reports' && <ReportsView user={user}/>}
          {view==='staff' && <StaffView user={user}/>}
          {view==='settings' && <SettingsView user={user}/>}
        </main>
      </div>
    </div>
  )
}

// ---------- Dashboard ----------
function DashboardView({onQuick,onSelectPatient}:{onQuick:(v:string)=>void, onSelectPatient:(p:any)=>void}){
  const [data,setData]=useState<any>(null)
  const [loading,setLoading]=useState(true)
  const [range,setRange]=useState<'7d'|'monthly'>('7d')
  const fetchDashboard=async()=>{
    setLoading(true);
    try{ const r=await apiFetch('/api/dashboard'); const j=await r.json(); setData(j); }catch{ }finally{ setLoading(false); }
  }
  useEffect(()=>{ fetchDashboard(); },[])
  if(loading) return <div className="space-y-4"><div className="h-32 bg-white rounded-2xl animate-pulse border border-slate-200"/><div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><div className="lg:col-span-2 h-64 bg-white rounded-2xl animate-pulse border border-slate-200"/><div className="h-64 bg-white rounded-2xl animate-pulse border border-slate-200"/></div></div>
  if(!data) return <div className="bg-white rounded-2xl p-12 text-center border border-slate-200"><AlertCircle className="w-10 h-10 text-slate-300 mx-auto"/><p className="mt-3 text-slate-600">Failed to load dashboard.</p><button onClick={fetchDashboard} className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-xl">Retry</button></div>
  const k=data.kpis
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-slate-900">Good morning, Doctor</h1><p className="text-slate-500 text-sm">Here's what's happening in your clinic today.</p></div>
        <div className="flex gap-2">
          <button onClick={()=>onQuick('patients')} className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 shadow-sm"><UserPlus className="w-4 h-4"/> New patient</button>
          <button onClick={()=>onQuick('appointments')} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-medium hover:bg-slate-50"><Calendar className="w-4 h-4"/> Book</button>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {label:'Total patients', value:k.totalPatients, icon:Users, color:'bg-blue-600', sub:'All time'},
          {label:"Today's appointments", value:k.todayCount, icon:CalendarDays, color:'bg-teal-600', sub:`Pending: ${k.pending}`},
          {label:'Pending', value:k.pending, icon:Clock, color:'bg-amber-500', sub:'Awaiting confirm'},
          {label:'Outstanding', value:`Ksh ${Number(k.outstanding).toLocaleString()}`, icon:Wallet, color:'bg-red-500', sub:'Unpaid invoices'},
          {label:"Today's revenue", value:`Ksh ${Number(k.todayRevenue).toLocaleString()}`, icon:DollarSign, color:'bg-emerald-600', sub:'Payments today'},
        ].map(card=>(
          <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}><card.icon className="w-5 h-5 text-white"/></div>
              <span className="text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-full font-medium text-slate-600">{card.sub}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{card.value}</div>
            <div className="text-xs font-semibold tracking-widest uppercase text-slate-400 mt-1">{card.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-teal-600"/> Revenue overview</h3>
            <div className="flex bg-slate-100 rounded-full p-1 text-xs font-medium">
              <button onClick={()=>setRange('7d')} className={`px-3 py-1.5 rounded-full ${range==='7d'?'bg-white shadow text-slate-900':'text-slate-500'}`}>Last 7 days</button>
              <button onClick={()=>setRange('monthly')} className={`px-3 py-1.5 rounded-full ${range==='monthly'?'bg-white shadow text-slate-900':'text-slate-500'}`}>Monthly</button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {range==='7d' ? (
                <AreaChart data={data.revenueByDay}>
                  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0d9488" stopOpacity={0.3}/><stop offset="100%" stopColor="#0d9488" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                  <XAxis dataKey="date" tick={{fontSize:12}} stroke="#94a3b8"/>
                  <YAxis tick={{fontSize:12}} stroke="#94a3b8"/>
                  <Tooltip/>
                  <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} fill="url(#g)"/>
                </AreaChart>
              ) : (
                <BarChart data={data.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                  <XAxis dataKey="month" tick={{fontSize:10}} stroke="#94a3b8"/>
                  <YAxis stroke="#94a3b8"/>
                  <Tooltip/>
                  <Bar dataKey="revenue" fill="#0d9488" radius={[8,8,0,0]}/>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={()=>onQuick('billing')} className="flex-1 py-2.5 rounded-xl border border-slate-200 font-medium hover:bg-slate-50 text-sm flex items-center justify-center gap-2"><Plus className="w-4 h-4"/> Record payment</button>
            <button onClick={()=>onQuick('treatments')} className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-black text-sm flex items-center justify-center gap-2"><Stethoscope className="w-4 h-4"/> Add treatment</button>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">Today's schedule</h3>
          {(data.todayAppointments||[]).length===0 ? (
            <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
              <CalendarDays className="w-8 h-8 text-slate-300 mx-auto"/>
              <p className="text-sm text-slate-500 mt-2">No appointments today</p>
              <button onClick={()=>onQuick('appointments')} className="mt-3 text-sm font-medium text-teal-600 hover:text-teal-700">Book an appointment →</button>
            </div>
          ):(
            <div className="space-y-3 max-h-[320px] overflow-auto pr-1">
              {(data.todayAppointments||[]).slice(0,6).map((a:any)=>(
                <div key={a.id} className="flex gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50">
                  <div className="text-center min-w-[56px]"><div className="text-xs font-bold tracking-widest uppercase text-teal-600">{a.start_time}</div><div className="text-[10px] text-slate-400">{a.end_time}</div></div>
                  <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-slate-900 truncate">{a.patient_name||'Patient '+a.patient_id}</div><div className="text-xs text-slate-500 truncate">{a.type} • {a.dentist_name}</div></div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest h-fit ${a.status==='Confirmed'?'bg-emerald-100 text-emerald-700': a.status==='Scheduled'?'bg-amber-100 text-amber-700': a.status==='Completed'?'bg-slate-900 text-white':'bg-slate-100 text-slate-600'}`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={()=>onQuick('appointments')} className="mt-4 w-full py-2.5 rounded-xl border border-slate-200 font-medium hover:bg-slate-50 text-sm">View calendar</button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between"><h3 className="font-bold text-slate-900">Recent patients</h3><button onClick={()=>onQuick('patients')} className="text-sm font-medium text-teal-600 hover:text-teal-700">View all →</button></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest"><tr><th className="text-left px-6 py-3 font-semibold">Patient</th><th className="text-left px-4 py-3">Phone</th><th className="text-left px-4 py-3">Last visit</th><th className="text-left px-4 py-3">Balance</th><th className="text-left px-4 py-3">Status</th><th className="px-6 py-3"></th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {(data.recentPatients||[]).map((p:any)=>(
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">{p.first_name[0]}{p.last_name[0]}</div><div><div className="font-semibold text-slate-900">{p.first_name} {p.last_name}</div><div className="text-xs text-slate-500">{p.patient_id}</div></div></td>
                  <td className="px-4 py-3 text-slate-600">{p.phone}</td>
                  <td className="px-4 py-3 text-slate-600">{p.last_visit? new Date(p.last_visit).toLocaleDateString(): '—'}</td>
                  <td className={`px-4 py-3 font-semibold ${Number(p.outstanding_balance)>0?'text-red-600':'text-emerald-600'}`}>Ksh {Number(p.outstanding_balance||0).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`text-[11px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${p.status==='Active'?'bg-emerald-100 text-emerald-700':'bg-slate-100 text-slate-600'}`}>{p.status}</span></td>
                  <td className="px-6 py-3 text-right"><button onClick={()=>onSelectPatient(p)} className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 font-medium text-xs border border-teal-200 rounded-full px-3 py-1.5"><Eye className="w-3.5 h-3.5"/> View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ---------- Patients ----------
function PatientsView({selectedPatient,onClearSelected,user}:{selectedPatient:any, onClearSelected:()=>void, user:any}){
  const [patients,setPatients]=useState<any[]>([])
  const [total,setTotal]=useState(0)
  const [loading,setLoading]=useState(true)
  const [query,setQuery]=useState('')
  const [status,setStatus]=useState('all')
  const [gender,setGender]=useState('all')
  const [page,setPage]=useState(1)
  const [sort,setSort]=useState('id')
  const [order,setOrder]=useState<'asc'|'desc'>('asc')
  const [showForm,setShowForm]=useState(false)
  const [editPatient,setEditPatient]=useState<any>(null)
  const [detail,setDetail]=useState<any>(selectedPatient)
  const [error,setError]=useState('')
  const limit=8
  const fetchPatients=async()=>{
    setLoading(true); setError('');
    try{
      const params=new URLSearchParams({ page:String(page), limit:String(limit), sort, order });
      if(query) params.set('search', query);
      if(status!=='all') params.set('status', status);
      if(gender!=='all') params.set('gender', gender);
      const r=await apiFetch(`/api/patients?${params.toString()}`);
      const j=await r.json();
      if(!r.ok) throw new Error(j.error||'Failed');
      setPatients(j.data||[]); setTotal(j.count||0);
    }catch(e:any){ setError(e.message); }finally{ setLoading(false); }
  }
  useEffect(()=>{ fetchPatients(); },[query,status,gender,page,sort,order])
  useEffect(()=>{ if(selectedPatient) setDetail(selectedPatient); },[selectedPatient])
  const pages = Math.max(1, Math.ceil(total/limit))
  const { register, handleSubmit, reset, formState:{errors} } = useForm<PatientForm>({ resolver: zodResolver(patientSchema), defaultValues:{ gender:'Male' } })
  useEffect(()=>{ if(editPatient){ reset({ first_name:editPatient.first_name, last_name:editPatient.last_name, phone:editPatient.phone, email:editPatient.email||'', dob:editPatient.dob?.slice(0,10), gender:editPatient.gender, address:editPatient.address||'', medical_history:editPatient.medical_history||'', allergies:editPatient.allergies||'', insurance:editPatient.insurance||'' }); } else { reset({ first_name:'',last_name:'',phone:'',email:'',dob:'',gender:'Male',address:'',allergies:'',medical_history:'',insurance:''}) } },[editPatient])
  const onSubmit=async(data:PatientForm)=>{
    try{
      if(editPatient){
        const r=await apiFetch('/api/patients',{method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id:editPatient.id, ...data })});
        if(!r.ok) throw new Error('Update failed');
      }else{
        const r=await apiFetch('/api/patients',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)});
        const j=await r.json(); if(!r.ok) throw new Error(j.error||'Create failed');
      }
      setShowForm(false); setEditPatient(null); fetchPatients();
    }catch(e:any){ alert(e.message); }
  }
  const canEdit = ['Admin','Receptionist','Dentist'].includes(user.role)
  if(detail) return <PatientDetail patient={detail} onBack={()=>{ setDetail(null); onClearSelected(); fetchPatients(); }} user={user}/>
  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-slate-900">Patients</h1><p className="text-sm text-slate-500">{total} total • unique Patient ID auto-generated</p></div>
        {canEdit && <button onClick={()=>{ setEditPatient(null); reset({first_name:'',last_name:'',phone:'',email:'',dob:'',gender:'Male',address:'',allergies:'',medical_history:'',insurance:''}); setShowForm(true); }} className="inline-flex items-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 shadow"><UserPlus className="w-4 h-4"/> Register patient</button>}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col lg:flex-row gap-3">
        <div className="flex-1 relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e=>{setQuery(e.target.value); setPage(1)}} placeholder="Search name, ID, phone…" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"/></div>
        <div className="flex gap-2">
          <select value={status} onChange={e=>{setStatus(e.target.value); setPage(1)}} className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium"><option value="all">All status</option><option>Active</option><option>Inactive</option><option>Archived</option></select>
          <select value={gender} onChange={e=>{setGender(e.target.value); setPage(1)}} className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium"><option value="all">All genders</option><option>Male</option><option>Female</option><option>Other</option></select>
          <select value={sort} onChange={e=>setSort(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium"><option value="id">Sort: ID</option><option value="last_visit">Last visit</option><option value="outstanding_balance">Balance</option><option value="first_name">Name</option></select>
          <button onClick={()=>setOrder(o=>o==='asc'?'desc':'asc')} className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium flex items-center gap-1"><Filter className="w-4 h-4"/>{order==='asc'?'ASC':'DESC'}</button>
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4"/>{error}</div>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[1,2,3,4,5].map(i=><div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse"/>)}</div>
        ) : patients.length===0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto"><Users className="w-8 h-8 text-slate-400"/></div>
            <h3 className="font-semibold text-slate-900 mt-4">No patients found</h3><p className="text-sm text-slate-500 mt-1">Try adjusting search or register a new patient.</p>
            {canEdit && <button onClick={()=>setShowForm(true)} className="mt-4 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-medium">Register first patient</button>}
          </div>
        ):(
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest"><tr><th className="text-left px-6 py-3">Patient ID</th><th className="text-left px-4 py-3">Full name</th><th className="text-left px-4 py-3">Phone</th><th className="text-left px-4 py-3">DOB • Gender</th><th className="text-left px-4 py-3">Last visit</th><th className="text-left px-4 py-3">Balance</th><th className="text-left px-4 py-3">Status</th><th className="px-6 py-3"></th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((p:any)=>(
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono text-xs font-bold text-teal-700 bg-teal-50 rounded-full inline-flex mt-3 px-2.5 py-1">{p.patient_id}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">{p.first_name[0]}{p.last_name[0]}</div><div><div className="font-semibold text-slate-900">{p.first_name} {p.last_name}</div><div className="text-xs text-slate-500">{p.email||'—'}</div></div></div></td>
                    <td className="px-4 py-3 text-slate-700">{p.phone}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{p.dob? new Date(p.dob).toLocaleDateString(): '—'} • {p.gender}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{p.last_visit? new Date(p.last_visit).toLocaleDateString(): '—'}</td>
                    <td className={`px-4 py-3 font-bold ${Number(p.outstanding_balance)>0?'text-red-600':'text-emerald-600'}`}>Ksh {Number(p.outstanding_balance||0).toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                    <td className="px-4 py-3"><span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${p.status==='Active'?'bg-emerald-100 text-emerald-700': p.status==='Inactive'?'bg-amber-100 text-amber-700':'bg-slate-100 text-slate-600'}`}>{p.status}</span></td>
                    <td className="px-6 py-3 text-right"><div className="flex justify-end gap-1"><button onClick={()=>setDetail(p)} className="p-2 rounded-xl hover:bg-slate-100 border border-slate-200"><Eye className="w-4 h-4 text-slate-600"/></button>{canEdit && <button onClick={()=>{ setEditPatient(p); setShowForm(true); }} className="p-2 rounded-xl hover:bg-slate-100 border border-slate-200"><Edit3 className="w-4 h-4 text-slate-600"/></button>}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-sm text-slate-500">Page {page} of {pages} • {total} patients</span>
          <div className="flex gap-2">
            <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="p-2 rounded-xl border border-slate-200 bg-white disabled:opacity-40"><ChevronLeft className="w-4 h-4"/></button>
            <span className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium">{page}</span>
            <button disabled={page>=pages} onClick={()=>setPage(p=>Math.min(pages,p+1))} className="p-2 rounded-xl border border-slate-200 bg-white disabled:opacity-40"><ChevronRight className="w-4 h-4"/></button>
          </div>
        </div>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
              <div><h3 className="font-bold">{editPatient? 'Edit patient':'Register patient'}</h3><p className="text-xs text-white/80">Patient ID will be auto-generated</p></div>
              <button type="button" onClick={()=>{setShowForm(false); setEditPatient(null);}} className="p-2 rounded-xl bg-white/20 hover:bg-white/30"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              <div><label className="text-sm font-medium text-slate-700">First name *</label><input {...register('first_name')} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Emma"/><p className="text-xs text-red-600 mt-1">{errors.first_name?.message}</p></div>
              <div><label className="text-sm font-medium text-slate-700">Last name *</label><input {...register('last_name')} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Johnson"/><p className="text-xs text-red-600 mt-1">{errors.last_name?.message}</p></div>
              <div><label className="text-sm font-medium text-slate-700">Phone *</label><input {...register('phone')} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="+1 (555) 010-..."/><p className="text-xs text-red-600 mt-1">{errors.phone?.message}</p></div>
              <div><label className="text-sm font-medium text-slate-700">Email</label><input {...register('email')} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="emma@example.com"/><p className="text-xs text-red-600 mt-1">{errors.email?.message as any}</p></div>
              <div><label className="text-sm font-medium text-slate-700">Date of birth *</label><input type="date" {...register('dob')} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"/><p className="text-xs text-red-600 mt-1">{errors.dob?.message}</p></div>
              <div><label className="text-sm font-medium text-slate-700">Gender *</label><select {...register('gender')} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"><option>Male</option><option>Female</option><option>Other</option></select></div>
              <div className="md:col-span-2"><label className="text-sm font-medium text-slate-700">Address</label><input {...register('address')} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="123 Main St, New York, NY"/></div>
              <div><label className="text-sm font-medium text-slate-700">Insurance</label><input {...register('insurance')} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Delta Dental, Aetna…"/></div>
              <div><label className="text-sm font-medium text-slate-700">Allergies</label><input {...register('allergies')} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Penicillin, latex…"/></div>
              <div className="md:col-span-2"><label className="text-sm font-medium text-slate-700">Medical history</label><textarea {...register('medical_history')} rows={3} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Diabetes, hypertension, previous surgeries…"/></div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
              <button type="button" onClick={()=>{setShowForm(false); setEditPatient(null);}} className="px-6 py-3 rounded-xl border border-slate-200 font-medium hover:bg-white">Cancel</button>
              <button type="submit" className="px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700">{editPatient? 'Save changes':'Create patient'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

// ---------- Patient Detail with 7 tabs ----------
function PatientDetail({patient,onBack,user}:{patient:any,onBack:()=>void,user:any}){
  const [tab,setTab]=useState<'overview'|'appointments'|'dental'|'treatments'|'prescriptions'|'documents'|'billing'>('overview')
  const [appointments,setAppointments]=useState<any[]>([])
  const [treatments,setTreatments]=useState<any[]>([])
  const [prescriptions,setPrescriptions]=useState<any[]>([])
  const [invoices,setInvoices]=useState<any[]>([])
  const [payments,setPayments]=useState<any[]>([])
  const [documents,setDocuments]=useState<any[]>([])
  const [dental,setDental]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [newPresc,setNewPresc]=useState({ medication:'', dosage:'', duration:'', notes:'' })
  const [newTreat,setNewTreat]=useState({ name:'', tooth:'', cost:'', notes:'' })
  const [newDoc,setNewDoc]=useState({ file_name:'', category:'X-ray' })
  const [chartSelection,setChartSelection]=useState<number|null>(null)
  const fetchAll=async()=>{
    setLoading(true);
    try{
      const [a,t,p,inv,pay,doc,d]=await Promise.all([
        apiFetch(`/api/appointments?patient_id=${patient.id}`).then(r=>r.json()),
        apiFetch(`/api/treatments?patient_id=${patient.id}`).then(r=>r.json()),
        apiFetch(`/api/prescriptions?patient_id=${patient.id}`).then(r=>r.json()),
        apiFetch(`/api/invoices?patient_id=${patient.id}`).then(r=>r.json()),
        apiFetch(`/api/payments?patient_id=${patient.id}`).then(r=>r.json()),
        apiFetch(`/api/documents?patient_id=${patient.id}`).then(r=>r.json()),
        apiFetch(`/api/dental_records?patient_id=${patient.id}`).then(r=>r.json()),
      ]);
      setAppointments(a||[]); setTreatments(t||[]); setPrescriptions(p||[]); setInvoices(inv||[]); setPayments(pay||[]); setDocuments(doc||[]); setDental(d||[]);
    }catch{}finally{ setLoading(false); }
  }
  useEffect(()=>{ fetchAll(); },[patient.id])
  const totalOutstanding = invoices.reduce((s:any,i:any)=> s + (Number(i.amount)-Number(i.paid)),0)
  const canClinical = ['Admin','Dentist'].includes(user.role)
  const canBilling = ['Admin','Accountant','Receptionist'].includes(user.role)
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"><ChevronLeft className="w-4 h-4"/> Back to patients</button>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-700 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-32 translate-x-32"/>
          <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white text-slate-900 flex items-center justify-center text-2xl font-bold">{patient.first_name[0]}{patient.last_name[0]}</div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold">{patient.first_name} {patient.last_name}</h1><span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-mono font-bold tracking-widest">{patient.patient_id}</span><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${patient.status==='Active'?'bg-emerald-500 text-white':'bg-white/20 text-white'}`}>{patient.status}</span></div>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-white/80">
                <span className="flex items-center gap-1.5"><Phone className="w-4 h-4"/>{patient.phone}</span>
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4"/>{patient.email||'No email'}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/>{patient.dob? new Date(patient.dob).toLocaleDateString(): '—'} • {patient.gender}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4"/>{patient.address||'No address'}</span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 text-slate-900 min-w-[180px]">
              <div className="text-xs font-semibold tracking-widest uppercase text-slate-500">Outstanding</div>
              <div className={`text-2xl font-bold ${totalOutstanding>0?'text-red-600':'text-emerald-600'}`}>Ksh {totalOutstanding.toLocaleString(undefined,{minimumFractionDigits:2})}</div>
              <div className="text-xs text-slate-500 mt-1">Last visit: {patient.last_visit? new Date(patient.last_visit).toLocaleDateString(): '—'}</div>
            </div>
          </div>
        </div>
        <div className="flex gap-1 p-2 bg-slate-50 border-y border-slate-200 overflow-x-auto">
          {[
            {id:'overview',label:'Overview',icon:Activity},
            {id:'appointments',label:'Appointments',icon:CalendarDays},
            {id:'dental',label:'Dental Chart',icon:Tooth},
            {id:'treatments',label:'Treatments',icon:Stethoscope},
            {id:'prescriptions',label:'Prescriptions',icon:Pill},
            {id:'documents',label:'Documents',icon:FileImage},
            {id:'billing',label:'Billing',icon:CreditCard},
          ].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as any)} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap ${tab===t.id?'bg-white shadow border border-slate-200 text-slate-900':'text-slate-600 hover:bg-white/60'}`}><t.icon className="w-4 h-4"/>{t.label}</button>
          ))}
        </div>
        <div className="p-6">
          {loading ? <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-3"><div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"/> Loading…</div> : (
            <>
              {tab==='overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200"><div className="text-xs tracking-widest uppercase font-semibold text-slate-500">Appointments</div><div className="text-2xl font-bold text-slate-900 mt-1">{appointments.length}</div><div className="text-xs text-slate-500">{appointments.filter(a=>a.status==='Completed').length} completed</div></div>
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200"><div className="text-xs tracking-widest uppercase font-semibold text-slate-500">Treatments</div><div className="text-2xl font-bold text-slate-900 mt-1">{treatments.length}</div><div className="text-xs text-slate-500">{treatments.filter(t=>t.status==='Completed').length} completed</div></div>
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200"><div className="text-xs tracking-widest uppercase font-semibold text-slate-500">Balance due</div><div className={`text-2xl font-bold mt-1 ${totalOutstanding>0?'text-red-600':'text-emerald-600'}`}>Ksh {totalOutstanding.toLocaleString()}</div><div className="text-xs text-slate-500">{invoices.length} invoices</div></div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                      <h3 className="font-bold text-slate-900 mb-3">Medical & Insurance</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><span className="text-slate-500">Allergies:</span><p className="font-medium text-slate-900 mt-1">{patient.allergies||'None reported'}</p></div>
                        <div><span className="text-slate-500">Insurance:</span><p className="font-medium text-slate-900 mt-1">{patient.insurance||'No insurance'}</p></div>
                        <div className="md:col-span-2"><span className="text-slate-500">Medical history:</span><p className="font-medium text-slate-900 mt-1 whitespace-pre-wrap">{patient.medical_history||'No history recorded'}</p></div>
                        <div className="md:col-span-2"><span className="text-slate-500">Address:</span><p className="font-medium text-slate-900 mt-1">{patient.address||'—'}</p></div>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                      <h3 className="font-bold text-slate-900 mb-3">Recent activity</h3>
                      <div className="space-y-3">
                        {[...appointments].slice(0,3).map((a:any)=>(
                          <div key={a.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"><CalendarDays className="w-5 h-5 text-teal-600 mt-0.5"/><div className="flex-1"><div className="text-sm font-medium text-slate-900">{a.type} — {a.dentist_name}</div><div className="text-xs text-slate-500">{a.date} • {a.start_time}-{a.end_time} • {a.status}</div></div></div>
                        ))}
                        {appointments.length===0 && <p className="text-sm text-slate-500 py-4 text-center">No appointments yet.</p>}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl p-5 text-white">
                      <h4 className="font-bold">Quick actions</h4>
                      <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                        <button onClick={()=>setTab('appointments')} className="bg-white text-teal-700 rounded-xl py-2.5 font-semibold">Book</button>
                        <button onClick={()=>setTab('treatments')} disabled={!canClinical} className="bg-white/20 backdrop-blur rounded-xl py-2.5 font-semibold disabled:opacity-40">Treat</button>
                        <button onClick={()=>setTab('billing')} disabled={!canBilling} className="bg-white/20 backdrop-blur rounded-xl py-2.5 font-semibold disabled:opacity-40">Bill</button>
                        <button onClick={()=>setTab('prescriptions')} disabled={!canClinical} className="bg-white text-slate-900 rounded-xl py-2.5 font-semibold disabled:opacity-40">Rx</button>
                      </div>
                      {!canClinical && <p className="text-xs text-white/70 mt-3">Clinical actions require Dentist/Admin role.</p>}
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2"><Shield className="w-4 h-4"/> Access control</h4>
                      <p className="text-xs text-amber-800 mt-1">Data shown is filtered by your role (<span className="font-bold">{user.role}</span>). All permission checks are enforced on the API.</p>
                    </div>
                  </div>
                </div>
              )}
              {tab==='appointments' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900">Appointments ({appointments.length})</h3>
                  {appointments.length===0? <EmptyState icon={CalendarDays} title="No appointments" desc="This patient has no scheduled visits."/> : (
                    <div className="space-y-3">
                      {appointments.map((a:any)=>(
                        <div key={a.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50">
                          <div className="flex-1"><div className="font-semibold text-slate-900">{a.date} • {a.start_time}-{a.end_time} • {a.type}</div><div className="text-sm text-slate-500">{a.dentist_name} • {a.notes||'No notes'}</div></div>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest w-fit ${a.status==='Completed'?'bg-slate-900 text-white': a.status==='Cancelled'?'bg-red-100 text-red-700': a.status==='Confirmed'?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>{a.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {tab==='dental' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between"><h3 className="font-bold text-slate-900 flex items-center gap-2"><Tooth className="w-5 h-5 text-teal-600"/> Dental chart — FDI notation</h3><span className="text-xs bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">Click a tooth to annotate</span></div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <div className="text-xs font-bold tracking-widest uppercase text-slate-400 text-center mb-3">Upper jaw</div>
                    <div className="grid grid-cols-8 gap-2 max-w-3xl mx-auto">
                      {[18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28].map(n=>{
                        const rec=dental.find((d:any)=>d.tooth===String(n));
                        const sel=chartSelection===n;
                        return <button key={n} onClick={()=>setChartSelection(n)} className={`aspect-[3/4] rounded-xl border-2 flex flex-col items-center justify-center gap-1 p-2 transition ${ sel? 'bg-teal-600 border-teal-600 text-white shadow-lg' : rec ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-slate-200 hover:border-teal-300 text-slate-700'}`}><Tooth className="w-6 h-6"/><span className="text-[11px] font-bold">{n}</span>{rec && <span className="text-[9px] leading-none text-center line-clamp-2">{rec.diagnosis?.slice(0,14)}</span>}</button>
                      })}
                    </div>
                    <div className="text-xs font-bold tracking-widest uppercase text-slate-400 text-center mt-6 mb-3">Lower jaw</div>
                    <div className="grid grid-cols-8 gap-2 max-w-3xl mx-auto">
                      {[48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38].map(n=>{
                        const rec=dental.find((d:any)=>d.tooth===String(n));
                        const sel=chartSelection===n;
                        return <button key={n} onClick={()=>setChartSelection(n)} className={`aspect-[3/4] rounded-xl border-2 flex flex-col items-center justify-center gap-1 p-2 transition ${ sel? 'bg-teal-600 border-teal-600 text-white shadow-lg' : rec ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-slate-200 hover:border-teal-300 text-slate-700'}`}><Tooth className="w-6 h-6"/><span className="text-[11px] font-bold">{n}</span>{rec && <span className="text-[9px] leading-none text-center">{rec.diagnosis?.slice(0,14)}</span>}</button>
                      })}
                    </div>
                    {chartSelection && (
                      <div className="mt-6 bg-white border border-slate-200 rounded-xl p-4 max-w-3xl mx-auto">
                        <h4 className="font-bold text-slate-900">Tooth {chartSelection}</h4>
                        {dental.filter((d:any)=>d.tooth===String(chartSelection)).length===0 ? <p className="text-sm text-slate-500 mt-2">No records for this tooth.</p> : dental.filter((d:any)=>d.tooth===String(chartSelection)).map((d:any)=><div key={d.id} className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm"><div className="font-semibold">{d.diagnosis} • {d.procedure}</div><div className="text-slate-500 text-xs mt-1">{d.date} • {d.dentist_name}</div><div className="text-slate-600 mt-1">{d.notes}</div></div>)}
                        {canClinical ? (
                          <form onSubmit={async(e)=>{ e.preventDefault(); const f=new FormData(e.currentTarget as HTMLFormElement); const payload={ patient_id:patient.id, tooth:String(chartSelection), diagnosis:String(f.get('diagnosis')||''), procedure:String(f.get('procedure')||''), notes:String(f.get('notes')||''), dentist_name:user.name }; const r=await apiFetch('/api/dental_records',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)}); if(r.ok){ fetchAll(); (e.target as HTMLFormElement).reset(); } }} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input name="diagnosis" placeholder="Diagnosis (e.g. Caries)" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" required/>
                            <input name="procedure" placeholder="Procedure (e.g. Filling)" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" required/>
                            <input name="notes" placeholder="Notes" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"/>
                            <button className="md:col-span-3 py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-sm">Add record for tooth {chartSelection}</button>
                          </form>
                        ): <p className="text-xs text-slate-400 mt-3">Only Dentist/Admin can edit chart.</p>}
                      </div>
                    )}
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-semibold text-sm">All dental records ({dental.length})</div>
                    {dental.length===0? <div className="p-8 text-center text-sm text-slate-500">No dental records yet.</div> : <div className="divide-y divide-slate-100">{dental.map((d:any)=><div key={d.id} className="px-4 py-3 flex items-center gap-4 text-sm"><span className="font-mono text-xs bg-slate-900 text-white px-2 py-1 rounded-full">#{d.tooth}</span><div className="flex-1"><div className="font-medium text-slate-900">{d.diagnosis} → {d.procedure}</div><div className="text-xs text-slate-500">{d.date} • {d.dentist_name}</div></div><span className="text-xs text-slate-500">{d.notes}</span></div>)}</div>}
                  </div>
                </div>
              )}
              {tab==='treatments' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between"><h3 className="font-bold text-slate-900">Treatments ({treatments.length})</h3></div>
                  {canClinical && (
                    <form onSubmit={async(e)=>{ e.preventDefault(); if(!newTreat.name||!newTreat.cost) return; const r=await apiFetch('/api/treatments',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ patient_id:patient.id, name:newTreat.name, tooth:newTreat.tooth||null, cost:Number(newTreat.cost), notes:newTreat.notes, dentist_name:user.name, status:'Completed', date:new Date().toISOString().split('T')[0] })}); if(r.ok){ setNewTreat({name:'',tooth:'',cost:'',notes:''}); fetchAll(); } }} className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input placeholder="Treatment name *" value={newTreat.name} onChange={e=>setNewTreat({...newTreat,name:e.target.value})} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"/>
                      <input placeholder="Tooth (e.g. 16)" value={newTreat.tooth} onChange={e=>setNewTreat({...newTreat,tooth:e.target.value})} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"/>
                      <input placeholder="Cost *" type="number" value={newTreat.cost} onChange={e=>setNewTreat({...newTreat,cost:e.target.value})} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"/>
                      <input placeholder="Notes" value={newTreat.notes} onChange={e=>setNewTreat({...newTreat,notes:e.target.value})} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"/>
                      <button className="md:col-span-4 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm">Add treatment</button>
                    </form>
                  )}
                  {treatments.length===0? <EmptyState icon={Stethoscope} title="No treatments" desc="Clinical treatments will appear here."/> : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                      {treatments.map((t:any)=><div key={t.id} className="px-4 py-3 flex items-center gap-4 text-sm"><div className="flex-1"><div className="font-semibold text-slate-900">{t.name} {t.tooth && <span className="font-mono text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Tooth {t.tooth}</span>}</div><div className="text-xs text-slate-500">{t.date} • {t.dentist_name} • {t.status}</div><div className="text-xs text-slate-600">{t.notes}</div></div><div className="font-bold text-slate-900">Ksh {Number(t.cost).toLocaleString()}</div></div>)}
                    </div>
                  )}
                </div>
              )}
              {tab==='prescriptions' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900">Prescriptions ({prescriptions.length})</h3>
                  {canClinical && (
                    <form onSubmit={async(e)=>{ e.preventDefault(); if(!newPresc.medication) return; const r=await apiFetch('/api/prescriptions',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ patient_id:patient.id, medication:newPresc.medication, dosage:newPresc.dosage, duration:newPresc.duration, notes:newPresc.notes, prescribed_by:user.name })}); if(r.ok){ setNewPresc({medication:'',dosage:'',duration:'',notes:''}); fetchAll(); } }} className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input placeholder="Medication *" value={newPresc.medication} onChange={e=>setNewPresc({...newPresc,medication:e.target.value})} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"/>
                      <input placeholder="Dosage (e.g. 500mg)" value={newPresc.dosage} onChange={e=>setNewPresc({...newPresc,dosage:e.target.value})} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"/>
                      <input placeholder="Duration (e.g. 7 days)" value={newPresc.duration} onChange={e=>setNewPresc({...newPresc,duration:e.target.value})} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"/>
                      <input placeholder="Notes" value={newPresc.notes} onChange={e=>setNewPresc({...newPresc,notes:e.target.value})} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"/>
                      <button className="md:col-span-4 py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-sm">Issue prescription</button>
                    </form>
                  )}
                  {prescriptions.length===0? <EmptyState icon={Pill} title="No prescriptions" desc="Prescribed medications will be listed here."/> : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                      {prescriptions.map((p:any)=><div key={p.id} className="px-4 py-3 flex gap-4 text-sm"><div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0"><Pill className="w-5 h-5"/></div><div className="flex-1"><div className="font-semibold text-slate-900">{p.medication} — {p.dosage}</div><div className="text-xs text-slate-500">{p.duration} • {p.date} • by {p.prescribed_by}</div><div className="text-xs text-slate-600 mt-1">{p.notes}</div></div></div>)}
                    </div>
                  )}
                </div>
              )}
              {tab==='documents' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2"><FileImage className="w-5 h-5 text-teal-600"/> Documents & X-rays ({documents.length})</h3>
                  <form onSubmit={async(e)=>{ e.preventDefault(); if(!newDoc.file_name) return; const r=await apiFetch('/api/documents',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ patient_id:patient.id, file_name:newDoc.file_name, category:newDoc.category, file_type:'pdf', size: Math.floor(Math.random()*4000)+500, uploaded_by:user.name })}); if(r.ok){ setNewDoc({file_name:'',category:'X-ray'}); fetchAll(); } }} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-3">
                    <input placeholder="File name (e.g. panoramic-xray.pdf)" value={newDoc.file_name} onChange={e=>setNewDoc({...newDoc,file_name:e.target.value})} className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm"/>
                    <select value={newDoc.category} onChange={e=>setNewDoc({...newDoc,category:e.target.value})} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option>X-ray</option><option>Photo</option><option>Consent</option><option>Report</option><option>General</option></select>
                    <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm inline-flex items-center gap-2"><Upload className="w-4 h-4"/> Upload</button>
                  </form>
                  <p className="text-xs text-slate-500">Supabase Storage ready — files are stored securely with public URLs. This MVP simulates uploads; connect a real bucket by creating it in Supabase.</p>
                  {documents.length===0? <EmptyState icon={ImageIcon} title="No documents" desc="X-rays, photos and consent forms will appear here."/> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {documents.map((d:any)=><div key={d.id} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 flex gap-3"><div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">{d.category==='X-ray'? <ImageIcon className="w-6 h-6"/> : <FileImage className="w-6 h-6"/>}</div><div className="flex-1 min-w-0"><div className="font-medium text-slate-900 truncate text-sm">{d.file_name}</div><div className="text-xs text-slate-500">{d.category} • {d.file_type} • {(d.size/1000).toFixed(1)} KB • {new Date(d.created_at).toLocaleDateString()}</div><div className="text-xs text-slate-500">by {d.uploaded_by}</div></div><button onClick={async()=>{ await apiFetch('/api/documents',{method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:d.id})}); fetchAll(); }} className="p-2 hover:bg-red-50 rounded-xl h-fit"><Trash2 className="w-4 h-4 text-red-500"/></button></div>)}
                    </div>
                  )}
                </div>
              )}
              {tab==='billing' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200"><div className="text-xs uppercase tracking-widest font-semibold text-slate-500">Total invoiced</div><div className="text-xl font-bold text-slate-900 mt-1">Ksh {invoices.reduce((s:any,i:any)=>s+Number(i.amount),0).toLocaleString(undefined,{minimumFractionDigits:2})}</div></div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200"><div className="text-xs uppercase tracking-widest font-semibold text-slate-500">Total paid</div><div className="text-xl font-bold text-emerald-600 mt-1">Ksh {invoices.reduce((s:any,i:any)=>s+Number(i.paid),0).toLocaleString(undefined,{minimumFractionDigits:2})}</div></div>
                    <div className="bg-red-50 rounded-xl p-4 border border-red-200"><div className="text-xs uppercase tracking-widest font-semibold text-red-700">Outstanding</div><div className="text-xl font-bold text-red-600 mt-1">Ksh {totalOutstanding.toLocaleString(undefined,{minimumFractionDigits:2})}</div></div>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-semibold text-sm flex items-center justify-between">Invoices <span className="text-xs bg-white border border-slate-200 px-2 py-1 rounded-full">{invoices.length}</span></div>
                    {invoices.length===0? <div className="p-8 text-center text-sm text-slate-500">No invoices.</div> : (
                      <div className="divide-y divide-slate-100">
                        {invoices.map((inv:any)=>(
                          <div key={inv.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                            <div className="flex-1"><div className="font-mono font-bold text-slate-900">{inv.invoice_no} • <span className={`text-[11px] px-2 py-0.5 rounded-full uppercase tracking-widest ${inv.status==='Paid'?'bg-emerald-100 text-emerald-700': inv.status==='Partial'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}`}>{inv.status}</span></div><div className="text-xs text-slate-500">Due {inv.due_date} • Ksh {Number(inv.amount).toLocaleString()} total • Ksh {Number(inv.paid).toLocaleString()} paid</div></div>
                            {canBilling && inv.status!=='Paid' && <RecordPaymentButton invoice={inv} patient={patient} onDone={fetchAll}/>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {canBilling && (
                    <form onSubmit={async(e)=>{ e.preventDefault(); const f=new FormData(e.currentTarget as HTMLFormElement); const amount=Number(f.get('amount')); if(!amount) return; const r=await apiFetch('/api/invoices',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ patient_id:patient.id, patient_name:`${patient.first_name} ${patient.last_name}`, amount, due_date:String(f.get('due')|| new Date().toISOString().split('T')[0]), status:'Unpaid', paid:0, items:[{desc:String(f.get('desc')||'Treatment'), amount}]})}); if(r.ok){ (e.target as HTMLFormElement).reset(); fetchAll(); } }} className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input name="desc" placeholder="Description" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" required/>
                      <input name="amount" type="number" placeholder="Amount" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" required/>
                      <input name="due" type="date" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"/>
                      <button className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-sm">Create invoice</button>
                    </form>
                  )}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-semibold text-sm">Payment history</div>
                    {payments.length===0? <div className="p-8 text-center text-sm text-slate-500">No payments recorded.</div> : (
                      <div className="divide-y divide-slate-100 max-h-64 overflow-auto">
                        {payments.map((p:any)=><div key={p.id} className="px-4 py-3 flex items-center gap-3 text-sm"><div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center"><DollarSign className="w-4 h-4"/></div><div className="flex-1"><div className="font-semibold text-slate-900">Ksh {Number(p.amount).toLocaleString()} • {p.method}</div><div className="text-xs text-slate-500">{p.date} • {p.reference||'No ref'}</div></div></div>)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
function RecordPaymentButton({invoice, patient, onDone}:{invoice:any, patient:any, onDone:()=>void}){
  const [open,setOpen]=useState(false)
  const [amount,setAmount]=useState(String(Number(invoice.amount)-Number(invoice.paid)))
  const [method,setMethod]=useState('Cash')
  return (
    <>
      <button onClick={()=>setOpen(true)} className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700">Record payment</button>
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-slate-900">Record payment — {invoice.invoice_no}</h3>
            <p className="text-sm text-slate-500">Outstanding: Ksh {(Number(invoice.amount)-Number(invoice.paid)).toLocaleString()}</p>
            <div className="mt-4 space-y-3">
              <input value={amount} onChange={e=>setAmount(e.target.value)} type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="Amount"/>
              <select value={method} onChange={e=>setMethod(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200"><option>Cash</option><option>Card</option><option>Transfer</option><option>Insurance</option></select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-200 font-medium">Cancel</button>
              <button onClick={async()=>{ const r=await apiFetch('/api/payments',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ invoice_id:invoice.id, patient_id:patient.id, patient_name:`${patient.first_name} ${patient.last_name}`, amount:Number(amount), method, date:new Date().toISOString().split('T')[0] })}); if(r.ok){ setOpen(false); onDone(); } }} className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-semibold">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
function EmptyState({icon:Icon,title,desc}:{icon:any,title:string,desc:string}){
  return <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50"><Icon className="w-8 h-8 text-slate-300 mx-auto"/><h4 className="font-semibold text-slate-900 mt-3">{title}</h4><p className="text-sm text-slate-500 mt-1">{desc}</p></div>
}

// ---------- Appointments ----------
function AppointmentsView({user}:{user:any}){
  const [appointments,setAppointments]=useState<any[]>([])
  const [patients,setPatients]=useState<any[]>([])
  const [staff,setStaff]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [date,setDate]=useState(new Date().toISOString().split('T')[0])
  const [viewMode,setViewMode]=useState<'day'|'week'|'month'>('day')
  const [statusFilter,setStatusFilter]=useState('all')
  const [showForm,setShowForm]=useState(false)
  const [editing,setEditing]=useState<any>(null)
  const [formError,setFormError]=useState('')
  const [form,setForm]=useState({ patient_id:'', dentist_id:'', date: new Date().toISOString().split('T')[0], start_time:'09:00', end_time:'09:30', type:'Check-up', notes:'' })
  const canManage = ['Admin','Receptionist','Dentist'].includes(user.role)
  const fetchData=async()=>{
    setLoading(true);
    try{
      const [a,p,s]=await Promise.all([
        apiFetch('/api/appointments').then(r=>r.json()),
        apiFetch('/api/patients?limit=100').then(r=>r.json()),
        apiFetch('/api/staff').then(r=>r.json()),
      ]);
      setAppointments(a||[]); setPatients(p.data||[]); setStaff(s||[]);
    }catch{}finally{ setLoading(false); }
  }
  useEffect(()=>{ fetchData(); },[])
  const filtered = useMemo(()=>{
    let list=[...appointments];
    if(statusFilter!=='all') list=list.filter(a=>a.status===statusFilter);
    if(viewMode==='day') list=list.filter(a=>a.date===date);
    if(viewMode==='week'){
      const d=new Date(date); const day=d.getDay(); const mon=new Date(d); mon.setDate(d.getDate()- (day===0?6:day-1)); const sun=new Date(mon); sun.setDate(mon.getDate()+6);
      const toStr=(x:Date)=>x.toISOString().split('T')[0];
      list=list.filter(a=> a.date>=toStr(mon) && a.date<=toStr(sun));
    }
    // month: show all for now, filtered by month of selected date
    if(viewMode==='month'){
      const m=date.slice(0,7); list=list.filter(a=>a.date.startsWith(m));
    }
    return list.sort((a,b)=> (a.date+a.start_time).localeCompare(b.date+b.start_time));
  },[appointments,statusFilter,viewMode,date])
  const handleCreate=async(e:React.FormEvent)=>{
    e.preventDefault(); setFormError('');
    const selectedPatient = patients.find((p:any)=> String(p.id)===String(form.patient_id));
    const dentist = staff.find((s:any)=> String(s.id)===String(form.dentist_id)) || staff.find((s:any)=> s.role==='Dentist');
    if(!selectedPatient || !dentist) { setFormError('Select patient and dentist'); return; }
    const payload={ patient_id: Number(form.patient_id), dentist_id: Number(dentist.id), dentist_name: dentist.name, patient_name: `${selectedPatient.first_name} ${selectedPatient.last_name}`, date: form.date, start_time: form.start_time, end_time: form.end_time, type: form.type, notes: form.notes, status:'Scheduled' };
    if(editing){
      const r=await apiFetch('/api/appointments',{method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id:editing.id, ...payload })}); const j=await r.json(); if(!r.ok){ setFormError(j.error||'Failed'); return; }
    }else{
      const r=await apiFetch('/api/appointments',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)}); const j=await r.json(); if(!r.ok){ setFormError(j.error||'Failed'); return; }
    }
    setShowForm(false); setEditing(null); fetchData();
  }
  const updateStatus=async(id:number,status:string)=>{
    await apiFetch('/api/appointments',{method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id,status})}); fetchData();
  }
  const weekDays=useMemo(()=>{
    const d=new Date(date); const day=d.getDay(); const mon=new Date(d); mon.setDate(d.getDate()- (day===0?6:day-1));
    return Array.from({length:7},(_,i)=>{ const dd=new Date(mon); dd.setDate(mon.getDate()+i); return dd.toISOString().split('T')[0]; });
  },[date])
  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-slate-900">Appointments</h1><p className="text-sm text-slate-500">No overlaps per dentist — server validates every booking.</p></div>
        {canManage && <button onClick={()=>{ setEditing(null); setForm({...form, date, start_time:'09:00', end_time:'09:30'}); setShowForm(true); setFormError(''); }} className="inline-flex items-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 shadow"><Plus className="w-4 h-4"/> Book appointment</button>}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={()=>{ const d=new Date(date); d.setDate(d.getDate()-1); setDate(d.toISOString().split('T')[0]); }} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50"><ChevronLeft className="w-4 h-4"/></button>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 font-medium text-sm bg-white"/>
          <button onClick={()=>{ const d=new Date(date); d.setDate(d.getDate()+1); setDate(d.toISOString().split('T')[0]); }} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50"><ChevronRight className="w-4 h-4"/></button>
          <button onClick={()=>setDate(new Date().toISOString().split('T')[0])} className="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium">Today</button>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-100 rounded-full p-1 text-xs font-medium">
            {(['day','week','month'] as const).map(m=> <button key={m} onClick={()=>setViewMode(m)} className={`px-3 py-1.5 rounded-full capitalize ${viewMode===m?'bg-white shadow text-slate-900':'text-slate-500'}`}>{m}</button>)}
          </div>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium"><option value="all">All status</option><option>Scheduled</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option><option>No-show</option></select>
        </div>
      </div>
      {loading ? <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center"><div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"/></div> : filtered.length===0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center">
          <CalendarDays className="w-10 h-10 text-slate-300 mx-auto"/><h3 className="font-semibold text-slate-900 mt-3">No appointments</h3><p className="text-sm text-slate-500">No appointments for {viewMode} view.</p>
        </div>
      ) : viewMode==='week' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-7 divide-x divide-slate-200 bg-slate-50">
            {weekDays.map(d=>{
              const isToday=d===new Date().toISOString().split('T')[0];
              return <div key={d} className={`p-3 text-center ${isToday?'bg-teal-50':''}`}><div className="text-xs font-bold tracking-widest uppercase text-slate-500">{new Date(d).toLocaleDateString(undefined,{weekday:'short'})}</div><div className={`text-sm font-bold ${isToday?'text-teal-700':'text-slate-900'}`}>{new Date(d).toLocaleDateString(undefined,{month:'short', day:'numeric'})}</div></div>
            })}
          </div>
          <div className="grid grid-cols-7 divide-x divide-slate-200 min-h-[400px]">
            {weekDays.map(d=>(
              <div key={d} className="p-2 space-y-2 bg-white">
                {filtered.filter(a=>a.date===d).map((a:any)=>(
                  <div key={a.id} className={`p-2.5 rounded-xl border text-xs ${a.status==='Cancelled'?'bg-red-50 border-red-200 opacity-60': a.status==='Completed'?'bg-slate-900 text-white border-slate-900': a.status==='Confirmed'?'bg-emerald-50 border-emerald-200':'bg-amber-50 border-amber-200'}`}>
                    <div className="font-bold">{a.start_time} {a.patient_name||a.patient_id}</div><div className="opacity-80 truncate">{a.type} • {a.dentist_name?.split(' ').slice(-1)}</div><div className="mt-1 flex gap-1">{canManage && a.status==='Scheduled' && <button onClick={()=>updateStatus(a.id,'Confirmed')} className="px-2 py-1 bg-white rounded-full border text-[10px] font-bold">Confirm</button>}</div>
                  </div>
                ))}
                {filtered.filter(a=>a.date===d).length===0 && <div className="text-xs text-slate-400 text-center py-8">—</div>}
              </div>
            ))}
          </div>
        </div>
      ) : viewMode==='month' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-xs font-bold tracking-widest uppercase text-slate-500">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=> <div key={d} className="p-3 text-center">{d}</div>)}
          </div>
          {/* Simple month grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-200">
            {(() => {
              const [y,m]=date.split('-').map(Number); const first=new Date(y,m-1,1); let dow=first.getDay(); dow= dow===0?6:dow-1; const daysInMonth=new Date(y,m,0).getDate(); const cells=[];
              for(let i=0;i<dow;i++) cells.push(<div key={'e'+i} className="h-28 bg-slate-50 p-2"/>);
              for(let day=1;day<=daysInMonth;day++){
                const ds=`${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`; const dayApts=filtered.filter(a=>a.date===ds); const isToday=ds===new Date().toISOString().split('T')[0];
                cells.push(<div key={ds} className={`h-28 p-2 overflow-hidden ${isToday?'bg-teal-50/60':''}`}><div className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${isToday?'bg-teal-600 text-white': 'text-slate-700'}`}>{day}</div><div className="mt-1 space-y-1">{dayApts.slice(0,3).map((a:any)=><div key={a.id} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-900 text-white truncate">{a.start_time} {a.patient_name?.split(' ')[0]}</div>)}{dayApts.length>3 && <div className="text-[10px] text-slate-500">+{dayApts.length-3} more</div>}</div></div>)
              }
              return cells;
            })()}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
          <div className="px-6 py-3 bg-slate-50 flex items-center justify-between text-sm"><span className="font-semibold text-slate-700">{new Date(date).toLocaleDateString(undefined,{weekday:'long', year:'numeric', month:'long', day:'numeric'})}</span><span className="text-slate-500 text-xs">{filtered.length} appointments</span></div>
          {filtered.map((a:any)=>(
            <div key={a.id} className="px-6 py-4 flex flex-col lg:flex-row lg:items-center gap-4 hover:bg-slate-50">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-center min-w-[80px]"><div className="text-sm font-bold text-teal-700">{a.start_time} — {a.end_time}</div><div className="text-xs text-slate-500">{a.duration} min</div></div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">{(a.patient_name||'P').split(' ').map((s:string)=>s[0]).join('').slice(0,2)}</div>
                <div className="flex-1 min-w-0"><div className="font-semibold text-slate-900 truncate">{a.patient_name||`Patient #${a.patient_id}`} • <span className="font-normal text-slate-500">{a.type}</span></div><div className="text-xs text-slate-500 truncate">{a.dentist_name} • {a.notes||'No notes'}</div></div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest ${a.status==='Completed'?'bg-slate-900 text-white': a.status==='Confirmed'?'bg-emerald-100 text-emerald-700': a.status==='Cancelled'?'bg-red-100 text-red-700': a.status==='No-show'?'bg-amber-100 text-amber-700':'bg-slate-100 text-slate-700'}`}>{a.status}</span>
                {canManage && (
                  <div className="flex gap-1">
                    {a.status==='Scheduled' && <button onClick={()=>updateStatus(a.id,'Confirmed')} className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100" title="Confirm"><Check className="w-4 h-4 text-emerald-700"/></button>}
                    {(a.status==='Scheduled'||a.status==='Confirmed') && <button onClick={()=>updateStatus(a.id,'Completed')} className="p-2 rounded-xl bg-slate-900 text-white hover:bg-black" title="Complete"><Check className="w-4 h-4"/></button>}
                    <button onClick={()=>{ setEditing(a); setForm({ patient_id:String(a.patient_id), dentist_id:String(a.dentist_id), date:a.date, start_time:a.start_time, end_time:a.end_time, type:a.type, notes:a.notes||'' }); setShowForm(true); }} className="p-2 rounded-xl border border-slate-200 hover:bg-white bg-white" title="Reschedule/Edit"><Edit3 className="w-4 h-4 text-slate-600"/></button>
                    <button onClick={()=>updateStatus(a.id,'Cancelled')} className="p-2 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100" title="Cancel"><Ban className="w-4 h-4 text-red-600"/></button>
                    <button onClick={()=>updateStatus(a.id,'No-show')} className="p-2 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100" title="No-show"><AlertCircle className="w-4 h-4 text-amber-600"/></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
              <h3 className="font-bold">{editing? 'Reschedule appointment':'Book appointment'}</h3>
              <button type="button" onClick={()=>setShowForm(false)} className="p-2 rounded-xl bg-white/20"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              {formError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex gap-2"><AlertCircle className="w-4 h-4 mt-0.5"/>{formError}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="text-sm font-medium text-slate-700">Patient *</label><select value={form.patient_id} onChange={e=>setForm({...form, patient_id:e.target.value})} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm" required><option value="">Select patient</option>{patients.map((p:any)=><option key={p.id} value={p.id}>{p.first_name} {p.last_name} — {p.patient_id}</option>)}</select></div>
                <div className="col-span-2"><label className="text-sm font-medium text-slate-700">Dentist *</label><select value={form.dentist_id} onChange={e=>setForm({...form,dentist_id:e.target.value})} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm" required><option value="">Select dentist</option>{staff.filter((s:any)=>s.role==='Dentist').map((s:any)=><option key={s.id} value={s.id}>{s.name} — {s.specialty||'General'}</option>)} {staff.filter((s:any)=>s.role==='Dentist').length===0 && <option value="1">Dr. Marcus Chen — General</option>}</select></div>
                <div><label className="text-sm font-medium text-slate-700">Date *</label><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" required/></div>
                <div><label className="text-sm font-medium text-slate-700">Type</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm"><option>Check-up</option><option>Cleaning</option><option>Filling</option><option>Root Canal</option><option>Extraction</option><option>Whitening</option><option>Crown</option><option>Consultation</option></select></div>
                <div><label className="text-sm font-medium text-slate-700">Start *</label><input type="time" value={form.start_time} onChange={e=>setForm({...form,start_time:e.target.value})} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" required/></div>
                <div><label className="text-sm font-medium text-slate-700">End *</label><input type="time" value={form.end_time} onChange={e=>setForm({...form,end_time:e.target.value})} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" required/></div>
                <div className="col-span-2"><label className="text-sm font-medium text-slate-700">Notes</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" placeholder="Reason for visit…"/></div>
              </div>
              <p className="text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">Overlaps for the same dentist on the same day are blocked by the server (409 Conflict).</p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
              <button type="button" onClick={()=>setShowForm(false)} className="px-6 py-3 rounded-xl border border-slate-200 font-medium">Cancel</button>
              <button type="submit" className="px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold">{editing? 'Save changes':'Confirm booking'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

// ---------- Treatments ----------
function TreatmentsView({user}:{user:any}){
  const [treatments,setTreatments]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [filter,setFilter]=useState('all')
  const fetchT=async()=>{ setLoading(true); const r=await apiFetch('/api/treatments'); const j=await r.json(); setTreatments(j||[]); setLoading(false); }
  useEffect(()=>{fetchT()},[])
  const filtered = filter==='all'? treatments : treatments.filter((t:any)=>t.status===filter)
  const canEdit = ['Admin','Dentist'].includes(user.role)
  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900">Treatments</h1><p className="text-sm text-slate-500">Clinical procedures and dental chart entries.</p></div><select value={filter} onChange={e=>setFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium"><option value="all">All statuses</option><option>Planned</option><option>In Progress</option><option>Completed</option></select></div>
      {loading? <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center"><div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"/></div> : filtered.length===0? <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center"><Stethoscope className="w-10 h-10 text-slate-300 mx-auto"/><h3 className="font-semibold text-slate-900 mt-3">No treatments</h3><p className="text-sm text-slate-500">Treatments linked to patients will show here.</p></div> : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest"><tr><th className="text-left px-6 py-3">Date</th><th className="text-left px-4 py-3">Patient</th><th className="text-left px-4 py-3">Treatment</th><th className="text-left px-4 py-3">Tooth</th><th className="text-left px-4 py-3">Dentist</th><th className="text-left px-4 py-3">Cost</th><th className="text-left px-4 py-3">Status</th>{canEdit && <th className="px-6 py-3"></th>}</tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((t:any)=><tr key={t.id} className="hover:bg-slate-50"><td className="px-6 py-3 text-slate-600 text-xs">{t.date}</td><td className="px-4 py-3 font-medium text-slate-900">{t.patient_id}</td><td className="px-4 py-3 font-medium text-slate-900">{t.name}<div className="text-xs text-slate-500">{t.notes||''}</div></td><td className="px-4 py-3">{t.tooth? <span className="font-mono text-xs bg-slate-900 text-white px-2 py-1 rounded-full">{t.tooth}</span>:'—'}</td><td className="px-4 py-3 text-slate-600">{t.dentist_name||'—'}</td><td className="px-4 py-3 font-bold text-slate-900">Ksh {Number(t.cost).toLocaleString()}</td><td className="px-4 py-3"><span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${t.status==='Completed'?'bg-emerald-100 text-emerald-700': t.status==='In Progress'?'bg-blue-100 text-blue-700':'bg-amber-100 text-amber-700'}`}>{t.status}</span></td>{canEdit && <td className="px-6 py-3 text-right"><button onClick={async()=>{ const ns=t.status==='Planned'?'In Progress': t.status==='In Progress'?'Completed':'Planned'; await apiFetch('/api/treatments',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:t.id,status:ns})}); fetchT(); }} className="text-xs font-medium text-teal-600 hover:text-teal-700 border border-teal-200 rounded-full px-3 py-1">Advance</button></td>}</tr>)}</tbody></table></div>
        </div>
      )}
      {!canEdit && <p className="text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">Only Dentist/Admin can manage treatments.</p>}
    </div>
  )
}

// ---------- Billing ----------
function BillingView({user}:{user:any}){
  const [invoices,setInvoices]=useState<any[]>([])
  const [payments,setPayments]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [filter,setFilter]=useState('all')
  const canEdit = ['Admin','Accountant','Receptionist'].includes(user.role)
  const fetchB=async()=>{
    setLoading(true);
    const [inv,pay]=await Promise.all([apiFetch('/api/invoices').then(r=>r.json()), apiFetch('/api/payments').then(r=>r.json())]);
    setInvoices(inv||[]); setPayments(pay||[]); setLoading(false);
  }
  useEffect(()=>{fetchB()},[])
  const filteredInv = filter==='all'? invoices : invoices.filter((i:any)=>i.status===filter)
  const totalOutstanding = invoices.reduce((s:any,i:any)=> s+ (Number(i.amount)-Number(i.paid)),0)
  const totalRevenue = payments.reduce((s:any,p:any)=> s+Number(p.amount),0)
  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900">Billing & Payments</h1><p className="text-sm text-slate-500">Invoices, outstanding balances and payment history.</p></div><div className="flex gap-2"><select value={filter} onChange={e=>setFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium"><option value="all">All invoices</option><option>Unpaid</option><option>Partial</option><option>Paid</option></select></div></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><div className="text-xs tracking-widest uppercase font-semibold text-slate-500">Outstanding</div><div className="text-2xl font-bold text-red-600 mt-1">Ksh {totalOutstanding.toLocaleString(undefined,{minimumFractionDigits:2})}</div><div className="text-xs text-slate-500">{invoices.filter((i:any)=>i.status!=='Paid').length} unpaid invoices</div></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><div className="text-xs tracking-widest uppercase font-semibold text-slate-500">Collected</div><div className="text-2xl font-bold text-emerald-600 mt-1">Ksh {totalRevenue.toLocaleString(undefined,{minimumFractionDigits:2})}</div><div className="text-xs text-slate-500">{payments.length} payments</div></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><div className="text-xs tracking-widest uppercase font-semibold text-slate-500">Invoices</div><div className="text-2xl font-bold text-slate-900 mt-1">{invoices.length}</div><div className="text-xs text-slate-500">{invoices.filter((i:any)=>i.status==='Paid').length} paid • {invoices.filter((i:any)=>i.status==='Partial').length} partial</div></div>
      </div>
      {loading? <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center"><div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"/></div> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 font-bold text-slate-900">Invoices</div>
            <div className="divide-y divide-slate-100 max-h-[560px] overflow-auto">
              {filteredInv.length===0? <div className="p-12 text-center text-sm text-slate-500">No invoices for this filter.</div> : filteredInv.map((inv:any)=>(
                <div key={inv.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-slate-50">
                  <div className="flex-1 min-w-0"><div className="font-mono text-sm font-bold text-slate-900">{inv.invoice_no} <span className={`ml-2 text-[11px] px-2 py-0.5 rounded-full uppercase tracking-widest ${inv.status==='Paid'?'bg-emerald-100 text-emerald-700': inv.status==='Partial'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}`}>{inv.status}</span></div><div className="text-sm text-slate-700 truncate">{inv.patient_name||`Patient #${inv.patient_id}`} • due {inv.due_date}</div><div className="text-xs text-slate-500">Total Ksh {Number(inv.amount).toLocaleString()} • Paid Ksh {Number(inv.paid).toLocaleString()} • Due Ksh {(Number(inv.amount)-Number(inv.paid)).toLocaleString()}</div></div>
                  {canEdit && inv.status!=='Paid' && <QuickPay invoice={inv} onDone={fetchB}/>}
                  <button onClick={()=>{ if(confirm('Delete invoice?')) apiFetch('/api/invoices',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:inv.id})}).then(()=>fetchB()) }} className={`p-2 rounded-xl border border-slate-200 hover:bg-red-50 ${!canEdit? 'opacity-40 pointer-events-none':''}`}><Trash2 className="w-4 h-4 text-slate-500"/></button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 font-bold text-slate-900">Recent payments</div>
            <div className="divide-y divide-slate-100 max-h-[560px] overflow-auto">
              {payments.length===0? <div className="p-12 text-center text-sm text-slate-500">No payments yet.</div> : payments.slice(0,20).map((p:any)=>(
                <div key={p.id} className="px-6 py-4 flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><DollarSign className="w-5 h-5"/></div>
                  <div className="flex-1 min-w-0"><div className="font-bold text-slate-900">Ksh {Number(p.amount).toLocaleString()} <span className="text-xs font-normal text-slate-500">• {p.method}</span></div><div className="text-xs text-slate-500 truncate">{p.patient_name||'Patient '+p.patient_id} • {p.date}</div><div className="text-xs text-slate-400 truncate">{p.reference||''}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {!canEdit && <p className="text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">Billing is restricted to Admin/Accountant/Receptionist roles.</p>}
    </div>
  )
}
function QuickPay({invoice,onDone}:{invoice:any,onDone:()=>void}){
  const [open,setOpen]=useState(false)
  const [amount,setAmount]=useState(String(Number(invoice.amount)-Number(invoice.paid)))
  return (
    <>
      <button onClick={()=>setOpen(true)} className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700">Pay</button>
      {open && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-2xl p-6 w-full max-w-sm"><h3 className="font-bold">Record payment</h3><p className="text-sm text-slate-500">{invoice.invoice_no} • Outstanding Ksh {(Number(invoice.amount)-Number(invoice.paid)).toLocaleString()}</p><input value={amount} onChange={e=>setAmount(e.target.value)} type="number" className="mt-4 w-full px-4 py-3 rounded-xl border border-slate-200"/><div className="flex gap-3 mt-4"><button onClick={()=>setOpen(false)} className="flex-1 py-3 border border-slate-200 rounded-xl">Cancel</button><button onClick={async()=>{ await apiFetch('/api/payments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ invoice_id:invoice.id, patient_id:invoice.patient_id, patient_name:invoice.patient_name, amount:Number(amount), method:'Cash', date:new Date().toISOString().split('T')[0] })}); setOpen(false); onDone(); }} className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-semibold">Confirm</button></div></div></div>}
    </>
  )
}

// ---------- Reports ----------
function ReportsView({user}:{user:any}){
  const [invoices,setInvoices]=useState<any[]>([])
  const [payments,setPayments]=useState<any[]>([])
  const [appointments,setAppointments]=useState<any[]>([])
  const canView = ['Admin','Accountant','Dentist'].includes(user.role)
  useEffect(()=>{ if(!canView) return; Promise.all([apiFetch('/api/invoices').then(r=>r.json()), apiFetch('/api/payments').then(r=>r.json()), apiFetch('/api/appointments').then(r=>r.json())]).then(([inv,pay,apt])=>{ setInvoices(inv||[]); setPayments(pay||[]); setAppointments(apt||[]); }); },[])
  if(!canView) return <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center"><Shield className="w-10 h-10 text-slate-300 mx-auto"/><h3 className="font-bold text-slate-900 mt-3">Access denied</h3><p className="text-sm text-slate-500">Reports are available to Admin, Dentist and Accountant.</p></div>
  const monthlyRevenue = useMemo(()=>{
    const map:Record<string,number>={}; payments.forEach((p:any)=>{ const m=p.date?.slice(0,7); if(!m) return; map[m]=(map[m]||0)+Number(p.amount); });
    return Object.entries(map).sort().slice(-6).map(([month,revenue])=>({month, revenue}))
  },[payments])
  const statusCounts = useMemo(()=>{
    const m:Record<string,number>={}; appointments.forEach((a:any)=>{ m[a.status]=(m[a.status]||0)+1; });
    return Object.entries(m).map(([name,value])=>({name,value}))
  },[appointments])
  const byType = useMemo(()=>{
    const m:Record<string,number>={}; appointments.forEach((a:any)=>{ m[a.type]=(m[a.type]||0)+1; });
    return Object.entries(m).map(([name,value])=>({name,value}))
  },[appointments])
  const exportCsv=()=>{
    const rows=[['invoice_no','patient','amount','paid','status','due_date'], ...invoices.map((i:any)=>[i.invoice_no,i.patient_name,i.amount,i.paid,i.status,i.due_date])];
    const csv=rows.map(r=>r.join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='dentacare-report.csv'; a.click(); URL.revokeObjectURL(url);
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1><p className="text-sm text-slate-500">Financial and operational insights.</p></div><button onClick={exportCsv} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-medium hover:bg-slate-50 text-sm"><Download className="w-4 h-4"/> Export CSV</button></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6"><h3 className="font-bold text-slate-900 mb-4">Revenue (last 6 months)</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyRevenue}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/><XAxis dataKey="month" tick={{fontSize:11}}/><YAxis/><Tooltip/><Bar dataKey="revenue" fill="#0d9488" radius={[8,8,0,0]}/></BarChart></ResponsiveContainer></div></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6"><h3 className="font-bold text-slate-900 mb-4">Appointments by status</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={statusCounts} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/><XAxis type="number"/><YAxis dataKey="name" type="category" width={90} tick={{fontSize:12}}/><Tooltip/><Bar dataKey="value" fill="#334155" radius={[0,8,8,0]}/></BarChart></ResponsiveContainer></div></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6"><h3 className="font-bold text-slate-900 mb-4">Appointments by type</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={byType}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/><XAxis dataKey="name" tick={{fontSize:10}} interval={0} angle={-20} dy={10} height={60}/><YAxis/><Tooltip/><Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2} dot={{r:4}}/></LineChart></ResponsiveContainer></div></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">Key metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"><span className="text-sm text-slate-600">Total revenue</span><span className="font-bold text-slate-900">Ksh {payments.reduce((s:any,p:any)=>s+Number(p.amount),0).toLocaleString()}</span></div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"><span className="text-sm text-slate-600">Outstanding</span><span className="font-bold text-red-600">Ksh {invoices.reduce((s:any,i:any)=>s+(Number(i.amount)-Number(i.paid)),0).toLocaleString()}</span></div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"><span className="text-sm text-slate-600">Avg. treatment value</span><span className="font-bold text-slate-900">Ksh {invoices.length? (invoices.reduce((s:any,i:any)=>s+Number(i.amount),0)/invoices.length).toFixed(0):0}</span></div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"><span className="text-sm text-slate-600">Completion rate</span><span className="font-bold text-emerald-600">{appointments.length? Math.round(appointments.filter((a:any)=>a.status==='Completed').length/appointments.length*100):0}%</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------- Staff ----------
function StaffView({user}:{user:any}){
  const [staff,setStaff]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [showForm,setShowForm]=useState(false)
  const [form,setForm]=useState({name:'', email:'', role:'Dentist', specialty:'', phone:''})
  const canManage=user.role==='Admin'
  const fetchS=async()=>{ setLoading(true); const r=await apiFetch('/api/staff'); const j=await r.json(); setStaff(j||[]); setLoading(false); }
  useEffect(()=>{fetchS()},[])
  if(!canManage) return <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center"><Shield className="w-10 h-10 text-slate-300 mx-auto"/><h3 className="font-bold text-slate-900 mt-3">Admin only</h3><p className="text-sm text-slate-500">Staff management is restricted to Administrators.</p></div>
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900">Staff</h1><p className="text-sm text-slate-500">Manage clinic team and roles. Server validates permissions.</p></div><button onClick={()=>setShowForm(true)} className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl font-semibold"><Plus className="w-4 h-4"/> Add staff</button></div>
      {loading? <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center"><div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"/></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((s:any)=>(
            <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white flex items-center justify-center font-bold">{s.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}</div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${s.role==='Admin'?'bg-slate-900 text-white': s.role==='Dentist'?'bg-teal-600 text-white': s.role==='Receptionist'?'bg-blue-600 text-white':'bg-emerald-600 text-white'}`}>{s.role}</span>
              </div>
              <div className="mt-3"><div className="font-bold text-slate-900">{s.name}</div><div className="text-sm text-slate-500">{s.specialty||s.role}</div><div className="text-xs text-slate-500 mt-2 flex items-center gap-1"><Mail className="w-3 h-3"/>{s.email}</div><div className="text-xs text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3"/>{s.phone||'—'}</div></div>
              <div className="mt-4 flex gap-2">
                <select value={s.role} onChange={async(e)=>{ await apiFetch('/api/staff',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:s.id, role:e.target.value})}); fetchS(); }} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50"><option>Admin</option><option>Dentist</option><option>Receptionist</option><option>Accountant</option></select>
                <button onClick={async()=>{ if(confirm('Remove staff member?')){ await apiFetch('/api/staff',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:s.id})}); fetchS(); } }} className="p-2 rounded-xl border border-slate-200 hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500"/></button>
              </div>
              <span className={`inline-flex mt-3 text-[11px] font-bold px-2 py-1 rounded-full ${s.status==='Active'?'bg-emerald-100 text-emerald-700':'bg-slate-100 text-slate-600'}`}>{s.status}</span>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><form onSubmit={async(e)=>{ e.preventDefault(); await apiFetch('/api/staff',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)}); setShowForm(false); setForm({name:'',email:'',role:'Dentist',specialty:'',phone:''}); fetchS(); }} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4"><h3 className="font-bold text-slate-900">Add staff member</h3><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full name" className="w-full px-4 py-3 rounded-xl border border-slate-200" required/><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email" className="w-full px-4 py-3 rounded-xl border border-slate-200" required/><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white"><option>Admin</option><option>Dentist</option><option>Receptionist</option><option>Accountant</option></select><input value={form.specialty} onChange={e=>setForm({...form,specialty:e.target.value})} placeholder="Specialty (e.g. Orthodontics)" className="w-full px-4 py-3 rounded-xl border border-slate-200"/><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone" className="w-full px-4 py-3 rounded-xl border border-slate-200"/><div className="flex gap-3"><button type="button" onClick={()=>setShowForm(false)} className="flex-1 py-3 border border-slate-200 rounded-xl">Cancel</button><button className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold">Create</button></div></form></div>
      )}
    </div>
  )
}

// ---------- Settings ----------
function SettingsView({user}:{user:any}){
  const [clinicName,setClinicName]=useState('DentaCare Pro Clinic')
  const [accent,setAccent]=useState('teal')
  const [saved,setSaved]=useState(false)
  return (
    <div className="space-y-6 max-w-4xl">
      <div><h1 className="text-2xl font-bold text-slate-900">Settings</h1><p className="text-sm text-slate-500">Clinic configuration • Role-based access control</p></div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3"><Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"/><div className="text-sm"><span className="font-bold text-amber-900">Production note:</span><span className="text-amber-800"> In production this uses Supabase Auth + RLS + Storage. This MVP enforces role checks on the API and demonstrates permission-gated UI.</span></div></div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        <div>
          <h3 className="font-bold text-slate-900">Access control</h3>
          <p className="text-sm text-slate-500 mt-1">Your current role is <span className="font-semibold text-slate-900">{user.role}</span>. Role changes must be made by an administrator in the authentication/database configuration.</p>
        </div>
        <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="text-sm font-medium text-slate-700">Clinic name</label><input value={clinicName} onChange={e=>setClinicName(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200"/></div>
          <div><label className="text-sm font-medium text-slate-700">Accent theme</label><select value={accent} onChange={e=>setAccent(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white"><option value="teal">Teal (default)</option><option value="blue">Blue</option><option value="emerald">Emerald</option></select></div>
          <div><label className="text-sm font-medium text-slate-700">Working hours</label><input defaultValue="Mon–Sat 9:00–18:00" className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200"/></div>
          <div><label className="text-sm font-medium text-slate-700">Contact email</label><input defaultValue="hello@dentacare.pro" className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200"/></div>
        </div>
        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          <button onClick={()=>{ setSaved(true); setTimeout(()=>setSaved(false),2000); }} className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold">Save changes</button>
          {saved && <span className="text-sm text-emerald-600 font-medium flex items-center gap-1"><Check className="w-4 h-4"/> Saved</span>}
          <span className="text-xs text-slate-400 ml-auto">Supabase PostgreSQL • Supabase Auth • Supabase Storage</span>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900">Tech stack</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs">
          {['React + TypeScript + Vite','Tailwind CSS','PostgreSQL + Supabase','Supabase Auth','Supabase Storage','React Hook Form + Zod','Lucide React','Recharts'].map(t=> <div key={t} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-full text-center font-medium text-slate-700">{t}</div>)}
        </div>
      </div>
    </div>
  )
}

export default function App(){
  return (
    <AuthProvider>
      <AppShell/>
    </AuthProvider>
  )
}
