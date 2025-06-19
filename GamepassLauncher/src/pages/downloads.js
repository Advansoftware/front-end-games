import { useRouter } from 'next/router';
import { Box, Container, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import {
  ArrowBack as BackIcon,
  Minimize as MinimizeIcon,
  CropSquare as MaximizeIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import DownloadsView from '../components/DownloadsView';

const DownloadsPage = () => {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1a2e 50%, #16213e 100%)',
        color: 'text.primary'
      }}
    >
      {/* Header */}
      <AppBar
        position="fixed"
        sx={{
          bgcolor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          zIndex: 1300
        }}
      >
        <Toolbar>
          <IconButton
            onClick={handleBack}
            sx={{ color: 'text.primary', mr: 2 }}
          >
            <BackIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Downloads
          </Typography>

          {/* Controles de janela */}
          {typeof window !== 'undefined' && window.electronAPI && (
            <Box sx={{ display: 'flex' }}>
              <IconButton
                onClick={() => window.electronAPI.minimizeWindow()}
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                <MinimizeIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={() => window.electronAPI.maximizeWindow()}
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                <MaximizeIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={() => window.electronAPI.closeWindow()}
                size="small"
                sx={{
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.8)' }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Conteúdo */}
      <Box sx={{ pt: 8 }}>
        <DownloadsView />
      </Box>
    </Box>
  );
};

export default DownloadsPage;