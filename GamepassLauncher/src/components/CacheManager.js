import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Stack,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider
} from '@mui/material';
import {
  CloudDownload as CacheIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  Image as ImageIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useGames } from '../contexts/GamesContext';
import CacheService from '../services/CacheService';

const CacheManager = () => {
  const { games, isElectronMode, cacheAllGamesData } = useGames();
  const [cacheStats, setCacheStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', title: '', message: '' });

  // Carregar estatísticas do cache
  const loadCacheStats = async () => {
    try {
      const stats = await CacheService.getSimpleStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas do cache:', error);
    }
  };

  useEffect(() => {
    if (isElectronMode) {
      loadCacheStats();
    }
  }, [isElectronMode]);

  // Configurar callback de progresso
  useEffect(() => {
    const handleProgress = (progressData) => {
      setProgress(progressData);
    };

    if (isElectronMode) {
      CacheService.onProgress(handleProgress);
    }

    return () => {
      if (isElectronMode) {
        CacheService.removeProgressListener(handleProgress);
      }
    };
  }, [isElectronMode]);

  // Cachear todos os jogos
  const handleCacheAllGames = async () => {
    if (!isElectronMode) return;

    setLoading(true);
    try {
      const success = await cacheAllGamesData();
      if (success) {
        await loadCacheStats();
      }
    } catch (error) {
      console.error('Erro no cache em lote:', error);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  // Limpar cache
  const handleClearCache = async (type) => {
    setLoading(true);
    try {
      const success = await CacheService.clearCache(type);
      if (success) {
        await loadCacheStats();
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, type: '', title: '', message: '' });
    }
  };

  // Confirmar limpeza
  const confirmClearCache = (type, title, message) => {
    setConfirmDialog({
      open: true,
      type,
      title,
      message
    });
  };

  if (!isElectronMode) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">
            O sistema de cache só está disponível na versão desktop (Electron).
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CacheIcon />
        Gerenciador de Cache
      </Typography>

      {/* Estatísticas do Cache */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StorageIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2">Jogos em Cache</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {cacheStats?.totalGames || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                de {games.length} total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ImageIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="subtitle2">Imagens</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {cacheStats?.imagesCount || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {cacheStats?.imagesSize || '0 B'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StorageIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="subtitle2">Tamanho Total</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {cacheStats?.totalSize || '0 B'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ScheduleIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="subtitle2">Última Atualização</Typography>
              </Box>
              <Typography variant="body1" color="info.main">
                {cacheStats?.lastUpdate ?
                  new Date(cacheStats.lastUpdate).toLocaleDateString() :
                  'Nunca'
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progresso do Cache */}
      {progress && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Processando Cache...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {progress.current} ({progress.processed}/{progress.total})
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress.percentage}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {progress.percentage}% concluído
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Ações de Cache
          </Typography>

          <Stack spacing={2}>
            {/* Cachear todos os jogos */}
            <Box>
              <Button
                variant="contained"
                startIcon={<CacheIcon />}
                onClick={handleCacheAllGames}
                disabled={loading || games.length === 0}
                fullWidth
              >
                Cachear Todos os Jogos ({games.length})
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Baixa dados detalhados e imagens de todos os jogos em segundo plano
              </Typography>
            </Box>

            <Divider />

            {/* Atualizar estatísticas */}
            <Box>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadCacheStats}
                disabled={loading}
                fullWidth
              >
                Atualizar Estatísticas
              </Button>
            </Box>

            <Divider />

            {/* Limpar cache de imagens */}
            <Box>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<DeleteIcon />}
                onClick={() => confirmClearCache(
                  'images',
                  'Limpar Cache de Imagens',
                  'Isso removerá todas as imagens baixadas. Os dados dos jogos serão mantidos.'
                )}
                disabled={loading}
                fullWidth
              >
                Limpar Cache de Imagens
              </Button>
            </Box>

            {/* Limpar tudo */}
            <Box>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => confirmClearCache(
                  'all',
                  'Limpar Todo o Cache',
                  'Isso removerá todos os dados e imagens em cache. Esta ação não pode ser desfeita.'
                )}
                disabled={loading}
                fullWidth
              >
                Limpar Todo o Cache
              </Button>
            </Box>
          </Stack>

          {/* Status do cache */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Status do Sistema
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={`Electron: ${isElectronMode ? 'Ativo' : 'Inativo'}`}
                color={isElectronMode ? 'success' : 'default'}
                size="small"
              />
              <Chip
                label={`Cache: ${cacheStats?.totalGames > 0 ? 'Disponível' : 'Vazio'}`}
                color={cacheStats?.totalGames > 0 ? 'success' : 'default'}
                size="small"
              />
              <Chip
                label={`Jogos: ${games.length}`}
                color="primary"
                size="small"
              />
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Dialog de Confirmação */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, type: '', title: '', message: '' })}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ open: false, type: '', title: '', message: '' })}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => handleClearCache(confirmDialog.type)}
            color="error"
            variant="contained"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CacheManager;