import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'light' ? 'tree-light' : 'gray.800',
        ...(props.colorMode === 'light' && {
          backgroundImage: 'url("/img/background-timberline.png")',
          backgroundRepeat: 'repeat-x !important',
          backgroundAttachment: 'scroll',
          backgroundPosition: 'center top',
          backgroundSize: '80%',
        }),
      },
    }),
  },
  colors: {
    'tree-light': 'hsl(179,80%,89%)',
    brand: {
      50: '#e6f7ff',
      100: '#bae7ff',
      200: '#91d5ff',
      300: '#69c0ff',
      400: '#40a9ff',
      500: '#1890ff',
      600: '#096dd9',
      700: '#0050b3',
      800: '#003a8c',
      900: '#002766',
    },
    forest: {
      50: '#f0fff4',
      100: '#c6f6d5',
      200: '#9ae6b4',
      300: '#68d391',
      400: '#48bb78',
      500: '#38a169',
      600: '#2f855a',
      700: '#276749',
      800: '#22543d',
      900: '#1a202c',
    },
  },
  fonts: {
    heading: `'Urbanist', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
    body: `'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
    mono: `'Fira Sans', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace`,
  },
  layerStyles: {
    card: {
      py: 1,
      px: 1,
      borderRadius: 'md',
      mb: 2,
    },
    highlight: {
      p: 3,
      borderRadius: 'md',
    },
    doDontItem: {
      p: 3,
      borderRadius: 'md',
      border: '1px solid',
    },
    section: {
      spacing: 6,
      align: 'stretch',
    },
    infoBox: {
      p: 4,
      borderRadius: 'md',
    },
    sidebar: {
      position: 'fixed',
      left: 0,
      top: 0,
      h: '100vh',
      w: '280px',
      bg: 'gray.50',
      borderRight: '1px',
      borderColor: 'gray.200',
      overflowY: 'auto',
      p: 6,
      zIndex: 10,
    },
    mainContent: {
      ml: '280px',
      p: 8,
      maxW: 'none',
    },
    methodCard: {
      p: 6,
      borderRadius: 'lg',
      border: '1px',
      borderColor: 'gray.200',
      mb: 6,
      bg: 'white',
      shadow: 'sm',
    },
    codeExample: {
      p: 4,
      bg: 'gray.50',
      borderRadius: 'md',
      border: '1px',
      borderColor: 'gray.200',
      fontFamily: 'mono',
      fontSize: 'sm',
      overflowX: 'auto',
    },
    methodSignature: {
      py: 3,
      borderBottom: '1px solid',
      borderColor: 'red.600',
      fontFamily: 'mono',
      fontSize: 'sm',
      fontWeight: 'semibold',
      color: 'gray.800',
      display: 'block',
    },
    navLink: {
      display: 'block',
      py: 2,
      px: 3,
      borderRadius: 'md',
      fontSize: 'sm',
      color: 'gray.700',
      textDecoration: 'none',
      _hover: {
        bg: 'gray.100',
        color: 'brand.600',
      },
    },
  },
  textStyles: {
    body: {
      color: 'gray.600',
      mb: 4,
    },
    description: {
      color: 'gray.600',
      fontSize: 'sm',
      mb: 3,
    },
    hero: {
      fontSize: 'xl',
      color: 'gray.600',
      maxW: '4xl',
      mx: 'auto',
      mb: 3,
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Code: {
      baseStyle: {
        fontSize: 'sm',
        fontFamily: 'mono',
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: 'bold',
        fontFamily: 'heading',
        lineHeight: 'shorter',
        color: 'gray.800',
      },
      sizes: {
        xs: {
          fontSize: 'sm',
          mb: 1,
          lineHeight: 'base',
        },
        sm: {
          fontSize: 'md',
          mb: 2,
          lineHeight: 'base',
        },
        md: {
          fontSize: 'lg',
          mb: 3,
          lineHeight: 'short',
        },
        lg: {
          fontSize: 'xl',
          mb: 4,
          lineHeight: 'short',
        },
        xl: {
          fontSize: '2xl',
          mb: 4,
          lineHeight: 'shorter',
          fontWeight: 'bold',
        },
        '2xl': {
          fontSize: '3xl',
          mb: 6,
          lineHeight: 'shorter',
          fontWeight: 'bold',
        },
        '3xl': {
          fontSize: '4xl',
          mb: 6,
          lineHeight: 'none',
          fontWeight: 'bold',
        },
        '4xl': {
          fontSize: '5xl',
          mb: 8,
          lineHeight: 'none',
          fontWeight: 'bold',
        },
      },
      variants: {
        section: (props) => ({
          ...props.theme.components.Heading.sizes.lg,
          color: 'gray.700',
          fontWeight: 'medium',
        }),
        card: (props) => ({
          ...props.theme.components.Heading.sizes.md,
          color: 'gray.800',
          fontWeight: 'semibold',
        }),
        page: (props) => ({
          ...props.theme.components.Heading.sizes['3xl'],
          color: 'gray.900',
          fontWeight: 'bold',
          textAlign: 'center',
        }),
        subtle: (props) => ({
          ...props.theme.components.Heading.sizes.sm,
          color: 'gray.600',
          fontWeight: 'medium',
        }),
      },
    },
  },
});

export default theme;
