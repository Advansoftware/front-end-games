import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Switch,
  LinearProgress,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  Storage as StorageIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Image as ImageIcon,
  CloudDownload as DownloadIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import CacheService from '../../../services/CacheService';
import CustomButton from '../../CustomButton';

const CacheSettings = () => {
  const [mounted, setMounted] = useState(false);
  const [cacheStatus, setCacheStatus] = useState({
    exists: false,
    games: 0,
    size: 0,
    images: { count: 0, sizeMB: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [autoCache, setAutoCache] = useState(true);
  const [clearDialog, setClearDialog] = useState({ open: false, type: '' });
  const [stats, setStats] = useState(null);

  // Aguardar hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  // Carregar status do cache após hidratação
  useEffect(() => {
    if (mounted) {
      loadCacheStatus();
    }
  }, [mounted]);

  const loadCacheStatus = async () => {
    setLoading(true);
    try {
      const status = await CacheService.getCacheStatus();
      const simpleStats = await CacheService.getSimpleStats();

      setCacheStatus(status);
      setStats(simpleStats);
    } catch (error) {
      console.error('Erro ao carregar status do cache:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async (type) => {
    setClearing(true);
    try {
      const success = await CacheService.clearCache(type);

      if (success) {
        await loadCacheStatus(); // Recarregar status
        setClearDialog({ open: false, type: '' });
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    } finally {
      setClearing(false);
    }
  };

  const openClearDialog = (type) => {
    setClearDialog({ open: true, type });
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Renderizar loading durante hidratação
  if (!mounted) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Carregando configurações...
        </Typography>
      </Box>
    );
  }

  if (!CacheService.isElectronMode()) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <WarningIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
          Cache não disponível no modo navegador
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          O sistema de cache funciona apenas no aplicativo Electron
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Status do Cache */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontWeight: 600 }}>
          Status do Cache
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Estatísticas Gerais
              </Typography>

              {loading ? (
                <LinearProgress sx={{ mb: 2 }} />
              ) : (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Jogos em Cache:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {stats?.totalGames || 0}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Tamanho Total:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {stats?.totalSize || '0 B'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Imagens Cacheadas:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {stats?.imagesCount || 0}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Tamanho das Imagens:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {stats?.imagesSize || '0 B'}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Configurações
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Cache Automático</Typography>
                  <Switch
                    checked={autoCache}
                    onChange={(e) => setAutoCache(e.target.checked)}
                    size="small"
                  />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Baixar automaticamente dados e imagens dos jogos
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Pré-carregar Imagens</Typography>
                  <Switch defaultChecked size="small" />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Baixar screenshots e capas em segundo plano
                </Typography>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Comprimir Imagens</Typography>
                  <Switch defaultChecked size="small" />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Reduzir tamanho das imagens para economizar espaço
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Ações de Cache */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontWeight: 600 }}>
          Gerenciamento do Cache
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                sx={{
                  bgcolor: 'rgba(255,255,255,0.05)',
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
                onClick={loadCacheStatus}
              >
                <RefreshIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Atualizar Status
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Recarregar informações do cache
                </Typography>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                sx={{
                  bgcolor: 'rgba(255,255,255,0.05)',
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
                onClick={() => openClearDialog('images')}
              >
                <ImageIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Limpar Imagens
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Removes todas as imagens em cache
                </Typography>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                sx={{
                  bgcolor: 'rgba(255,255,255,0.05)',
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(244,67,54,0.1)'
                  }
                }}
                onClick={() => openClearDialog('all')}
              >
                <DeleteIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Limpar Tudo
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Remove todo o cache (dados + imagens)
                </Typography>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Informações Adicionais */}
      <Box>
        <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontWeight: 600 }}>
          Informações
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            O cache armazena dados dos jogos e imagens para melhorar a performance e reduzir o uso de internet.
            Os dados são atualizados automaticamente a cada 7 dias.
          </Typography>
        </Alert>

        <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Localização do Cache
          </Typography>

          <List dense>
            <ListItem>
              <ListItemIcon>
                <StorageIcon sx={{ color: 'info.main' }} />
              </ListItemIcon>
              <ListItemText
                primary="Dados dos Jogos"
                secondary="~/cache/games/games_cache.json"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <ImageIcon sx={{ color: 'warning.main' }} />
              </ListItemIcon>
              <ListItemText
                primary="Imagens e Screenshots"
                secondary="~/cache/images/[gameId]/"
              />
            </ListItem>
          </List>
        </Card>
      </Box>

      {/* Dialog de Confirmação */}
      <Dialog
        open={clearDialog.open}
        onClose={() => setClearDialog({ open: false, type: '' })}
      >
        <DialogTitle>
          Confirmar Limpeza do Cache
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {clearDialog.type === 'all'
              ? 'Isso removerá TODOS os dados e imagens em cache. Os jogos precisarão baixar novamente as informações da internet.'
              : 'Isso removerá todas as imagens em cache. As imagens serão baixadas novamente quando necessário.'
            }
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, fontWeight: 600 }}>
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <CustomButton
            onClick={() => setClearDialog({ open: false, type: '' })}
            variant="outlined"
          >
            Cancelar
          </CustomButton>
          <CustomButton
            onClick={() => handleClearCache(clearDialog.type)}
            variant="contained"
            color="error"
            disabled={clearing}
          >
            {clearing ? 'Limpando...' : 'Confirmar'}
          </CustomButton>
        </DialogActions>
      </Dialog>

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <CustomButton variant="outlined">
          Exportar Configurações
        </CustomButton>
        <CustomButton variant="contained">
          Salvar Configurações
        </CustomButton>
      </Box>
    </Box>
  );
};

export default CacheSettings;
