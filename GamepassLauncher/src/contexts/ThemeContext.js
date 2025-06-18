import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

// Temas inspirados nos consoles
const themes = {
  xbox: createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#107C10', // Verde Xbox
        light: '#3E8E3E',
        dark: '#0D5D0D',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#FFB900', // Amarelo Xbox
        light: '#FFD633',
        dark: '#CC9400',
        contrastText: '#000000',
      },
      background: {
        default: '#0E1E25',
        paper: '#1A2B32',
      },
      text: {
        primary: '#ffffff',
        secondary: '#B0BEC5',
      },
      success: {
        main: '#107C10',
      },
    },
    typography: {
      fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '3rem',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2.5rem',
      },
      h3: {
        fontWeight: 600,
        fontSize: '2rem',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(145deg, #1A2B32 0%, #0E1E25 100%)',
            border: '1px solid #2C3E45',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(16, 124, 16, 0.3)',
            },
          },
        },
      },
    },
  }),

  ps5: createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#0070F3', // Azul PS5
        light: '#3391FF',
        dark: '#0056CC',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#FFFFFF',
        light: '#FFFFFF',
        dark: '#CCCCCC',
        contrastText: '#000000',
      },
      background: {
        default: '#000000',
        paper: '#1A1A1A',
      },
      text: {
        primary: '#ffffff',
        secondary: '#CCCCCC',
      },
      info: {
        main: '#00D4FF',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
      h1: {
        fontWeight: 800,
        fontSize: '3rem',
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 700,
        fontSize: '2.5rem',
        letterSpacing: '-0.01em',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(145deg, #1A1A1A 0%, #000000 100%)',
            border: '1px solid #333333',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0, 112, 243, 0.3)',
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
        main: '#E60012', // Vermelho Nintendo
        light: '#FF3345',
        dark: '#B3000E',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#0066CC', // Azul Nintendo
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
        fontSize: '3rem',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2.5rem',
        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(145deg, #3A3A3A 0%, #2D2D2D 100%)',
            border: '2px solid #4A4A4A',
            borderRadius: '16px',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(230, 0, 18, 0.3)',
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