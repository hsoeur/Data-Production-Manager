import { alpha, createTheme } from '@mui/material/styles';

const navy = '#202F6C';
const blue = '#2949B3';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: blue, dark: navy, light: '#E8EDFF' },
    secondary: { main: '#EF3E3A', dark: '#C92C2A' },
    success: { main: '#15805D' },
    warning: { main: '#B45309' },
    error: { main: '#D83A37' },
    background: { default: '#F2F4F7', paper: '#FFFFFF' },
    text: { primary: '#18213A', secondary: '#667085' },
    divider: '#D9DEE7',
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'Inter, "Segoe UI", Roboto, Arial, sans-serif',
    h1: { fontSize: 'clamp(1.65rem, 3vw, 2.35rem)', fontWeight: 780, letterSpacing: '-0.035em', lineHeight: 1.12 },
    h2: { fontSize: '1.25rem', fontWeight: 750, letterSpacing: '-0.015em' },
    h3: { fontSize: '1rem', fontWeight: 750 },
    button: { fontWeight: 700, textTransform: 'none' },
  },
  components: {
    MuiCssBaseline: { styleOverrides: { '*': { boxSizing: 'border-box' }, body: { margin: 0, minWidth: 320 }, '::selection': { background: '#D7E0FF' } } },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { minHeight: 42, borderRadius: 8, paddingInline: 18 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#CAD2DE' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#8792A5' },
          '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(blue, 0.12)}` },
        },
      },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 12 } } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: '#E7EAF0' },
        head: { backgroundColor: '#F7F8FB', color: '#526071', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.045em', textTransform: 'uppercase' },
      },
    },
  },
});
