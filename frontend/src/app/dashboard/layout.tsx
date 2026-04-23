'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Upload, History, FileText, Settings, LogOut, Menu, X,
  FlaskConical, Bell, Scale, BarChart3, Search, Calendar, ShieldCheck, Activity,
  Lock, Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { AuthGuard } from '@/lib/auth-guard'
import { useAuthStore } from '@/lib/auth-store'
import { SmartAssistant } from '@/components/smart-assistant'

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['analyst', 'viewer', 'system_admin', 'senior_analyst', 'lab_manager', 'quality_officer'] },
  { name: 'New Analysis', href: '/dashboard/upload', icon: Upload, roles: ['analyst', 'system_admin', 'senior_analyst'] },
  { name: 'History', href: '/dashboard/history', icon: History, roles: ['analyst', 'viewer', 'system_admin', 'senior_analyst', 'lab_manager', 'quality_officer'] },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, roles: ['viewer', 'system_admin', 'lab_manager', 'quality_officer'] },
  { name: 'Simulator', href: '/dashboard/simulator', icon: Scale, roles: ['analyst', 'system_admin', 'senior_analyst'] },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText, roles: ['viewer', 'system_admin', 'lab_manager', 'quality_officer'] },
  { name: 'Audit Ledger', href: '/dashboard/audit', icon: ShieldCheck, roles: ['viewer', 'system_admin', 'quality_officer'] },
  { name: 'Administration', href: '/dashboard/administration', icon: Lock, roles: ['system_admin'] },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['analyst', 'viewer', 'system_admin', 'senior_analyst', 'lab_manager', 'quality_officer'] },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Analysis Complete', message: 'Specimen ISO-PCA-B2026 is ready.', time: '2 mins ago', read: false, type: 'success' },
    { id: 2, title: 'System Alert', message: 'Calibration cycle due in 5 days.', time: '1 hour ago', read: false, type: 'alert' },
    { id: 3, title: 'New Node Authorized', message: 'Analyst Sarah Chen provisioned.', time: '5 hours ago', read: true, type: 'success' },
  ])
  const pathname = usePathname()
  const router = useRouter()
  const auth = useAuthStore()

  const handleLogout = async () => {
    await auth.logout()
    router.push('/login')
  }

  const user = auth.user

  return (
    <AuthGuard>
    <div className="h-screen bg-[#f4f7f6] flex font-sans selection:bg-primary/20 selection:text-primary overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-150" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - Purple Design */}
      <aside className={`fixed inset-y-0 left-0 z-50 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64 bg-primary transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} rounded-xl lg:rounded-none lg:mr-0`}>
        <div className="flex flex-col h-full text-white">
          <div className={`flex flex-col items-center justify-center pt-8 pb-6 px-6 transition-all duration-300 ${isCollapsed ? 'px-2' : ''}`}>
            <div className={`rounded-xl bg-white/20 flex items-center justify-center mb-3 transition-all ${isCollapsed ? 'w-10 h-10' : 'w-12 h-12'}`}>
              <FlaskConical className={`text-white transition-all ${isCollapsed ? 'h-5 w-5' : 'h-6 w-6'}`} />
            </div>
            {!isCollapsed && <span className="text-lg font-bold tracking-tight animate-in fade-in duration-300">ColonyAI</span>}
          </div>

          {/* Navigation */}
          <nav className={`flex-1 space-y-2 overflow-y-auto scrollbar-hide transition-all duration-300 ${isCollapsed ? 'px-0' : 'px-0'}`}>
            {navigation
              .filter(item => item.roles.includes(user?.role || 'analyst'))
              .map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 py-2.5 transition-all ${
                      isActive 
                        ? (isCollapsed ? 'bg-white text-primary rounded-xl mx-3 justify-center' : 'bg-white text-primary rounded-l-xl ml-3 pl-4') 
                        : (isCollapsed ? 'text-white/70 hover:text-white hover:bg-white/10 mx-3 rounded-xl justify-center' : 'text-white/70 hover:text-white hover:bg-white/10 mx-3 rounded-xl px-4')
                    }`}
                    title={isCollapsed ? item.name : ''}
                  >
                    <item.icon className={`transition-all ${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'}`} />
                    {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">{item.name}</span>}
                  </Link>
                )
            })}
          </nav>

          {/* Sidebar Bottom Section */}
          <div className={`py-6 mt-auto transition-all duration-300 ${isCollapsed ? 'px-0' : 'px-6'}`}>
            {!isCollapsed && (
              <div className="bg-white/10 rounded-xl p-4 relative overflow-hidden group border border-white/5 animate-in fade-in zoom-in duration-300">
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-white/90 mb-2 uppercase tracking-widest">Next Calibration Cycle</p>
                  <div className="flex gap-2">
                    {[
                      { val: '05', label: 'Days' },
                      { val: '02', label: 'hours' },
                      { val: '15', label: 'mins' }
                    ].map((t, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="bg-white text-primary font-bold rounded-lg w-8 h-8 flex items-center justify-center text-xs shadow-sm">
                          {t.val}
                        </div>
                        <span className="text-[8px] text-white/60 mt-1">{t.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-4 opacity-20 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                  <Activity className="w-20 h-20 text-white" />
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 py-2.5 mt-4 transition-all text-white/70 hover:text-white hover:bg-white/10 rounded-xl ${isCollapsed ? 'justify-center mx-3' : 'px-4'}`}
              title={isCollapsed ? 'Logout' : ''}
            >
              <LogOut className={`${isCollapsed ? 'h-6 w-6' : 'h-4 w-4'}`} />
              {!isCollapsed && <span className="text-xs">Logout</span>}
            </button>

            {/* Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`hidden lg:flex items-center justify-center mt-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-white/60 hover:text-white ${isCollapsed ? 'mx-3' : ''}`}
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-[#f4f7f6]/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => {
                if (window.innerWidth >= 1024) setIsCollapsed(!isCollapsed)
                else setSidebarOpen(true)
              }} 
              className="p-2 text-slate-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden lg:flex items-center gap-6 ml-4">
               <button className="flex items-center gap-2 text-[11px] font-bold text-slate-500 hover:text-primary transition-colors">
                  <Activity className="w-3.5 h-3.5" /> Ask AI
               </button>
               <button className="flex items-center gap-2 text-[11px] font-bold text-slate-500 hover:text-primary transition-colors">
                  <Clock className="w-3.5 h-3.5" /> Support
               </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg bg-white shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50 transition-all outline-none"
              >
                <Bell className="h-4 w-4 text-slate-600" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Neural Notifications</h3>
                    <button 
                      onClick={() => {
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
                        toast.success('All notifications cleared')
                      }}
                      className="text-[9px] font-black text-primary uppercase tracking-tighter hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n.id} className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer relative ${!n.read ? 'bg-primary/5' : ''}`}>
                          {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                          <div className="flex gap-3">
                            <div className={`p-1.5 rounded-md ${n.type === 'alert' ? 'bg-rose-100 text-rose-500' : 'bg-emerald-100 text-emerald-500'}`}>
                              {n.type === 'alert' ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-[11px] font-black text-slate-900 leading-tight">{n.title}</p>
                              <p className="text-[10px] text-slate-400 font-medium mt-1 leading-snug">{n.message}</p>
                              <p className="text-[9px] text-slate-300 font-bold mt-1 uppercase tracking-tighter">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="w-8 h-8 text-slate-100 mx-auto mb-2" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No new signals</p>
                      </div>
                    )}
                  </div>
                  <button className="w-full py-2 bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 transition-colors border-t border-slate-100">
                    View System Log History
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
               <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-sm">
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                     {user?.full_name?.[0] || 'A'}
                  </div>
               </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="min-h-full flex flex-col px-8 py-8">
            <div className="flex-1">
              {children}
            </div>

            {/* Global Dashboard Footer */}
            <footer className="mt-16 pt-8 pb-12 border-t border-slate-200">
               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                     {[
                       'Support', 'System status', 'Careers', 'Terms of Use', 
                       'Report Security Issues', 'Privacy Policy'
                     ].map((link, i) => (
                       <a key={i} href="#" className="text-[11px] text-slate-400 hover:text-primary transition-colors font-semibold tracking-tight uppercase">
                          {link}
                       </a>
                     ))}
                  </div>

                  <div className="flex items-center gap-6">
                     <div className="flex items-center gap-2 py-1.5 px-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                        <div className="flex">
                           <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white -mr-1" />
                           <div className="w-2.5 h-2.5 rounded-full bg-white border border-blue-500" />
                        </div>
                        <span className="text-[10px] text-slate-600 font-bold">Cookie Preferences</span>
                     </div>
                     <p className="text-[11px] text-slate-400 font-semibold tracking-tight uppercase">
                        © 2026 ColonyAI, Inc.
                     </p>
                  </div>
               </div>
            </footer>
          </div>
        </main>
      </div>
      <SmartAssistant />
    </div>
    </AuthGuard>
  )
}
