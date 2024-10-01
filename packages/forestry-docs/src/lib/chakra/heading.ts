import { defineStyleConfig, defineStyle } from '@chakra-ui/react';
import { TITLE_TEXT_SHADOW, scale, scaleRem } from './themeConstants';

export const heading = defineStyleConfig({
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
    highlight: defineStyle({
      fontSize: scale(0.8, 'rem'),
      color: 'highlightTitle',
      fontFamily: 'heading',
      fontWeight: 600,
      lineHeight: '100%',
      textTransform: 'uppercase',
    }),
    mdH2: { fontSize: scale(1.25, 'rem') },
    mdh1: { fontSize: scale(1.5, 'rem') },

    menuHead: {
      textTransform: 'uppercase',
      fontFamily: 'heading',
      lineHeight: '90%',
      fontWeight: 200,
      opacity: 0.5,
      fontSize: scaleRem(1.5), // Responsive font size
      color: 'menuTitle', // Reference color from theme
      textAlign: 'center',
      marginTop: '1.5rem',
    },
    menuSection: defineStyle({
      fontSize: scale(0.8, 'rem'),
      color: 'highlightTitle',
      fontFamily: 'heading',
      fontWeight: 600,
      lineHeight: '100%',
    }),
    pageTitle: defineStyle({
      lineHeight: '90%',
      textTransform: 'uppercase',
      fontFamily: 'logoHeading',
      textShadow: TITLE_TEXT_SHADOW,
      fontSize: { base: '2rem', sm: '2.25rem', md: '2.5rem', lg: '3.25rem' }, // Responsive font size
      color: 'pageTitle', // Reference color from theme
    }),
    sectionIcon: defineStyle({
      fontSize: scale(1.25, 'rem'),
      color: 'black',
      fontFamily: 'heading',
      fontWeight: 600,
      lineHeight: '100%',
      textAlign: 'center',
      flex: 1,
    }),
    titleLogo: defineStyle({
      lineHeight: '90%',
      textAlign: 'center',
      textTransform: 'upperCase',
      fontFamily: 'logoHeading',
      fontSize: scale(2.5, 'rem'), // Responsive font size
      color: 'pageTitle', // Reference color from theme
    }),
  },
});
