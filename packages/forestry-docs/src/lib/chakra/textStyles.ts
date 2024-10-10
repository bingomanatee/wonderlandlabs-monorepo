import { scale, scaleRem, TEXT_SIZE_EXTRA, TITLE_TEXT_SHADOW } from './themeConstants';

export const textStyles = {
  conceptsSummary: {
    fontSize: TEXT_SIZE_EXTRA,
    color: 'summaryText',
    fontFamily: 'body',
    fontWeight: 500,
  },
  highlightText: {
    fontSize: { base: '0.6rem', sm: '0.7rem', md: '0.75rem', lg: '0.8rem' },
    lineHeight: '120%',
  },
  listItem: {
    fontSize: scale(0.9, 'rem'),
    color: 'contentText',
  },
  logoSubtext: {
    fontSize: scaleRem(1),
    color: 'black',
    textAlign: 'center',
    lineHeight: '110%',
    font: 'heading',
    fontWeight: 600,
  },
  logoText: {
    color: 'pageTitle',
    fontSize: '0.6rem',
    textShadow: TITLE_TEXT_SHADOW,
  },
  mdParagraph: {
    marginBottom: '1em',
    fontSize: scale(0.9, 'rem'),
    color: 'contentText',
  },
  mdListItem: {
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
    color: 'var(--variable-color)',
    fontSize: '1em',
    whiteSpace: 'pre',
    fontFamily: 'mono',
    lineHeight: '110%',
  },
  pageTitlePrefix: {
    textTransform: 'upperCase',
    fontFamily: 'heading',
    lineHeight: '90%',
    fontWeight: 500,
    fontSize: scaleRem(1), // Responsive font size
    color: 'pageTitle', // Reference color from theme
    textShadow: TITLE_TEXT_SHADOW,
    _hover: {
      textShadow: 'none',
      textDecoration: 'underline',
    },
  },

  fn: {
    whiteSpace: 'pre',
    fontFamily: 'mono',
    color: 'fn',
    fontWeight: 400,
  },
};
