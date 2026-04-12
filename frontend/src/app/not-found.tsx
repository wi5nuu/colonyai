'use client'

import Link from 'next/link'
import { FlaskConical, ArrowLeft, Search } from 'lucide-react'
import { useState } from 'react'

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState('')

  const quickLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: FlaskConical },
    { label: 'New Analysis', href: '/dashboard/upload', icon: Search },
    { label: 'History', href: '/dashboard/history', icon: Search },
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-lg mx-auto text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/40 select-none">
            404
          </div>
          <div className="absolute inset-0 text-8xl sm:text-9xl font-black text-primary/10 blur-2xl select-none">
            404
          </div>
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <FlaskConical className="h-8 w-8 text-primary" />
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-foreground mb-3">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Search */}
        <div className="relative max-w-sm mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-border rounded-xl pl-10 pr-4 py-3 bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {quickLinks.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <link.icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Back Button */}
        <Link
          href="/dashboard"
          className="btn-primary inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
