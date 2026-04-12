'use client'

import { useState, useEffect } from 'react'
import { User, Bell, Shield, Database, Palette, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { authApi } from '@/lib/auth-api'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', name: 'Analyst Profile', icon: User },
    { id: 'notifications', name: 'Signal Prefs', icon: Bell },
    { id: 'security', name: 'Encryption / Auth', icon: Shield },
    { id: 'laboratory', name: 'Node Config', icon: Database },
    { id: 'appearance', name: 'Matrix Theme', icon: Palette },
  ]

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Matrix */}
        <div className="lg:col-span-1">
          <nav className="space-y-1.5 sticky top-24">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-4 mb-4">Core Control Matrix</p>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-5 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 group ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 translate-x-1'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                }`}
              >
                <tab.icon className={`h-4 w-4 mr-4 transition-transform ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Configuration Terminal Content */}
        <div className="lg:col-span-3">
          <div className="card p-0 overflow-hidden border-border/40 backdrop-blur-3xl">
             <div className="px-8 py-6 border-b border-border/20 bg-muted/10">
                <div className="flex items-center gap-3">
                   <div className="p-2.5 bg-primary/20 rounded-xl text-primary">
                      {(() => {
                        const tab = tabs.find(t => t.id === activeTab);
                        const Icon = tab?.icon || User;
                        return <Icon className="h-5 w-5" />;
                      })()}
                   </div>
                   <div>
                      <h2 className="text-sm font-black text-foreground uppercase tracking-[0.25em]">{tabs.find(t => t.id === activeTab)?.name} Control</h2>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1.5">Sector Authorization Phase 04</p>
                   </div>
                </div>
             </div>
             <div className="p-10">
                {activeTab === 'profile' && <ProfileSettings />}
                {activeTab === 'notifications' && <NotificationSettings />}
                {activeTab === 'security' && <SecuritySettings />}
                {activeTab === 'laboratory' && <LaboratorySettings />}
                {activeTab === 'appearance' && <AppearanceSettings />}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileSettings() {
  const { user } = useAuthStore()
  const [fullName, setFullName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setFullName(user.full_name)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      toast.error('Identity identifier cannot be empty')
      return
    }
    setIsSaving(true)
    try {
      await authApi.updateProfile({ full_name: fullName.trim() })
      toast.success('Core profile synchronized')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Handshake failed')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Full Legal Alias</label>
            <input
              type="text"
              className="input h-14 bg-muted/20 border-border/40 hover:border-primary/30 transition-all font-black uppercase tracking-widest text-xs"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-3 opacity-60">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Email Identity (Network Lock)</label>
            <input type="email" className="input h-14 bg-muted border-border/20 font-mono text-sm" value={user?.email || ''} disabled />
          </div>
          <div className="space-y-3 opacity-60">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Auth Role Level</label>
            <input type="text" className="input h-14 bg-muted border-border/20 font-black uppercase tracking-widest text-[10px]" value={user?.role || ''} disabled />
          </div>
        </div>
        <div className="pt-6 border-t border-border/10">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary h-14 px-10 flex items-center shadow-lg shadow-primary/20 active:scale-95 disabled:scale-100"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                Synchronizing...
              </>
            ) : (
              'Save Profile Entry'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

function NotificationSettings() {
  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {[
        { title: 'Analysis Protocol Completion', desc: 'Signal interrupt when bio-analysis reaches 100%', checked: true },
        { title: 'ISO Boundary Boundary Alerts', desc: 'Critical alerts when specimens exceed range (TNTC/TFTC)', checked: true },
        { title: 'Archival Ledger Summary', desc: 'Transmit weekly diagnostic summary to secure channel', checked: false }
      ].map((item, idx) => (
        <div key={idx} className="flex items-center justify-between p-6 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-300 group">
          <div className="pr-4">
            <p className="text-xs font-black text-foreground uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">{item.title}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{item.desc}</p>
          </div>
          <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-muted group-hover:bg-muted-foreground/20">
             <input type="checkbox" defaultChecked={item.checked} className="peer absolute h-full w-full opacity-0 z-10 cursor-pointer" />
             <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out peer-checked:translate-x-5 peer-checked:bg-primary" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SecuritySettings() {
  return (
    <div className="animate-in fade-in duration-500">
      <form className="space-y-8 max-w-xl">
        <div className="space-y-6">
          <div className="space-y-3">
             <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Current Protocol Key</label>
             <input type="password" placeholder="••••••••••••" className="input h-14 bg-muted/20 border-border/40 hover:border-primary/30 transition-all font-mono" />
          </div>
          <div className="space-y-3">
             <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Master Re-Key</label>
             <input type="password" placeholder="••••••••••••" className="input h-14 bg-muted/20 border-border/40 hover:border-primary/30 transition-all font-mono" />
          </div>
          <div className="space-y-3">
             <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Validate Re-Key</label>
             <input type="password" placeholder="••••••••••••" className="input h-14 bg-muted/20 border-border/40 hover:border-primary/30 transition-all font-mono" />
          </div>
        </div>
        <div className="pt-6 border-t border-border/10">
          <button type="submit" className="btn-primary h-14 px-10 shadow-lg shadow-primary/20 active:scale-95">Update Encryption Access</button>
        </div>
      </form>
    </div>
  )
}

function LaboratorySettings() {
  return (
    <div className="animate-in fade-in duration-500">
      <form className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Assigned Laboratory Node</label>
              <input type="text" className="input h-14 bg-muted/20 border-border/40 font-black uppercase tracking-widest text-xs" defaultValue="ColonyAI Central Hub - 2026" />
           </div>
           <div className="space-y-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Global Default Media</label>
              <select className="input h-14 bg-muted/20 border-border/40 text-xs font-black uppercase tracking-widest">
                <option>Plate Count Agar (PCA)</option>
                <option>VRBA Selective</option>
                <option>TSA General</option>
                <option>R2A Diagnostic</option>
              </select>
           </div>
           <div className="space-y-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Nominal Volume (mL)</label>
              <input type="number" className="input h-14 bg-muted/20 border-border/40 font-mono text-sm" defaultValue="1.0" step="0.1" />
           </div>
        </div>
        <div className="pt-6 border-t border-border/10">
          <button type="submit" className="btn-primary h-14 px-10 shadow-lg shadow-primary/20 active:scale-95">Synchronize Node Configuration</button>
        </div>
      </form>
    </div>
  )
}

function AppearanceSettings() {
  return (
    <div className="animate-in fade-in duration-500">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
             <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Neural Matrix Theme</label>
             <select className="input h-14 bg-muted/20 border-border/40 text-xs font-black uppercase tracking-widest">
                <option>Clinical Light</option>
                <option>Deep Neural Dark</option>
                <option>System Default Sync</option>
             </select>
          </div>
          <div className="space-y-3">
             <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Linguistic Matrix</label>
             <select className="input h-14 bg-muted/20 border-border/40 text-xs font-black uppercase tracking-widest">
                <option>English (Global Standard)</option>
                <option>Bahasa Indonesia</option>
              </select>
          </div>
       </div>
    </div>
  )
}
