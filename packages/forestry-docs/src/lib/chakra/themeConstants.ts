export const TEXT_SIZE_EXTRA = {
  base: '0.9rem',
  sm: '0.9rem',
  md: '1rem',
  lg: '1.15rem',
};

export const IMAGE_OS = {
  base: '-40px',
  sm: '-40px',
  md: '-50px',
  lg: '-80px',
};

export const SUMMARY_LM = {
  base: '50px',
  sm: '50px',
  md: '60px',
  lg: '80px',
};

export const MIN_HEADER_SIZE = {
  base: '120px',
  sm: '120px',
  md: '160px',
  lg: '180px',
};

export const LOGO_SIZE = 40;
export const LOGO_MARGIN_SIZE = 20;
export const BG_HUE = 193;
export const BG_SAT = 92;
export const BG_LIGHT = 25;

const SMALL_SCALE = 0.8;
const LARGE_SCALE = 1.2;
const XL_SCALE = 1.333;

export function u(value: number, unit: string | false = 'px') {
  if (unit === false) return value;
  return `${value}${unit}`;
}
export function scale(value: number, unit: string | false = 'px') {
  return {
    base: u(value, unit),
    sm: u(value * SMALL_SCALE, unit),
    md: u(value, unit),
    lg: u(value * LARGE_SCALE, unit),
    xl: u(value * XL_SCALE, unit),
  };
}

export function scaleRem(value: number) {
  return scale(value, 'rem');
}

export const TITLE_TEXT_SHADOW = '2px 1px 2px rgba(0,0,0,0.5)';
