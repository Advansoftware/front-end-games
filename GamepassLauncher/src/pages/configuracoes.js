import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Container, AppBar, Toolbar, IconButton, Typography, Chip } from '@mui/material';
import {
  ArrowBack as BackIcon,
  Minimize as MinimizeIcon,
  CropSquare as MaximizeIcon,
  Close as CloseIcon,
  SportsEsports as GamepadIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import SettingsNavigation from '../components/settings/SettingsNavigation';
import SettingsContent from '../components/settings/SettingsContent';
import { useSettingsNavigation } from '../hooks/useSettingsNavigation';

const ConfiguracoesPage = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedSection, setSelectedSection] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Aguardar hidratação completa
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBack = () => {
    router.push('/');
  };

  // Hook de navegação para configurações (apenas B para voltar)
  const { navigationInfo } = useSettingsNavigation({
    onBack: handleBack,
    router
  });

  // Mostrar loading durante hidratação
  if (!mounted) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1a2e 50%, #16213e 100%)',
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant="h5" sx={{ color: 'text.primary' }}>
          Carregando configurações...
        </Typography>
      </Box>
    );
  }

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
            Configurações
          </Typography>

          {/* Indicador de gamepad conectado */}
          {navigationInfo.gamepadConnected && (
            <Chip
              icon={<GamepadIcon />}
              label="Controle conectado"
              size="small"
              color="success"
              variant="outlined"
              sx={{
                mr: 2,
                borderColor: 'success.main'
              }}
            />
          )}

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
      <Container maxWidth={false} sx={{ pt: 10, pb: 4 }}>
        <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 120px)' }}>
          {/* Navegação lateral */}
          <SettingsNavigation
            selectedCategory={selectedCategory}
            selectedSection={selectedSection}
            onCategoryChange={setSelectedCategory}
            onSectionChange={setSelectedSection}
          />

          {/* Conteúdo das configurações */}
          <SettingsContent
            selectedCategory={selectedCategory}
            selectedSection={selectedSection}
          />
        </Box>
      </Container>

      {/* Dica de controles (apenas quando gamepad conectado) */}
      {navigationInfo.gamepadConnected && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            bgcolor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            p: 2,
            border: '1px solid rgba(255,255,255,0.1)',
            zIndex: 1000
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
            Controles do Gamepad:
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.primary', display: 'block' }}>
            B Voltar • Start Voltar
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ConfiguracoesPage;