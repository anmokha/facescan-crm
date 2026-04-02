import { ColorPalette } from './types';

/**
 * Apply a color palette to the document root as CSS custom properties
 * This allows Tailwind's primary-* colors to dynamically change
 */
export const applyTheme = (colors: ColorPalette | { primaryColor: string }): void => {
  const root = document.documentElement;

  let palette: ColorPalette;

  // Check if it's a simple primary color object from Dashboard
  if ('primaryColor' in colors && !('primary50' in colors)) {
      palette = generatePalette(colors.primaryColor);
  } else {
      palette = colors as ColorPalette;
  }

  // Apply each color as a CSS custom property
  root.style.setProperty('--color-primary-50', palette.primary50);
  root.style.setProperty('--color-primary-100', palette.primary100);
  root.style.setProperty('--color-primary-200', palette.primary200);
  root.style.setProperty('--color-primary-500', palette.primary500);
  root.style.setProperty('--color-primary-600', palette.primary600);
  root.style.setProperty('--color-primary-700', palette.primary700);

  // Apply generic CSS variables if present
  if (palette.cssVars) {
    Object.entries(palette.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }
};

/**
 * Reset theme to default (pink - hair diagnostic)
 */
export const resetTheme = (): void => {
  applyTheme({
    primary50: '#fdf2f8',
    primary100: '#fce7f3',
    primary200: '#fbcfe8',
    primary500: '#ec4899',
    primary600: '#db2777',
    primary700: '#be185d',
  });
};

// --- Helper: Generate Palette from Single Color ---

function generatePalette(hex: string): ColorPalette {
    return {
        primary50: lighten(hex, 0.95),
        primary100: lighten(hex, 0.9),
        primary200: lighten(hex, 0.75),
        primary500: hex,
        primary600: darken(hex, 0.1),
        primary700: darken(hex, 0.2),
    };
}

// Simple Hex Color Utils

function lighten(hex: string, amount: number): string {
    const [r, g, b] = hexToRgb(hex);
    return rgbToHex(
        Math.round(r + (255 - r) * amount),
        Math.round(g + (255 - g) * amount),
        Math.round(b + (255 - b) * amount)
    );
}

function darken(hex: string, amount: number): string {
    const [r, g, b] = hexToRgb(hex);
    return rgbToHex(
        Math.round(r * (1 - amount)),
        Math.round(g * (1 - amount)),
        Math.round(b * (1 - amount))
    );
}

function hexToRgb(hex: string): [number, number, number] {
    let c: any = hex.substring(1).split('');
    if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
