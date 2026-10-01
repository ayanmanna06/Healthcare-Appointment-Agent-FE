import React, { createContext, useContext, useState, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext({
  mode: 'light',
  toggleColorMode: () => {},
});

export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('health_theme_mode') || 'light';
  });

  const toggleColorMode = () => {
    setMode((prevMode) => {
      const nextMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('health_theme_mode', nextMode);
      return nextMode;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#0EA5E9',
            light: '#38BDF8',
            dark: '#0284C7',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#14B8A6',
            light: '#2DD4BF',
            dark: '#0D9488',
            contrastText: '#ffffff',
          },
          background: {
            default: mode === 'light' ? '#F8FAFC' : '#0F172A',
            paper: mode === 'light' ? '#FFFFFF' : '#1E293B',
          },
          text: {
            primary: mode === 'light' ? '#0F172A' : '#F8FAFC',
            secondary: mode === 'light' ? '#64748B' : '#94A3B8',
          },
        },
        typography: {
          fontFamily: "'Inter', sans-serif",
          h1: { fontFamily: "'Outfit', sans-serif", fontWeight: 700 },
          h2: { fontFamily: "'Outfit', sans-serif", fontWeight: 700 },
          h3: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
          h4: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
          h5: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
          h6: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
          button: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
        },
        shape: {
          borderRadius: 10,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                padding: '8px 20px',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: mode === 'light' 
                  ? '0 1px 3px rgba(0,0,0,0.05), 0 10px 15px -5px rgba(0,0,0,0.04)' 
                  : '0 4px 6px -1px rgba(0,0,0,0.4)',
                border: mode === 'light' ? '1px solid #E2E8F0' : '1px solid #334155',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiInputLabel: {
            styleOverrides: {
              root: {
                '&.MuiInputLabel-shrink': {
                  backgroundColor: mode === 'light' ? '#FFFFFF' : '#1E293B',
                  padding: '0 6px',
                  borderRadius: '4px',
                  zIndex: 2,
                  maxWidth: 'calc(100% - 24px)',
                },
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                '& input:-webkit-autofill': {
                  WebkitBoxShadow: `0 0 0 1000px ${mode === 'light' ? '#FFFFFF' : '#1E293B'} inset !important`,
                  WebkitTextFillColor: `${mode === 'light' ? '#0F172A' : '#F8FAFC'} !important`,
                  caretColor: mode === 'light' ? '#0F172A' : '#F8FAFC',
                  transition: 'background-color 5000s ease-in-out 0s',
                },
              },
              notchedOutline: {
                borderColor: mode === 'light' ? '#CBD5E1' : '#334155',
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleColorMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
