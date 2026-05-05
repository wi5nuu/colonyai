"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

export function ConditionalNavbar() {
  const pathname = usePathname();
  const isAuthPage = 
    pathname === "/login" || 
    pathname?.startsWith("/reset-password") || 
    pathname?.startsWith("/troubleshoot");
  const isDashboard = pathname?.startsWith("/dashboard");
  
  if (isDashboard || isAuthPage) return null;
  
  return <Navbar />;
}
