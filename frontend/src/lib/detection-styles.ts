/**
 * ColonyAI — Detection Class Visual Styles
 *
 * Mengimplementasikan BUG-037: Color Blind Accessibility
 *
 * Setiap kelas menggunakan kombinasi WARNA + POLA BORDER + LABEL TEKS
 * sehingga dapat dibedakan oleh pengguna dengan:
 *   - Deuteranopia (merah-hijau, 6% pria)
 *   - Protanopia   (merah-hijau, 2% pria)
 *   - Tritanopia   (biru-kuning, jarang)
 *
 * Referensi: WCAG 2.1 SC 1.4.1 (Use of Color), WCAG SC 1.4.3 (Contrast)
 *
 * Keputusan teknis: BUG-037 — ColonyAI Technical Decisions v1.0.0
 */

import type { DetectionClass } from './types';

// ── Tipe ──────────────────────────────────────────────────────────────────

export interface ClassVisualStyle {
  /** Warna hex untuk bounding box border dan label background */
  color: string;
  /** Warna hex untuk label teks (kontras tinggi dengan color) */
  textColor: string;
  /** Border style CSS — berbeda per kelas untuk color-blind accessibility */
  borderStyle: 'solid' | 'dashed' | 'dotted';
  /** Border width dalam pixel */
  borderWidth: 2 | 3;
  /** Prefix simbol dalam label (shape berbeda per kelas) */
  labelPrefix: string;
  /** Label teks lengkap dalam Bahasa Indonesia */
  labelId: string;
  /** Label teks dalam Bahasa Inggris (untuk export/debug) */
  labelEn: string;
  /** Apakah kelas ini dihitung dalam CFU/mL */
  countsTowardCFU: boolean;
  /** Deskripsi accessibility untuk screen reader */
  ariaLabel: string;
  /** Warna dalam format [R,G,B] untuk OpenCV annotation (BGR dibalik) */
  opencvBGR: [number, number, number];
}

// ── Visual Styles ─────────────────────────────────────────────────────────

/**
 * Mapping dari nama kelas ke style visual.
 *
 * Desain prinsip:
 *   1. Warna berbeda cukup — dipilih dari palet yang accessible untuk color blindness
 *   2. Border style berbeda — tidak hanya mengandalkan warna
 *   3. Shape prefix berbeda — simbol unicode unik per kelas
 *   4. Label selalu tampil — tidak hanya warna
 */
export const CLASS_VISUAL_STYLES: Record<DetectionClass, ClassVisualStyle> = {
  colony_single: {
    color: '#22c55e',          // Hijau — kontras baik untuk daltonism
    textColor: '#ffffff',
    borderStyle: 'solid',
    borderWidth: 2,
    labelPrefix: '●',          // Filled circle
    labelId: 'Koloni Tunggal',
    labelEn: 'Single Colony',
    countsTowardCFU: true,
    ariaLabel: 'Koloni tunggal — dihitung sebagai 1 CFU',
    opencvBGR: [34, 197, 94],  // (R=34, G=197, B=94) → OpenCV BGR
  },

  colony_merged: {
    color: '#eab308',          // Kuning — berbeda dari hijau, jelas di simulasi protanopia
    textColor: '#1a1a00',      // Teks gelap untuk kontras pada latar kuning
    borderStyle: 'dashed',
    borderWidth: 2,
    labelPrefix: '◆',          // Filled diamond
    labelId: 'Koloni Bergabung',
    labelEn: 'Merged Colony',
    countsTowardCFU: true,
    ariaLabel: 'Koloni bergabung — diestimasi dengan metode area bounding box (SA-001)',
    opencvBGR: [8, 179, 234],  // Orange-ish dalam BGR
  },

  bubble: {
    color: '#ef4444',          // Merah terang
    textColor: '#ffffff',
    borderStyle: 'dotted',
    borderWidth: 2,
    labelPrefix: '○',          // Empty circle (contrast dengan filled ● colony_single)
    labelId: 'Gelembung',
    labelEn: 'Bubble (Artifact)',
    countsTowardCFU: false,
    ariaLabel: 'Gelembung — artefak, tidak dihitung dalam CFU',
    opencvBGR: [68, 68, 239],  // BGR merah
  },

  dust_debris: {
    color: '#f97316',          // Oranye
    textColor: '#ffffff',
    borderStyle: 'dashed',
    borderWidth: 3,            // Lebih tebal untuk membedakan dari colony_merged (dashed w:2)
    labelPrefix: '□',          // Empty square
    labelId: 'Debu/Kotoran',
    labelEn: 'Dust/Debris (Artifact)',
    countsTowardCFU: false,
    ariaLabel: 'Debu atau kotoran — artefak, tidak dihitung dalam CFU',
    opencvBGR: [22, 115, 249], // BGR oranye
  },

  media_crack: {
    color: '#a855f7',          // Ungu
    textColor: '#ffffff',
    borderStyle: 'solid',
    borderWidth: 2,
    labelPrefix: '╌',          // Horizontal dashes (berbeda dari shape lain)
    labelId: 'Retakan Media',
    labelEn: 'Media Crack (Artifact)',
    countsTowardCFU: false,
    ariaLabel: 'Retakan media agar — artefak, tidak dihitung dalam CFU',
    opencvBGR: [247, 85, 168], // BGR ungu
  },
};

// ── Helper Functions ──────────────────────────────────────────────────────

/** Dapatkan style visual untuk satu kelas deteksi. */
export function getClassStyle(className: DetectionClass): ClassVisualStyle {
  return CLASS_VISUAL_STYLES[className] ?? CLASS_VISUAL_STYLES.dust_debris;
}

/**
 * Format label lengkap untuk tooltip (digunakan di UI overlay).
 *
 * Contoh output: "● Koloni Tunggal — 87%"
 */
export function formatDetectionLabel(
  className: DetectionClass,
  confidence: number,
): string {
  const style = getClassStyle(className);
  const pct = Math.round(confidence * 100);
  return `${style.labelPrefix} ${style.labelId} — ${pct}%`;
}

/**
 * Return CSS string untuk bounding box border.
 *
 * Contoh: "2px solid #22c55e"
 */
export function getBorderCSS(className: DetectionClass): string {
  const s = getClassStyle(className);
  return `${s.borderWidth}px ${s.borderStyle} ${s.color}`;
}

/** Daftar semua kelas yang dihitung dalam CFU (untuk legenda UI) */
export const CFU_CONTRIBUTING_CLASSES: DetectionClass[] = [
  'colony_single',
  'colony_merged',
];

/** Daftar semua kelas artefak (untuk legenda UI) */
export const ARTIFACT_CLASSES: DetectionClass[] = [
  'bubble',
  'dust_debris',
  'media_crack',
];

/** Semua 5 kelas dalam urutan display */
export const ALL_DETECTION_CLASSES: DetectionClass[] = [
  ...CFU_CONTRIBUTING_CLASSES,
  ...ARTIFACT_CLASSES,
];

// ── TNTC/TFTC Constants (sesuai ISO 4833-1:2013) ─────────────────────────

/** Batas minimum koloni untuk hasil VALID (inklusif) */
export const TFTC_THRESHOLD = 25;

/** Batas maksimum koloni untuk hasil VALID (inklusif) */
export const TNTC_THRESHOLD = 250;

/** Status CFU/mL yang mungkin */
export type CFUStatus = 'VALID' | 'TNTC' | 'TFTC';

/**
 * Teks pesan untuk setiap status CFU.
 * BUG-003: TNTC tidak menampilkan nilai absolut CFU/mL.
 */
export const CFU_STATUS_MESSAGES: Record<CFUStatus, string> = {
  VALID: 'Hasil valid — dalam rentang penghitungan (25–250 koloni)',
  TNTC:  'Terlalu Banyak untuk Dihitung (TNTC) — lakukan pengenceran lebih lanjut',
  TFTC:  'Terlalu Sedikit untuk Dihitung (TFTC) — kurangi faktor pengenceran',
};

export const CFU_STATUS_COLORS: Record<CFUStatus, string> = {
  VALID: '#22c55e',  // Hijau
  TNTC:  '#ef4444',  // Merah
  TFTC:  '#f97316',  // Oranye
};
