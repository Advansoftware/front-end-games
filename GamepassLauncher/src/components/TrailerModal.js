import React, { useEffect, useState } from 'react';
import {
  Modal,
  Box,
  IconButton,
  Typography,
  Stack
} from '@mui/material';
import {
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  SportsEsports as GamepadIcon,
  YouTube as YouTubeIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useModalNavigation } from '../hooks/useModalNavigation';
import CustomButton from './CustomButton';

const TrailerModal = ({
  open,
  onClose,
  videoId,
  gameTitle
}) => {
  const { currentTheme } = useTheme();
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  // Integração com gamepad
  const { handleClose } = useModalNavigation({
    isOpen: open,
    onClose: onClose,
    disabled: false
  });

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
      setIsPlayerReady(false);
      // Simular tempo de carregamento do iframe
      const timeout = setTimeout(() => {
        setIsPlayerReady(true);
      }, 1500);

      return () => clearTimeout(timeout);
    }

    if (!open) {
      setIsPlayerReady(false);
    }
  }, [open, videoId]);

  const handleCloseModal = () => {
    setIsPlayerReady(false);
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20000 // Z-index alto para ficar acima de outros modais
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
          border: '3px solid rgba(255,255,255,0.2)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header do modal com título e botão fechar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            bgcolor: 'rgba(0,0,0,0.8)',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <YouTubeIcon sx={{ color: '#FF0000' }} />
            Trailer: {gameTitle}
          </Typography>

          <IconButton
            onClick={handleCloseModal}
            sx={{
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                bgcolor: 'rgba(244, 67, 54, 0.8)',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Área do vídeo */}
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            bgcolor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
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
                bgcolor: 'rgba(0,0,0,0.9)',
                zIndex: 1
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  border: `4px solid ${currentColors.primary}`,
                  borderTop: '4px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  mb: 2,
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                Carregando trailer...
              </Typography>
            </Box>
          )}

          {videoId && (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title="Game Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                border: 'none',
                borderRadius: '0 0 12px 12px'
              }}
              onLoad={() => setIsPlayerReady(true)}
            />
          )}
        </Box>

        {/* Footer com botões de ação organizados */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'rgba(0,0,0,0.8)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Informações do vídeo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GamepadIcon sx={{ color: currentColors.primary, fontSize: 20 }} />
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255,255,255,0.7)' }}
            >
              Use B/Círculo para fechar
            </Typography>
          </Box>

          {/* Botões de ação */}
          <Stack direction="row" spacing={1}>
            <CustomButton
              variant="outlined"
              size="small"
              onClick={handleCloseModal}
              sx={{
                color: 'rgba(255,255,255,0.8)',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.6)',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Fechar
            </CustomButton>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
};

export default TrailerModal;