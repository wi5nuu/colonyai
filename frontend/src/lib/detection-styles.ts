/**
 * ColonyAI — Detection Class Visual Styles
 *
 * Implements BUG-037: Color Blind Accessibility
 *
 * Each class uses a combination of COLOR + BORDER PATTERN + TEXT LABEL
 * so it can be distinguished by users with:
 *   - Deuteranopia (red-green, 6% of males)
 *   - Protanopia   (red-green, 2% of males)
 *   - Tritanopia   (blue-yellow, rare)
 *
 * Reference: WCAG 2.1 SC 1.4.1 (Use of Color), WCAG SC 1.4.3 (Contrast)
 *
 * Technical decision: BUG-037 — ColonyAI Technical Decisions v1.0.0
 */

import type { DetectionClass } from './types';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ClassVisualStyle {
  /** Hex color for bounding box border and label background */
  color: string;
  /** Hex color for label text (high contrast with color) */
  textColor: string;
  /** CSS border style — different per class for color-blind accessibility */
  borderStyle: 'solid' | 'dashed' | 'dotted';
  /** Border width in pixels */
  borderWidth: 2 | 3;
  /** Symbol prefix in label (different shape per class) */
  labelPrefix: string;
  /** Full English label text */
  labelEn: string;
  /** Whether this class is counted in CFU/mL */
  countsTowardCFU: boolean;
  /** Accessibility description for screen reader */
  ariaLabel: string;
  /** Color in [R,G,B] format for OpenCV annotation (BGR reversed) */
  opencvBGR: [number, number, number];
}

// ── Visual Styles ─────────────────────────────────────────────────────────

/**
 * Mapping from detection class name to visual style.
 *
 * Design principles:
 *   1. Colors are sufficiently distinct — picked from color-blind accessible palette
 *   2. Border styles differ — not relying solely on color
 *   3. Shape prefixes differ — unique unicode symbol per class
 *   4. Labels always visible — not just color
 */
export const CLASS_VISUAL_STYLES: Record<DetectionClass, ClassVisualStyle> = {
  colony_single: {
    color: '#22c55e',          // Green — good contrast for color blindness
    textColor: '#ffffff',
    borderStyle: 'solid',
    borderWidth: 2,
    labelPrefix: '●',          // Filled circle
    labelEn: 'Single Colony',
    countsTowardCFU: true,
    ariaLabel: 'Single colony — counted as 1 CFU',
    opencvBGR: [34, 197, 94],  // (R=34, G=197, B=94) → OpenCV BGR
  },

  colony_merged: {
    color: '#eab308',          // Yellow — distinct from green, clear in protanopia simulation
    textColor: '#1a1a00',      // Dark text for contrast on yellow background
    borderStyle: 'dashed',
    borderWidth: 2,
    labelPrefix: '◆',          // Filled diamond
    labelEn: 'Merged Colony',
    countsTowardCFU: true,
    ariaLabel: 'Merged colony — estimated via bounding box area method (SA-001)',
    opencvBGR: [8, 179, 234],  // Orange-ish in BGR
  },

  bubble: {
    color: '#ef4444',          // Bright red
    textColor: '#ffffff',
    borderStyle: 'dotted',
    borderWidth: 2,
    labelPrefix: '○',          // Empty circle (contrast with filled ● colony_single)
    labelEn: 'Bubble (Artifact)',
    countsTowardCFU: false,
    ariaLabel: 'Bubble — artifact, not counted in CFU',
    opencvBGR: [68, 68, 239],  // BGR red
  },

  dust_debris: {
    color: '#f97316',          // Orange
    textColor: '#ffffff',
    borderStyle: 'dashed',
    borderWidth: 3,            // Thicker to distinguish from colony_merged (dashed w:2)
    labelPrefix: '□',          // Empty square
    labelEn: 'Dust/Debris (Artifact)',
    countsTowardCFU: false,
    ariaLabel: 'Dust or debris — artifact, not counted in CFU',
    opencvBGR: [22, 115, 249], // BGR orange
  },

  media_crack: {
    color: '#a855f7',          // Purple
    textColor: '#ffffff',
    borderStyle: 'solid',
    borderWidth: 2,
    labelPrefix: '╌',          // Horizontal dashes (distinct from other shapes)
    labelEn: 'Media Crack (Artifact)',
    countsTowardCFU: false,
    ariaLabel: 'Agar media crack — artifact, not counted in CFU',
    opencvBGR: [247, 85, 168], // BGR purple
  },
};

// ── Helper Functions ──────────────────────────────────────────────────────

/** Get visual style for one detection class. */
export function getClassStyle(className: DetectionClass): ClassVisualStyle {
  return CLASS_VISUAL_STYLES[className] ?? CLASS_VISUAL_STYLES.dust_debris;
}

/**
 * Format complete label for tooltip (used in UI overlay).
 *
 * Example output: "● Single Colony — 87%"
 */
export function formatDetectionLabel(
  className: DetectionClass,
  confidence: number,
): string {
  const style = getClassStyle(className);
  const pct = Math.round(confidence * 100);
  return `${style.labelPrefix} ${style.labelEn} — ${pct}%`;
}

/**
 * Return CSS string for bounding box border.
 *
 * Example: "2px solid #22c55e"
 */
export function getBorderCSS(className: DetectionClass): string {
  const s = getClassStyle(className);
  return `${s.borderWidth}px ${s.borderStyle} ${s.color}`;
}

/** List of all classes counted in CFU (for UI legend) */
export const CFU_CONTRIBUTING_CLASSES: DetectionClass[] = [
  'colony_single',
  'colony_merged',
];

/** List of all artifact classes (for UI legend) */
export const ARTIFACT_CLASSES: DetectionClass[] = [
  'bubble',
  'dust_debris',
  'media_crack',
];

/** All 5 classes in display order */
export const ALL_DETECTION_CLASSES: DetectionClass[] = [
  ...CFU_CONTRIBUTING_CLASSES,
  ...ARTIFACT_CLASSES,
];

// ── TNTC/TFTC Constants (per ISO 4833-1:2013) ─────────────────────────

/** Minimum colony count for VALID result (inclusive) */
export const TFTC_THRESHOLD = 25;

/** Maximum colony count for VALID result (inclusive) */
export const TNTC_THRESHOLD = 250;

/** Possible CFU/mL statuses */
export type CFUStatus = 'VALID' | 'TNTC' | 'TFTC';

/**
 * Status message text for each CFU status.
 * BUG-003: TNTC does not display absolute CFU/mL value.
 */
export const CFU_STATUS_MESSAGES: Record<CFUStatus, string> = {
  VALID: 'Valid result — within countable range (25–250 colonies)',
  TNTC:  'Too Numerous to Count (TNTC) — perform further dilution',
  TFTC:  'Too Few to Count (TFTC) — reduce dilution factor',
};

export const CFU_STATUS_COLORS: Record<CFUStatus, string> = {
  VALID: '#22c55e',  // Hijau
  TNTC:  '#ef4444',  // Merah
  TFTC:  '#f97316',  // Oranye
};
