import React, { useEffect, useState } from 'react';
import {
  Modal,
  Backdrop,
  Fade,
  Box,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import {
  Close as CloseIcon,
  YouTube as YouTubeIcon,
  SportsEsports as GamepadIcon
} from '@mui/icons-material';
import { useModalNavigation } from '../hooks/useModalNavigation';
import YouTubePlayer from './YouTubePlayer';
import CustomButton from './CustomButton';

const TrailerModal = ({
  open,
  onClose,
  videoId,
  gameTitle = 'Trailer'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  // Integração com gamepad
  const { handleClose } = useModalNavigation({
    isOpen: open,
    onClose: onClose,
    disabled: false
  });

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

  if (!videoId) return null;

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: {
          backgroundColor: 'rgba(0,0,0,0.95)',
          zIndex: 16000
        }
      }}
      sx={{
        zIndex: 16000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'relative',
            width: { xs: '95%', sm: '90%', md: '85%', lg: '80%' },
            maxWidth: '1200px',
            height: { xs: '70%', md: '80%' },
            maxHeight: '800px',
            bgcolor: 'rgba(8, 16, 20, 0.98)',
            backdropFilter: 'blur(30px)',
            border: '2px solid rgba(255,255,255,0.15)',
            borderRadius: 3,
            boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'modalScale 0.3s ease-out',
            '@keyframes modalScale': {
              '0%': {
                transform: 'scale(0.8)',
                opacity: 0
              },
              '100%': {
                transform: 'scale(1)',
                opacity: 1
              }
            }
          }}
        >
          {/* Header elegante do modal */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: { xs: 2, md: 3 },
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.8) 0%, rgba(233, 30, 99, 0.8) 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <YouTubeIcon sx={{ color: 'white', fontSize: { xs: 24, md: 28 } }} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    fontWeight: 900,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                    fontSize: { xs: '1.2rem', md: '1.5rem' }
                  }}
                >
                  Trailer
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 500,
                    fontSize: { xs: '0.85rem', md: '0.95rem' }
                  }}
                >
                  {gameTitle}
                </Typography>
              </Box>
            </Box>

            <IconButton
              onClick={handleCloseModal}
              sx={{
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': {
                  bgcolor: 'rgba(244, 67, 54, 0.8)',
                  transform: 'scale(1.1)',
                  border: '1px solid rgba(255,255,255,0.4)'
                },
                transition: 'all 0.3s ease',
                size: { xs: 'small', md: 'medium' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Container do player com design aprimorado */}
          <Box
            sx={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 1, md: 2 },
              background: 'linear-gradient(135deg, rgba(8, 16, 20, 0.95) 0%, rgba(16, 24, 32, 0.95) 100%)'
            }}
          >
            {/* Frame decorativo ao redor do player */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                border: '3px solid transparent',
                background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.3), rgba(233, 30, 99, 0.3)) border-box',
                boxShadow: `
                  0 0 30px rgba(244, 67, 54, 0.3),
                  inset 0 0 30px rgba(0,0,0,0.2),
                  0 20px 40px rgba(0,0,0,0.4)
                `
              }}
            >
              {/* Player do YouTube */}
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 2,
                  width: '100%',
                  height: '100%',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                <YouTubePlayer
                  videoId={videoId}
                  opts={{
                    width: '100%',
                    height: '100%',
                    playerVars: {
                      autoplay: 1,
                      controls: 1,
                      disablekb: 0,
                      enablejsapi: 1,
                      fs: 1,
                      iv_load_policy: 3,
                      modestbranding: 1,
                      playsinline: 1,
                      rel: 0,
                      showinfo: 0,
                      origin: window.location.origin
                    }
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px'
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Footer com informações adicionais */}
          <Box
            sx={{
              p: { xs: 1.5, md: 2 },
              background: 'linear-gradient(135deg, rgba(16, 24, 32, 0.9) 0%, rgba(8, 16, 20, 0.9) 100%)',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                textAlign: 'center',
                fontSize: { xs: '0.75rem', md: '0.85rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <YouTubeIcon sx={{ fontSize: 16, opacity: 0.7 }} />
              Pressione ESC para fechar ou clique fora do modal
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default TrailerModal;