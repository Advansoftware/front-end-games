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
import { useState } from 'react';

import DownloadsView from '../components/DownloadsView';
import { useDownloadsNavigation } from '../hooks/useDownloadsNavigation';
import { useDownloads } from '../hooks/useDownloads';

const DownloadsPage = () => {
  const router = useRouter();
  const { activeDownloads } = useDownloads();

  const handleBack = () => {
    router.push('/');
  };

  // Dados dos filtros
  const filters = [
    { id: 'all', label: 'Todos' },
    { id: 'downloading', label: 'Baixando' },
    { id: 'completed', label: 'Concluídos' },
    { id: 'paused', label: 'Pausados' },
    { id: 'failed', label: 'Com Erro' }
  ];

  const [currentFilter, setCurrentFilter] = useState('all');
  const [showDetails, setShowDetails] = useState(false);

  // Converter downloads ativos para array e filtrar
  const activeDownloadsArray = Array.from(activeDownloads.values());
  const filteredDownloads = activeDownloadsArray.filter(download => {
    if (currentFilter === 'all') return true;
    return download.status === currentFilter;
  });

  // Hook de navegação para downloads com navegação complexa
  const {
    focusMode,
    currentFilterIndex,
    currentDownloadIndex,
    currentActionIndex,
    navigationInfo,
    getFilterProps,
    getDownloadProps,
    getActionProps
  } = useDownloadsNavigation({
    onBack: handleBack,
    router,
    downloads: filteredDownloads, // Passar downloads filtrados
    filters,
    currentFilter,
    onFilterChange: setCurrentFilter,
    modalsOpen: { details: showDetails },
    onCloseModals: { details: () => setShowDetails(false) }
  });

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

          {/* Indicador de navegação com gamepad */}
          {navigationInfo.gamepadConnected && (
            <Chip
              icon={<GamepadIcon />}
              label={`${focusMode === 'filters' ? 'Filtros' :
                focusMode === 'downloads' ? 'Downloads' : 'Ações'} ${focusMode === 'filters' ? currentFilterIndex + 1 :
                  focusMode === 'downloads' ? currentDownloadIndex + 1 :
                    currentActionIndex + 1}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{
                mr: 2,
                borderColor: 'primary.main'
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
      <Box sx={{ pt: 8 }}>
        <DownloadsView
          filters={filters}
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
          getFilterProps={getFilterProps}
          getDownloadProps={getDownloadProps}
          getActionProps={getActionProps}
          showDetails={showDetails}
          onShowDetails={setShowDetails}
          filteredDownloads={filteredDownloads} // Passar downloads já filtrados
        />
      </Box>

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
            Modo: {focusMode === 'filters' ? 'Filtros' :
              focusMode === 'downloads' ? 'Downloads' : 'Ações'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.primary', display: 'block' }}>
            {focusMode === 'filters' ? '↔️ Navegar • ↓ Downloads • A Selecionar' :
              focusMode === 'downloads' ? '↕️ Navegar • ↑ Filtros • → Ações • A Selecionar' :
                '↕️ Navegar • ← Downloads • A Executar'} • B Voltar
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DownloadsPage;