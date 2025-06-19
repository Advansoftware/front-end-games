import React from 'react';
import {
  Modal,
  Backdrop,
  Fade,
  Box,
  IconButton,
  Chip
} from '@mui/material';
import { Close as CloseIcon, SportsEsports as GamepadIcon } from '@mui/icons-material';

import { useGameInfoModalNavigation } from '../hooks/useGameInfoModalNavigation';
import { useGameInfoContentNavigation } from '../hooks/useGameInfoContentNavigation';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import GameInfoHeader from './game-info-modal/GameInfoHeader';
import GameInfoNavigation from './game-info-modal/GameInfoNavigation';
import GameInfoContent from './game-info-modal/GameInfoContent';

const GameInfoModal = ({ game, open, onClose, onShowTrailer }) => {
  const { currentTheme } = useCustomTheme();

  // Tabs disponíveis
  const tabs = ['overview', 'gallery', 'specs', 'actions'];

  // Hook de navegação específico para modal
  const {
    activeTab,
    focusMode,
    setActiveTab,
    setFocusMode,
    navigationInfo,
    getTabProps,
    isContentFocused
  } = useGameInfoModalNavigation({
    isOpen: open,
    onClose: onClose,
    tabs: tabs,
    initialTab: 'overview'
  });

  // Hook de navegação dentro do conteúdo
  const contentNavigation = useGameInfoContentNavigation({
    activeTab,
    isContentFocused,
    onExitContent: () => setFocusMode('tabs') // Voltar para navegação de tabs
  });

  // Cores por tema
  const themeColors = {
    xbox: { primary: '#107C10', accent: '#40E040', secondary: '#0E6A0E' },
    ps5: { primary: '#0070F3', accent: '#40B4FF', secondary: '#0051CC' },
    switch: { primary: '#E60012', accent: '#FF4040', secondary: '#CC0010' }
  };

  const currentColors = themeColors[currentTheme] || themeColors.xbox;

  if (!game) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: {
          backgroundColor: 'rgba(0,0,0,0.95)',
          zIndex: 15000
        }
      }}
      sx={{ zIndex: 15000 }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', md: '90%', lg: '85%', xl: '80%' },
            maxWidth: '1400px',
            maxHeight: '90vh',
            bgcolor: 'rgba(8, 16, 20, 0.98)',
            backdropFilter: 'blur(30px)',
            border: '2px solid rgba(255,255,255,0.15)',
            borderRadius: 3,
            boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
            overflow: 'hidden',
            zIndex: 15001,
            outline: 'none'
          }}
        >
          {/* Botão de fechar */}
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(10px)',
              zIndex: 10,
              border: '2px solid transparent',
              '&:hover': {
                bgcolor: 'rgba(244, 67, 54, 0.8)',
                transform: 'scale(1.1)',
                border: '2px solid rgba(255,255,255,0.4)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Indicador de navegação gamepad no topo */}
          {navigationInfo.gamepadConnected && (
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                zIndex: 10
              }}
            >
              <Chip
                icon={<GamepadIcon />}
                label={`${focusMode === 'tabs' ? 'Tabs' : 'Conteúdo'} - ${navigationInfo.currentTabIndex + 1}/${navigationInfo.totalTabs}`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  bgcolor: 'rgba(0,0,0,0.8)',
                  backdropFilter: 'blur(10px)',
                  borderColor: currentColors.primary,
                  color: 'white'
                }}
              />
            </Box>
          )}

          {/* Header */}
          <GameInfoHeader game={game} currentColors={currentColors} />

          {/* Navegação por tabs */}
          <GameInfoNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            currentColors={currentColors}
            game={game}
            getTabProps={getTabProps}
          />

          {/* Conteúdo das tabs */}
          <GameInfoContent
            game={game}
            activeTab={activeTab}
            currentColors={currentColors}
            onShowTrailer={onShowTrailer}
            isContentFocused={isContentFocused}
            contentNavigation={contentNavigation}
          />

          {/* Indicador de controles gamepad na parte inferior */}
          {navigationInfo.gamepadConnected && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                bgcolor: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(10px)',
                px: 3,
                py: 1.5,
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              {[
                { key: 'LB/RB', action: 'Trocar Abas' },
                { key: 'Analógico', action: 'Navegar' },
                { key: 'A', action: focusMode === 'tabs' ? 'Entrar' : 'Ação' },
                { key: 'B', action: focusMode === 'tabs' ? 'Fechar' : 'Voltar' }
              ].map((control, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                  <Box sx={{
                    bgcolor: currentColors.primary,
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    {control.key}
                  </Box>
                  {control.action}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Fade>
    </Modal>
  );
};

export default GameInfoModal;