'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/recovery',
  '/terms',
  '/privacy',
  '/',
  '/troubleshoot',
  '/troubleshoot/verify',
  '/challenge',
  '/tujuan-manfaat',
  '/target-pengguna',
  '/teknologi',
  '/compliance',
  '/layanan',
];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, refreshAccessToken } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      const state = useAuthStore.getState();
      if (!state.isAuthenticated && state.refreshToken) {
        try {
          await refreshAccessToken();
        } catch (e) {
          console.error('Initial AuthGuard refresh failed:', e);
        }
      }
    };

    init();
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !PUBLIC_PATHS.includes(pathname)) {
      router.push('/login');
      return;
    }

    if (!isLoading && isAuthenticated && PUBLIC_PATHS.includes(pathname)) {
      router.push('/dashboard');
      return;
    }

    // ── Role-Based Path Protection ──
    if (!isLoading && isAuthenticated && pathname.startsWith('/dashboard')) {
      const role = useAuthStore.getState().user?.role;
      
      const rolePermissions: Record<string, string[]> = {
        '/dashboard/super': ['super_admin'],
        '/dashboard/network': ['super_admin'],
        '/dashboard/administration': ['admin', 'super_admin'],
        '/dashboard/upload': ['analyst', 'admin', 'super_admin'],
        '/dashboard/simulator': ['analyst', 'admin', 'super_admin'],
        '/dashboard/analytics': ['manager', 'admin', 'super_admin'],
        '/dashboard/reports': ['manager', 'auditor', 'admin', 'super_admin'],
        '/dashboard/audit': ['manager', 'auditor', 'admin', 'super_admin'],
      };

      // Check if current path requires specific roles
      for (const [path, allowedRoles] of Object.entries(rolePermissions)) {
        if (pathname.startsWith(path) && role && !allowedRoles.includes(role)) {
          console.warn(`Access denied to ${pathname} for role ${role}`);
          router.push('/dashboard'); // Redirect to safe zone
          break;
        }
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ColonyAI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !PUBLIC_PATHS.includes(pathname)) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
