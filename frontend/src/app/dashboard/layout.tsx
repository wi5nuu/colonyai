'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Upload, History, FileText, Settings, LogOut, Menu, X,
  FlaskConical, Bell, Scale, BarChart3, Search, Calendar, ShieldCheck, Activity,
  Lock, Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { AuthGuard } from '@/lib/auth-guard'
import { useAuthStore } from '@/lib/auth-store'
import { SmartAssistant } from '@/components/smart-assistant'

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['analyst', 'viewer', 'admin'] },
  { name: 'New Analysis', href: '/dashboard/upload', icon: Upload, roles: ['analyst', 'admin'] },
  { name: 'History', href: '/dashboard/history', icon: History, roles: ['analyst', 'viewer', 'admin'] },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, roles: ['viewer', 'admin'] },
  { name: 'Simulator', href: '/dashboard/simulator', icon: Scale, roles: ['analyst', 'admin'] },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText, roles: ['viewer', 'admin'] },
  { name: 'Audit Ledger', href: '/dashboard/audit', icon: ShieldCheck, roles: ['viewer', 'admin'] },
  { name: 'Administration', href: '/dashboard/administration', icon: Lock, roles: ['admin'] },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['analyst', 'viewer', 'admin'] },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Analysis Completed', message: 'Sample ISO-PCA-2026-001 is ready for review.', time: '2 mins ago', type: 'success', iconName: 'flask' },
    { id: 2, title: 'Low Reliability Alert', message: 'Artifacts detected in Sample ISO-VRBA-005.', time: '1 hour ago', type: 'warning', iconName: 'scale' },
    { id: 3, title: 'Engine Update', message: 'ColonyAI Engine updated to v2.1.5.', time: '5 hours ago', type: 'info', iconName: 'chart' },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      const newNotif = {
        id: Date.now(),
        title: 'LIMS Sync',
        message: 'Database synchronized successfully.',
        time: 'Just now',
        type: 'info',
        iconName: 'history'
      }
      setNotifications(prev => [newNotif, ...prev.slice(0, 9)])
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const renderNotifIcon = (name: string, type: string) => {
    const iconClass = `h-4 w-4 ${type === 'warning' ? 'text-amber-600' : type === 'success' ? 'text-emerald-600' : 'text-blue-600'}`
    switch(name) {
      case 'flask': return <FlaskConical className={iconClass} />
      case 'scale': return <Scale className={iconClass} />
      case 'chart': return <BarChart3 className={iconClass} />
      case 'history': return <History className={iconClass} />
      default: return <Bell className={iconClass} />
    }
  }

  const pathname = usePathname()
  const router = useRouter()
  const auth = useAuthStore()

  const handleLogout = async () => {
    await auth.logout()
    router.push('/login')
  }

  const user = auth.user
  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <AuthGuard>
    <div className="min-h-screen bg-slate-50/50 flex font-sans selection:bg-blue-500 selection:text-white">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-150" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - Laboratory Node Controller */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between px-6 py-6">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform">
                <FlaskConical className="h-5.5 w-5.5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-white tracking-tight uppercase leading-none">ColonyAI</span>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">Laboratory OS</span>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-zinc-400 hover:text-white p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Matrix */}
          <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
            <p className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.25em] mb-4">Core Operational Modules</p>
            {navigation
              .filter(item => item.roles.includes(user?.role || 'analyst'))
              .map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/10'
                        : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'group-hover:text-blue-500'}`} />
                    <span className="tracking-tight">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto flex gap-1">
                         <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                         <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    )}
                  </Link>
                )
            })}
          </nav>

          {/* Security Status & Logout */}
          <div className="p-4 border-t border-zinc-900/80 bg-zinc-950/50">
            <div className="mb-4 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
               <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Node Secure</span>
               </div>
               <p className="text-[9px] text-zinc-500 leading-tight">ISO-17025 Compliance Active // Encryption Level High</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-bold text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              Terminate Session
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Arena */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {/* Glassmorphism Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200/60 shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 transition-colors">
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden sm:flex items-center gap-3 bg-slate-100/50 rounded-2xl px-5 py-2.5 border border-slate-200/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500/50 transition-all">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Scan laboratory database..."
                  className="bg-transparent border-0 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:ring-0 w-64"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Date Metadata */}
              <div className="hidden md:flex flex-col items-end mr-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Operational Cycle</p>
                <p className="text-xs font-black text-slate-900 mt-1">{dateStr}</p>
              </div>

              {/* Interaction Cluster */}
              <div className="flex items-center gap-2 p-1 bg-slate-100/50 rounded-2xl border border-slate-200/50">
                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-2.5 rounded-xl transition-all duration-200 ${showNotifications ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`}
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
                  </button>

                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                      <div className="absolute right-0 mt-3 w-85 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-200 z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                          <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Priority Alerts</h3>
                          <span className="text-[10px] font-black text-blue-600 bg-blue-100/50 px-2.5 py-1 rounded-full uppercase">{notifications.length} Unread</span>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto bg-white p-2">
                          <div className="space-y-1">
                            {notifications.map((n) => (
                              <div key={n.id} className={`flex gap-3 items-start p-3 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group border-l-3 ${n.type === 'warning' ? 'border-l-amber-500 bg-amber-50/30' : 'border-l-transparent'}`}>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${n.type === 'warning' ? 'bg-amber-100' : n.type === 'success' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                                  {renderNotifIcon(n.iconName, n.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{n.title}</p>
                                  <p className="text-[11px] text-slate-500 mt-1 leading-tight">{n.message}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                     <Clock className="w-3 h-3 text-slate-300" />
                                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{n.time}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
                          <button className="text-[11px] font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-colors">Audit All Archive</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Profile Pivot */}
                <div className="flex items-center gap-3 pl-3 pr-2 border-l border-slate-200/50">
                  <div className="hidden lg:block text-right">
                    <p className="text-xs font-black text-slate-900 leading-none">{user?.full_name || 'Chief Analyst'}</p>
                    <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-1">Authorized Access</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-slate-900/20 group cursor-pointer hover:bg-blue-600 transition-colors">
                    {user && user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'CA'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
      <SmartAssistant />
    </div>
    </AuthGuard>
  )
}
