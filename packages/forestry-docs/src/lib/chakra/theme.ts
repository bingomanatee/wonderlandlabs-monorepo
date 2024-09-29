import { extendBaseTheme, theme as chakraTheme } from '@chakra-ui/react';
import { defineStyle, defineStyleConfig } from '@chakra-ui/react';
import { textStyles } from './textStyles';
import { layerStyles } from './layerStyles';
import { BG_HUE, BG_SAT, BG_LIGHT, TITLE_TEXT_SHADOW, scale } from './themeConstants';

const { Button } = chakraTheme.components; // Only need to extract Button here

// Define the Heading variant and base styles
const headingTheme = defineStyleConfig({
  baseStyle: {
    fontFamily: 'heading',
    fontWeight: 800,
    margin: 0,
    p: 0,
  },
  variants: {
    conceptsTitle: defineStyle({
      lineHeight: '90%',
      textTransform: 'upperCase',
      fontFamily: 'logoHeading',
      textShadow: TITLE_TEXT_SHADOW,
      fontSize: { base: '2rem', sm: '2.25rem', md: '2.5rem', lg: '3.25rem' }, // Responsive font size
      color: 'pageTitle', // Reference color from theme
    }),
    titleLogo: defineStyle({
      lineHeight: '90%',
      textAlign: 'center',
      textTransform: 'upperCase',
      fontFamily: 'logoHeading',
      fontSize: scale(2.5, 'rem'), // Responsive font size
      color: 'pageTitle', // Reference color from theme
    }),

    mdh1: { fontSize: scale(1.5, 'rem') },
    mdH2: { fontSize: scale(1.25, 'rem') },
    highlight: defineStyle({
      fontSize: scale(0.8, 'rem'),
      color: 'highlightTitle',
      fontFamily: 'heading',
      fontWeight: 600,
      lineHeight: '100%',
    }),
  },
});

// Extend the theme
export const theme = extendBaseTheme({
  styles: {
    global: {
      html: {
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      },
      body: {
        height: '100%',
        width: '100%',
        overflow: 'hidden',

        fontSize: '16px',
        backgroundColor: 'rgb(69, 98, 79)',
        backgroundImage: "url('/pictures/blue-forest.png')",
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'top left',
        backgroundRepeat: 'no-repeat',
      },
    },
  },
  fonts: {
    body: `Montserrat`, // Using CSS variables for fonts
    heading: `Archivo`, // Main heading font
    logoHeading: 'Archivo Black', // For specific headings like logos
    mono: 'Source Code Pro',
  },
  components: {
    Button, // Reuse the default Button from chakraTheme
    Heading: headingTheme, // Apply custom Heading styles and variants
  },
  textStyles,
  layerStyles,
  colors: {
    highlightTitle: 'var(--highlight-title-color)',
    pageTitle: 'rgb(225, 255, 230)', // Color for page titles
    pageColumnTransparent: `hsla(${BG_HUE}, ${BG_SAT}%,  ${BG_LIGHT}%, 0)`,
    pageColumn: `hsla(${BG_HUE}, ${BG_SAT}%, ${BG_LIGHT}%, 0.8)`,
    content: `hsl(180, 40%, 80%)`,
    contentInset: `hsla(180, 40%, 80%, 0.8)`,
    contentBackground: `hsla(180, 40%, 80%, 0.9)`,
    summaryText: 'rgba(255,250,245,0.9)',
    contentText: 'rgba(0, 0, 0,0.9)',
    contentTransparent: `hsla(${BG_HUE}, ${BG_SAT}%, ${BG_LIGHT}%, 0)`,
    code: 'hsl(200, 90%, 90%)',
    variable: 'hsl(170, 80%, 0%)',
    logoCircle: 'rgba(0,0,0,0.6)',
  },
});
