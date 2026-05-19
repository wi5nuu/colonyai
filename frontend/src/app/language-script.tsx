'use client'

import { useEffect } from 'react'
import { useTranslationStore } from '@/lib/i18n/store'

/**
 * Client component that synchronizes the <html lang> attribute
 * with the current language selection.
 *
 * Changing <html lang> causes:
 * - Browser context menus to switch language
 * - Spell-check dictionary to change
 * - Chrome auto-translate to detect the correct language
 * - Screen readers to use the right pronunciation
 */
export function LanguageSync() {
  // Subscribe to language so this re-renders on change
  const language = useTranslationStore((state) => state.language)

  useEffect(() => {
    // Apply lang to <html> root element
    const newLang = language === 'id' ? 'id' : 'en'
    document.documentElement.lang = newLang

    // Also update dir if needed (for future RTL support)
    document.documentElement.dir = 'ltr'

    // Store in localStorage as a cookie-free signal for any SSR edge cases
    try {
      localStorage.setItem('colonyai-html-lang', newLang)
    } catch {
      // ignore storage errors
    }

    // Force Chrome to re-evaluate auto-translate by dispatching a langchange event
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: newLang } }))
  }, [language])

  // Also apply on mount and trigger manual rehydration to prevent Next.js SSR hydration mismatch
  useEffect(() => {
    useTranslationStore.persist.rehydrate();
    const savedLang = typeof window !== 'undefined' ? localStorage.getItem('colonyai-html-lang') : null;
    if (savedLang) {
      document.documentElement.lang = savedLang === 'id' ? 'id' : 'en';
    }
  }, []);

  return null
}
