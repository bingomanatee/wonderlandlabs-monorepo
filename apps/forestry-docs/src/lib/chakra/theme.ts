import { extendBaseTheme, theme as chakraTheme } from '@chakra-ui/react';
import { textStyles } from './textStyles';
import { layerStyles } from './layerStyles';
import { colors } from './colors';
import { heading } from './heading';

const { Button } = chakraTheme.components; // Only need to extract Button here

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
        backgroundColor: 'hsl(200,40%,80%)',
        //backgroundImage: "url('/pictures/blue-forest.png')",
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'top left',
        backgroundRepeat: 'no-repeat',
      },
    },
  },
  fonts: {
    body: `Montserrat`, // Using CSS variables for fonts
    heading: `Archivo Black`, // Main heading font
    headingSub: `Archivo`, // Main heading font
    logoHeading: 'Archivo Black', // For specific headings like logos
    mono: 'Source Code Pro',
  },
  components: {
    Button, // Reuse the default Button from chakraTheme
    Heading: heading, // Apply custom Heading styles and variants
  },
  textStyles,
  layerStyles,
  colors,
});
