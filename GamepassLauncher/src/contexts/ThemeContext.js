import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

// Temas inspirados nos consoles com cores mais fiéis
const themes = {
  xbox: createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#107C10', // Verde Xbox oficial
        light: '#16AA16',
        dark: '#0D5D0D',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#00BCF2', // Azul Xbox
        light: '#33C9F5',
        dark: '#0096C2',
        contrastText: '#ffffff',
      },
      background: {
        default: '#0C1618', // Fundo escuro como no Gamepass
        paper: '#1A2B32',
      },
      text: {
        primary: '#ffffff',
        secondary: '#B0BEC5',
      },
      success: {
        main: '#107C10',
      },
      info: {
        main: '#00BCF2',
      },
    },
    typography: {
      fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '3.5rem',
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 600,
        fontSize: '3rem',
        letterSpacing: '-0.01em',
      },
      h3: {
        fontWeight: 600,
        fontSize: '2.5rem',
      },
      h4: {
        fontWeight: 700,
        fontSize: '2rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.25rem',
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.4,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            background: 'rgba(26, 43, 50, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 4, // Reduzido de 8 para aparência mais de capa
            transition: 'all 0.3s ease',
            '&:hover': {
              // Removido transform para não aumentar o card
              boxShadow: '0 8px 20px rgba(16, 124, 16, 0.2)',
              border: '1px solid rgba(16, 124, 16, 0.4)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 6,
          },
          contained: {
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
        },
      },
    },
  }),

  ps5: createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#0070F3', // Azul PS5 oficial
        light: '#3391FF',
        dark: '#0056CC',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#FFFFFF',
        light: '#FFFFFF',
        dark: '#E8E8E8',
        contrastText: '#000000',
      },
      background: {
        default: '#000000', // Preto puro PS5
        paper: '#1A1A1A',
      },
      text: {
        primary: '#ffffff',
        secondary: '#CCCCCC',
      },
      info: {
        main: '#00D4FF',
      },
      success: {
        main: '#00C851',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", Arial, sans-serif',
      h1: {
        fontWeight: 800,
        fontSize: '3.5rem',
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 700,
        fontSize: '3rem',
        letterSpacing: '-0.02em',
      },
      h4: {
        fontWeight: 700,
        fontSize: '2rem',
        letterSpacing: '-0.01em',
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(145deg, #1A1A1A 0%, #0D0D0D 100%)',
            border: '1px solid #333333',
            borderRadius: 4, // Reduzido para aparência de capa
            transition: 'all 0.3s ease',
            '&:hover': {
              // Removido transform para não aumentar o card
              boxShadow: '0 8px 20px rgba(0, 112, 243, 0.2)',
              border: '1px solid rgba(0, 112, 243, 0.4)',
            },
          },
        },
      },
    },
  }),

  switch: createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#E60012', // Vermelho Nintendo oficial
        light: '#FF3345',
        dark: '#B3000E',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#0066CC', // Azul Nintendo oficial
        light: '#3388FF',
        dark: '#0052A3',
        contrastText: '#ffffff',
      },
      background: {
        default: '#2D2D2D',
        paper: '#3A3A3A',
      },
      text: {
        primary: '#ffffff',
        secondary: '#DDDDDD',
      },
      warning: {
        main: '#FF6B00',
      },
    },
    typography: {
      fontFamily: '"Nintendo DS BIOS", "Roboto", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '3.5rem',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
      },
      h2: {
        fontWeight: 600,
        fontSize: '3rem',
        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
      },
    },
    shape: {
      borderRadius: 20,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(145deg, #3A3A3A 0%, #2D2D2D 100%)',
            border: '2px solid #4A4A4A',
            borderRadius: 8, // Reduzido de 20px para aparência mais de capa, mas mantendo estilo Nintendo
            transition: 'all 0.3s ease',
            '&:hover': {
              // Removido transform para não aumentar o card
              boxShadow: '0 8px 20px rgba(230, 0, 18, 0.2)',
              border: '2px solid rgba(230, 0, 18, 0.4)',
            },
          },
        },
      },
    },
  }),
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeContextProvider');
  }
  return context;
};

export const ThemeContextProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('xbox');
  const [soundsEnabled, setSoundsEnabled] = useState(true);

  // Carregar configurações salvas
  useEffect(() => {
    const savedTheme = localStorage.getItem('gamepass-theme');
    const savedSounds = localStorage.getItem('gamepass-sounds');

    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }

    if (savedSounds !== null) {
      setSoundsEnabled(JSON.parse(savedSounds));
    }
  }, []);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem('gamepass-theme', themeName);

      // Tocar som de mudança de tema
      if (soundsEnabled) {
        playSound('theme-change');
      }
    }
  };

  const toggleSounds = () => {
    const newSoundsState = !soundsEnabled;
    setSoundsEnabled(newSoundsState);
    localStorage.setItem('gamepass-sounds', JSON.stringify(newSoundsState));
  };

  const playSound = (soundType) => {
    if (!soundsEnabled) return;

    try {
      const audio = new Audio(`/assets/sounds/${currentTheme}/${soundType}.mp3`);
      audio.volume = 0.3;
      audio.play().catch(console.warn);
    } catch (error) {
      console.warn('Erro ao reproduzir som:', error);
    }
  };

  const value = {
    currentTheme,
    changeTheme,
    soundsEnabled,
    toggleSounds,
    playSound,
    themes,
    theme: themes[currentTheme],
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={themes[currentTheme]}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};