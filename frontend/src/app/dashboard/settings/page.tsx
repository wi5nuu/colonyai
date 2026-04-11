'use client'

import { useState } from 'react'
import { User, Bell, Shield, Database, Palette } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'laboratory', name: 'Laboratory', icon: Database },
    { id: 'appearance', name: 'Appearance', icon: Palette },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="card">
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'laboratory' && <LaboratorySettings />}
            {activeTab === 'appearance' && <AppearanceSettings />}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileSettings() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Settings</h2>
      <form className="space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input type="text" className="input" defaultValue="Wisnu Alfian Nur Ashar" />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" defaultValue="wisnu.ashar@student.president.ac.id" />
        </div>
        <div>
          <label className="label">Role</label>
          <input type="text" className="input" defaultValue="Analyst" disabled />
        </div>
        <div className="pt-4">
          <button type="submit" className="btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  )
}

function NotificationSettings() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Analysis Complete</p>
            <p className="text-sm text-gray-500">Notify when analysis is finished</p>
          </div>
          <input type="checkbox" defaultChecked className="h-5 w-5 text-primary-600" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">TNTC/TFTC Alerts</p>
            <p className="text-sm text-gray-500">Alert when results are out of range</p>
          </div>
          <input type="checkbox" defaultChecked className="h-5 w-5 text-primary-600" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Weekly Summary</p>
            <p className="text-sm text-gray-500">Receive weekly analytics summary</p>
          </div>
          <input type="checkbox" className="h-5 w-5 text-primary-600" />
        </div>
      </div>
    </div>
  )
}

function SecuritySettings() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Settings</h2>
      <form className="space-y-4">
        <div>
          <label className="label">Current Password</label>
          <input type="password" className="input" />
        </div>
        <div>
          <label className="label">New Password</label>
          <input type="password" className="input" />
        </div>
        <div>
          <label className="label">Confirm Password</label>
          <input type="password" className="input" />
        </div>
        <div className="pt-4">
          <button type="submit" className="btn-primary">Update Password</button>
        </div>
      </form>
    </div>
  )
}

function LaboratorySettings() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Laboratory Configuration</h2>
      <form className="space-y-4">
        <div>
          <label className="label">Laboratory Name</label>
          <input type="text" className="input" defaultValue="President University Microbiology Lab" />
        </div>
        <div>
          <label className="label">Default Media Type</label>
          <select className="input">
            <option>Plate Count Agar (PCA)</option>
            <option>VRBA</option>
            <option>TSA</option>
            <option>R2A</option>
          </select>
        </div>
        <div>
          <label className="label">Default Plated Volume (ml)</label>
          <input type="number" className="input" defaultValue="1.0" step="0.1" />
        </div>
        <div className="pt-4">
          <button type="submit" className="btn-primary">Save Settings</button>
        </div>
      </form>
    </div>
  )
}

function AppearanceSettings() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Appearance Settings</h2>
      <div className="space-y-4">
        <div>
          <label className="label">Theme</label>
          <select className="input">
            <option>Light</option>
            <option>Dark</option>
            <option>System</option>
          </select>
        </div>
        <div>
          <label className="label">Language</label>
          <select className="input">
            <option>English</option>
            <option>Bahasa Indonesia</option>
          </select>
        </div>
      </div>
    </div>
  )
}
