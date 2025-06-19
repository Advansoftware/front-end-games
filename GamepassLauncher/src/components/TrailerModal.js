import React, { useEffect, useState } from 'react';
import {
  Modal,
  Box,
  IconButton,
  Typography
} from '@mui/material';
import {
  Close as CloseIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

const TrailerModal = ({
  open,
  onClose,
  videoId,
  gameTitle
}) => {
  const { currentTheme } = useTheme();
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  // Cores por tema
  const themeColors = {
    xbox: { primary: '#107C10', glow: '#40E040' },
    ps5: { primary: '#0070F3', glow: '#40B4FF' },
    switch: { primary: '#E60012', glow: '#FF4040' }
  };

  const currentColors = themeColors[currentTheme];

  // Simular carregamento do player
  useEffect(() => {
    if (open && videoId) {
      console.log('🎬 Modal aberto, iniciando loading...');
      setIsPlayerReady(false);
      // Simular tempo de carregamento do iframe
      const timeout = setTimeout(() => {
        console.log('✅ Player pronto, removendo overlay...');
        setIsPlayerReady(true);
      }, 2000); // Aumentei para 2 segundos para ter tempo de ver

      return () => clearTimeout(timeout);
    }

    if (!open) {
      console.log('❌ Modal fechado, resetando estado...');
      setIsPlayerReady(false);
    }
  }, [open, videoId]);

  const handleClose = () => {
    setIsPlayerReady(false);
    onClose();
  };

  // Controle do ESC
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && open) {
        handleClose();
      }
    };

    if (open) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: { xs: '95vw', sm: '90vw', md: '80vw', lg: '70vw' },
          height: { xs: '60vw', sm: '50vw', md: '45vw', lg: '40vw' },
          maxWidth: '1200px',
          maxHeight: '675px',
          bgcolor: '#000',
          borderRadius: 3,
          overflow: 'hidden',
          outline: 'none',
          border: `2px solid ${currentColors.primary}`,
          boxShadow: `0 0 30px ${currentColors.glow}60`,
          '&:focus': {
            outline: 'none'
          }
        }}
      >
        {/* Header com título do jogo */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            left: 0,
            right: 0,
            zIndex: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 700,
              textShadow: `0 0 10px ${currentColors.glow}60`,
              filter: `drop-shadow(0 0 8px ${currentColors.glow}40)`
            }}
          >
            {gameTitle} - Trailer
          </Typography>

          <IconButton
            onClick={handleClose}
            sx={{
              bgcolor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              border: `1px solid ${currentColors.primary}60`,
              boxShadow: `0 0 15px ${currentColors.glow}40`,
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.9)',
                borderColor: currentColors.primary,
                boxShadow: `0 0 25px ${currentColors.glow}60`,
                transform: 'scale(1.05)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Container do player */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            position: 'relative',
            bgcolor: '#000',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          {/* YouTube iframe player */}
          {videoId && (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1&fs=1&cc_load_policy=0&iv_load_policy=3`}
              title={`${gameTitle} - Trailer`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}

          {/* Loading overlay - só aparece quando não está pronto */}
          {!isPlayerReady && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0, 0, 0, 0.9)',
                color: 'white',
                zIndex: 100,
                backdropFilter: 'blur(5px)'
              }}
            >
              <PlayIcon
                sx={{
                  fontSize: 64,
                  color: currentColors.primary,
                  mb: 2,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                    '50%': { opacity: 0.7, transform: 'scale(1.1)' }
                  }
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                Carregando trailer...
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default TrailerModal;