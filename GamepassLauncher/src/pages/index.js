import { useEffect, useState } from 'react';
import { Box, Container, Typography, AppBar, Toolbar, IconButton, Badge } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home as HomeIcon,
  Settings as SettingsIcon,
  Download as DownloadIcon,
  SportsEsports as GamepadIcon,
  Minimize as MinimizeIcon,
  CropSquare as MaximizeIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import { ThemeContextProvider } from '../contexts/ThemeContext';
import { GamesProvider } from '../contexts/GamesContext';
import { useGamepad } from '../hooks/useGamepad';
import GameGrid from '../components/GameGrid';
import GameDetails from '../components/GameDetails';
import Sidebar from '../components/Sidebar';
import SettingsPanel from '../components/SettingsPanel';

const HomePage = () => {
  const [currentView, setCurrentView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const gamepad = useGamepad();

  // Navegação com gamepad
  useEffect(() => {
    const handleGamepadNavigation = () => {
      const nav = gamepad.getNavigationInput();

      if (nav.menu) {
        setSidebarOpen(prev => !prev);
      }

      if (nav.back) {
        if (selectedGameId) {
          setSelectedGameId(null);
        } else if (sidebarOpen) {
          setSidebarOpen(false);
        }
      }
    };

    if (gamepad.gamepadConnected) {
      const interval = setInterval(handleGamepadNavigation, 100);
      return () => clearInterval(interval);
    }
  }, [gamepad, selectedGameId, sidebarOpen]);

  // Controles de janela
  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximizeWindow();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow();
    }
  };

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Barra de título customizada */}
      <AppBar
        position="fixed"
        sx={{
          background: 'transparent',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          WebkitAppRegion: 'drag'
        }}
        elevation={0}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '48px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Gamepass Launcher
            </Typography>

            {gamepad.gamepadConnected && (
              <Badge color="success" variant="dot">
                <GamepadIcon sx={{ color: 'success.main' }} />
              </Badge>
            )}
          </Box>

          <Box sx={{ display: 'flex', WebkitAppRegion: 'no-drag' }}>
            <IconButton onClick={handleMinimize} size="small">
              <MinimizeIcon />
            </IconButton>
            <IconButton onClick={handleMaximize} size="small">
              <MaximizeIcon />
            </IconButton>
            <IconButton onClick={handleClose} size="small" sx={{ color: 'error.main' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Conteúdo principal */}
      <Box
        component={motion.div}
        animate={{
          marginLeft: sidebarOpen ? 280 : 0,
          transition: { duration: 0.3, ease: 'easeInOut' }
        }}
        sx={{
          height: '100vh',
          paddingTop: '48px',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth={false} sx={{ height: '100%', padding: 3 }}>
          <AnimatePresence mode="wait">
            {selectedGameId ? (
              <GameDetails
                key="game-details"
                gameId={selectedGameId}
                onBack={() => setSelectedGameId(null)}
              />
            ) : currentView === 'settings' ? (
              <SettingsPanel key="settings" />
            ) : (
              <GameGrid
                key="game-grid"
                onGameSelect={setSelectedGameId}
              />
            )}
          </AnimatePresence>
        </Container>
      </Box>

      {/* Botão flutuante para abrir sidebar */}
      {!sidebarOpen && (
        <IconButton
          component={motion.button}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          sx={{
            position: 'fixed',
            top: 70,
            left: 16,
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            zIndex: 1000
          }}
          onClick={() => setSidebarOpen(true)}
        >
          <HomeIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default function Home() {
  return (
    <ThemeContextProvider>
      <GamesProvider>
        <HomePage />
      </GamesProvider>
    </ThemeContextProvider>
  );
}