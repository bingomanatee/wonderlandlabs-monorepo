import { scale, TITLE_TEXT_SHADOW } from './themeConstants';

export const textStyles = {
  pageTitlePrefix: {
    textTransform: 'upperCase',
    fontFamily: 'heading',
    lineHeight: '90%',
    fontWeight: 500,
    fontSize: scale(1, 'rem'), // Responsive font size
    color: 'pageTitle', // Reference color from theme
    textShadow: TITLE_TEXT_SHADOW,
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
