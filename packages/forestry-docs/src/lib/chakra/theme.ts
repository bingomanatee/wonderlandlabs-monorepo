import { extendBaseTheme, theme as chakraTheme } from '@chakra-ui/react';
import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

const { Button } = chakraTheme.components; // Only need to extract Button here

const TEXT_SIZE_EXTRA = {
  base: '0.9rem',
  sm: '0.9rem',
  md: '1rem',
  lg: '1.15rem',
};

const IMAGE_OS = {
  base: '-40px',
  sm: '-40px',
  md: '-50px',
  lg: '-80px',
};

const SUMMARY_LM = {
  base: '50px',
  sm: '50px',
  md: '60px',
  lg: '80px',
};

const MIN_HEADER_SIZE = {
  base: '120px',
  sm: '120px',
  md: '160px',
  lg: '180px',
};

const BG_HUE = 106;
const BG_SAT = 25;
const BG_LIGHT = 15;

// Define the Heading variant and base styles
const headingTheme = defineStyleConfig({
  baseStyle: {
    fontFamily: 'heading',
    fontWeight: 800,
    margin: 0,
    p: 0,
  },
  variants: {
    pageTitle: defineStyle({
      lineHeight: '90%',
      textTransform: 'upperCase',
      fontFamily: 'logoHeading',
      fontSize: { base: '2.5rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' }, // Responsive font size
      color: 'pageTitle', // Reference color from theme
    }),
    highlight: defineStyle({
      fontSize: { base: '1.2rem', xl: '1.25rem' },
      color: 'highlightTitle',
      fontFamily: 'heading',
      fontWeight: 600,
      lineHeight: '100%',
      marginTop: 6,
    }),
  },
});

// Extend the theme
export const theme = extendBaseTheme({
  styles: {
    global: {
      body: {
        fontSize: '16px',
        backgroundColor: 'rgb(69, 98, 79)',
        backgroundImage: "url('/img/forestry-2.png')",
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'top left',
        backgroundRepeat: 'no-repeat',
        backdropFilter: 'blur(2px)', // Applies blur to the background
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
  textStyles: {
    pageTitlePrefix: {
      textTransform: 'upperCase',
      fontFamily: 'heading',
      lineHeight: '90%',
      fontWeight: 500,
      fontSize: { base: '1.5rem', sm: '0.85rem', md: '1rem', lg: '1.25rem' }, // Responsive font size
      color: 'pageTitle', // Reference color from theme
    },
    pageTitleSummary: {
      color: 'pageTitle',
      fontFamily: 'body',
      fontWeight: 400,
    },
    mdParagraph: {
      marginBottom: '1em',
      color: 'contentText',
    },
    mdPre: {
      color: 'code',
      whiteSpace: 'pre',
      fontFamily: 'mono',
      lineHeight: '110%',
      fontSize: { base: '0.7rem', lg: '0.75rem', xl: '0.8rem' },
    },
    mdVariable: {
      color: 'variable',
      whiteSpace: 'pre',
      fontFamily: 'mono',
      lineHeight: '110%',
    },
  },
  layerStyles: {
    content: {
      paddingX: { base: 4, sm: 4, md: 6, lg: 8 },
      paddingY: { base: 4, sm: 4, md: 7, lg: 10 },
      bgGradient: `linear(var(--chakra-colors-contentTransparent) 0px, 
        var(--chakra-colors-content) 100px, 
        var(--chakra-colors-content) calc(100% - 150px), 
        var(--chakra-colors-contentTransparent) 100%)`.replace(/\n/g, ' '),
      color: 'contentText',
      display: 'block',
    },
    pageTitleSummary: {
      fontSize: TEXT_SIZE_EXTRA,
      lineHeight: '160%',
      marginLeft: SUMMARY_LM,
      marginTop: 3,
      maxWidth: '600px',
    },
    pageImage: {
      position: 'absolute',
      left: IMAGE_OS,
      top: IMAGE_OS,
      zIndex: 5,
      borderRadius: '50%',
      overflow: 'hidden',
    },
    pageColumnHeader: {
      marginLeft: SUMMARY_LM,
      minHeight: MIN_HEADER_SIZE,
      marginBottom: 4,
      zIndex: 200,
    },
    pageColumnBody: {
      zIndex: 20,
      position: 'relative',
    },
    pageColumnContainer: {
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      alignContent: 'stretch',
      justifyContent: 'center',
    },
    pageColumn: {
      position: 'relative',
      maxWidth: '1024px',
      flexDirection: 'column',
      flex: 1,
      flexBasis: 0,
      paddingX: '25px',
      display: 'flex',
      bgGradient: `linear(
      90deg, 
      var(--chakra-colors-pageColumnTransparent) 0px,
      var(--chakra-colors-pageColumn) 20px,
      var(--chakra-colors-pageColumn) calc(100% - 20px),
      var(--chakra-colors-pageColumnTransparent)  100%)`.replace(/\n/g, ''),
    },
    mdCode: {
      px: 8,
      py: 3,
      marginY: 2,
    },
  },
  colors: {
    highlightTitle: 'var(--highlight-title-color)',
    pageTitle: 'rgb(225, 255, 230)', // Color for page titles
    pageColumnTransparent: `hsla(${BG_HUE}, ${BG_SAT}%,  ${BG_LIGHT}%, 0)`,
    pageColumn: `hsla(${BG_HUE}, ${BG_SAT}%, ${BG_LIGHT}%, 0.8)`,
    content: `hsla(${BG_HUE}, ${BG_SAT}%, ${BG_LIGHT}%, 1)`,
    contentText: 'rgba(255,255,255,0.9)',
    contentTransparent: `hsla(${BG_HUE}, ${BG_SAT}%, ${BG_LIGHT}%, 0)`,
    code: 'hsl(200, 90%, 100%)',
    variable: 'hsl(100, 100%, 90%)',
  },
});
