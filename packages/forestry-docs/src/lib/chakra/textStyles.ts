import { scale, scaleRem, TEXT_SIZE_EXTRA, TITLE_TEXT_SHADOW } from './themeConstants';

export const textStyles = {
  pageTitlePrefix: {
    textTransform: 'upperCase',
    fontFamily: 'heading',
    lineHeight: '90%',
    fontWeight: 500,
    fontSize: scaleRem(1), // Responsive font size
    color: 'pageTitle', // Reference color from theme
    textShadow: TITLE_TEXT_SHADOW,
  },
  logoSubtext: {
    fontSize: scaleRem(1),
    color: 'pageTitle',
    textAlign: 'center',
    lineHeight: '110%',
    font: 'heading',
    fontWeight: 500,
  },
  highlightText: {
    fontSize: { base: '0.6rem', sm: '0.7rem', md: '0.75rem', lg: '0.8rem' },
    lineHeight: '120%',
  },
  conceptsSummary: {
    fontSize: TEXT_SIZE_EXTRA,
    color: 'summaryText',
    fontFamily: 'body',
    fontWeight: 500,
  },
  mdParagraph: {
    marginBottom: '1em',
    fontSize: scale(0.9, 'rem'),
    color: 'contentText',
  },
  mdPre: {
    color: 'code',
    whiteSpace: 'pre',
    fontFamily: 'mono',
    overflowY: 'auto',
  },
  mdVariable: {
    color: 'variable',
    fontSize: scale(0.7, 'rem'),
    whiteSpace: 'pre',
    fontFamily: 'mono',
    lineHeight: '110%',
  },
  logoText: {
    color: 'pageTitle',
    fontSize: scale(0.6, 'rem'),
  },
};
