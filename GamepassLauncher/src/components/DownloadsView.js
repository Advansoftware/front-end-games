import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Chip,
  IconButton,
  Button,
  Grid,
  Avatar,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip,
  Badge
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download as DownloadIcon,
  Pause as PauseIcon,
  PlayArrow as ResumeIcon,
  Stop as CancelIcon,
  CheckCircle as CompleteIcon,
  Error as ErrorIcon,
  Speed as SpeedIcon,
  Storage as SizeIcon,
  Schedule as TimeIcon,
  CloudDownload as CloudIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  GetApp as InstallIcon,
  Update as UpdateIcon,
  Folder as FolderIcon,
  Info as InfoIcon,
  Star as PriorityIcon,
  SignalWifi4Bar as NetworkIcon,
  Memory as RAMIcon,
  DeviceHub as CPUIcon
} from '@mui/icons-material';
import { useDownloads } from '../hooks/useDownloads';
import { useTheme } from '../contexts/ThemeContext';
import CustomButton from './CustomButton';

const DownloadsView = () => {
  const {
    getDownloadStats,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    retryDownload,
    activeDownloads,
    downloadHistory
  } = useDownloads();
  const { currentTheme, playSound } = useTheme();

  const [filter, setFilter] = useState('all'); // all, downloading, completed, paused, failed
  const [selectedDownload, setSelectedDownload] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [systemStats, setSystemStats] = useState({
    totalBandwidth: '125.6 MB/s',
    activeCores: 8,
    ramUsage: '2.4 GB',
    diskSpace: '478 GB'
  });

  // Obter estatísticas em tempo real
  const downloadStats = getDownloadStats();
  const activeDownloadsArray = Array.from(activeDownloads.values());

  // Cores por tema
  const themeColors = {
    xbox: {
      primary: '#107C10',
      secondary: '#0E6A0E',
      accent: '#40E040',
      glow: '#40E040'
    },
    ps5: {
      primary: '#0070F3',
      secondary: '#0051CC',
      accent: '#40B4FF',
      glow: '#40B4FF'
    },
    switch: {
      primary: '#E60012',
      secondary: '#CC0010',
      accent: '#FF4040',
      glow: '#FF4040'
    }
  };

  const currentColors = themeColors[currentTheme];

  // Filtrar downloads baseado no filtro atual
  const filteredDownloads = activeDownloadsArray.filter(download => {
    if (filter === 'all') return true;
    return download.status === filter;
  });

  // Ícone e cor por status
  const getStatusConfig = (status) => {
    switch (status) {
      case 'downloading':
        return { icon: DownloadIcon, color: currentColors.primary, label: 'Baixando' };
      case 'completed':
        return { icon: CompleteIcon, color: '#4CAF50', label: 'Concluído' };
      case 'paused':
        return { icon: PauseIcon, color: '#FF9800', label: 'Pausado' };
      case 'failed':
      case 'cancelled':
        return { icon: ErrorIcon, color: '#F44336', label: 'Erro' };
      default:
        return { icon: InfoIcon, color: '#757575', label: 'Desconhecido' };
    }
  };

  // Ações por status usando as funções do contexto
  const handleAction = (download, action) => {
    playSound('confirm');

    switch (action) {
      case 'pause':
        pauseDownload(download.id);
        break;
      case 'resume':
        resumeDownload(download.id);
        break;
      case 'cancel':
        cancelDownload(download.id);
        break;
      case 'retry':
        retryDownload(download.id);
        break;
      default:
        console.warn(`Ação desconhecida: ${action}`);
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: 'background.default',
        color: 'text.primary'
      }}
    >
      {/* Background com efeitos visuais avançados */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme => `
            radial-gradient(circle at 20% 80%, ${currentColors.primary}15 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${currentColors.accent}10 0%, transparent 50%),
            linear-gradient(135deg, 
              ${theme.palette.background.default} 0%, 
              ${theme.palette.background.paper} 25%,
              ${currentColors.primary}05 50%,
              ${theme.palette.background.default} 75%,
              ${currentColors.secondary}08 100%)
          `,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 100px,
                ${currentColors.glow}02 101px,
                ${currentColors.glow}02 102px
              )
            `,
            animation: 'moveLines 20s linear infinite'
          },
          '@keyframes moveLines': {
            '0%': { transform: 'translateX(-100px)' },
            '100%': { transform: 'translateX(100px)' }
          }
        }}
      />

      {/* Conteúdo principal */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          overflow: 'auto',
          p: 4
        }}
      >
        {/* Header futurista */}
        <Box sx={{ mb: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                mb: 2,
                background: `linear-gradient(45deg, ${currentColors.primary}, ${currentColors.accent})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: `drop-shadow(0 0 20px ${currentColors.glow}40)`,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <CloudIcon sx={{
                fontSize: '3rem',
                color: currentColors.primary,
                filter: `drop-shadow(0 0 15px ${currentColors.glow}60)`
              }} />
              Central de Downloads
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                opacity: 0.9,
                maxWidth: 600
              }}
            >
              Gerencie seus downloads com tecnologia de ponta e controle total sobre o processo
            </Typography>
          </motion.div>
        </Box>

        <Grid container spacing={3}>
          {/* Painel de estatísticas do sistema */}
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card
                sx={{
                  bgcolor: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${currentColors.primary}30`,
                  borderRadius: 3,
                  boxShadow: `0 10px 40px ${currentColors.primary}15`,
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {/* Efeito de brilho animado */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(90deg, transparent, ${currentColors.glow}10, transparent)`,
                    animation: 'shimmer 3s infinite',
                    '@keyframes shimmer': {
                      '0%': { left: '-100%' },
                      '100%': { left: '100%' }
                    }
                  }}
                />

                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3} alignItems="center">
                    {/* Estatísticas de downloads */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ mb: 2, color: currentColors.primary, fontWeight: 700 }}>
                        Status dos Downloads
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ color: currentColors.primary, fontWeight: 900 }}>
                              {downloadStats.downloading}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Ativo
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ color: '#4CAF50', fontWeight: 900 }}>
                              {downloadStats.completed}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Concluído
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ color: '#FF9800', fontWeight: 900 }}>
                              {downloadStats.paused}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Pausado
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ color: '#F44336', fontWeight: 900 }}>
                              {downloadStats.failed}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Erro
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Estatísticas do sistema */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ mb: 2, color: currentColors.accent, fontWeight: 700 }}>
                        Performance do Sistema
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <NetworkIcon sx={{ color: currentColors.primary, fontSize: 20 }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Velocidade Total
                            </Typography>
                          </Box>
                          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700 }}>
                            {downloadStats.totalSpeed.toFixed(1)} MB/s
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <RAMIcon sx={{ color: currentColors.accent, fontSize: 20 }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Memória RAM
                            </Typography>
                          </Box>
                          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700 }}>
                            {systemStats.ramUsage}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <CPUIcon sx={{ color: currentColors.secondary, fontSize: 20 }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              CPU Cores
                            </Typography>
                          </Box>
                          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700 }}>
                            {systemStats.activeCores}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <SizeIcon sx={{ color: currentColors.glow, fontSize: 20 }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Espaço Livre
                            </Typography>
                          </Box>
                          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700 }}>
                            {systemStats.diskSpace}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Filtros avançados */}
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                {[
                  { id: 'all', label: 'Todos', count: downloadStats.total },
                  { id: 'downloading', label: 'Baixando', count: downloadStats.downloading },
                  { id: 'completed', label: 'Concluídos', count: downloadStats.completed },
                  { id: 'paused', label: 'Pausados', count: downloadStats.paused },
                  { id: 'failed', label: 'Com Erro', count: downloadStats.failed }
                ].map((filterItem) => (
                  <CustomButton
                    key={filterItem.id}
                    variant={filter === filterItem.id ? 'contained' : 'outlined'}
                    onClick={() => setFilter(filterItem.id)}
                    sx={{
                      borderRadius: 25,
                      px: 3,
                      py: 1,
                      position: 'relative',
                      overflow: 'hidden',
                      ...(filter === filterItem.id && {
                        background: `linear-gradient(45deg, ${currentColors.primary}, ${currentColors.accent})`,
                        boxShadow: `0 8px 25px ${currentColors.primary}40`
                      })
                    }}
                  >
                    {filterItem.label}
                    {filterItem.count > 0 && (
                      <Chip
                        label={filterItem.count}
                        size="small"
                        sx={{
                          ml: 1,
                          height: 20,
                          bgcolor: filter === filterItem.id ? 'rgba(255,255,255,0.2)' : currentColors.primary,
                          color: 'white',
                          fontSize: '0.7rem'
                        }}
                      />
                    )}
                  </CustomButton>
                ))}
              </Stack>
            </motion.div>
          </Grid>

          {/* Lista de downloads */}
          <Grid item xs={12}>
            <AnimatePresence>
              {filteredDownloads.map((download, index) => {
                const statusConfig = getStatusConfig(download.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <motion.div
                    key={download.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    style={{ marginBottom: 16 }}
                  >
                    <Card
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(15px)',
                        border: `1px solid ${statusConfig.color}30`,
                        borderRadius: 3,
                        boxShadow: `0 8px 25px ${statusConfig.color}15`,
                        overflow: 'hidden',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 12px 35px ${statusConfig.color}25`,
                          border: `1px solid ${statusConfig.color}50`
                        }
                      }}
                    >
                      {/* Barra de progresso animada no topo */}
                      {download.status === 'downloading' && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            background: `linear-gradient(90deg, ${currentColors.primary}, ${currentColors.accent})`,
                            animation: 'pulse 2s infinite'
                          }}
                        />
                      )}

                      <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={3} alignItems="center">
                          {/* Imagem e info básica */}
                          <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                src={download.image}
                                sx={{
                                  width: 60,
                                  height: 60,
                                  borderRadius: 2,
                                  border: `2px solid ${statusConfig.color}50`
                                }}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: 'text.primary',
                                    fontWeight: 700,
                                    mb: 0.5
                                  }}
                                >
                                  {download.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <StatusIcon sx={{ color: statusConfig.color, fontSize: 16 }} />
                                  <Typography variant="body2" sx={{ color: statusConfig.color }}>
                                    {statusConfig.label}
                                  </Typography>
                                  {download.priority === 'high' && (
                                    <PriorityIcon sx={{ color: '#FF9800', fontSize: 16 }} />
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          </Grid>

                          {/* Progresso e estatísticas */}
                          <Grid item xs={12} md={5}>
                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  {download.downloaded} / {download.size}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: download.status === 'downloading' ? currentColors.primary : 'text.secondary',
                                    fontWeight: 600
                                  }}
                                >
                                  {download.progress}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={download.progress}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: 'rgba(255,255,255,0.1)',
                                  '& .MuiLinearProgress-bar': {
                                    background: download.status === 'downloading'
                                      ? `linear-gradient(90deg, ${currentColors.primary}, ${currentColors.accent})`
                                      : statusConfig.color,
                                    borderRadius: 4,
                                    ...(download.status === 'downloading' && {
                                      animation: 'progress 2s ease-in-out infinite',
                                      '@keyframes progress': {
                                        '0%': { filter: 'brightness(1)' },
                                        '50%': { filter: 'brightness(1.3)' },
                                        '100%': { filter: 'brightness(1)' }
                                      }
                                    })
                                  }
                                }}
                              />
                            </Box>

                            <Grid container spacing={2}>
                              <Grid item xs={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <SpeedIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {download.speed}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <TimeIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {download.eta}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <SizeIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {download.size}
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </Grid>

                          {/* Ações */}
                          <Grid item xs={12} md={3}>
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              {download.status === 'downloading' && (
                                <Tooltip title="Pausar">
                                  <IconButton
                                    onClick={() => handleAction(download, 'pause')}
                                    sx={{
                                      color: '#FF9800',
                                      bgcolor: 'rgba(255, 152, 0, 0.1)',
                                      '&:hover': {
                                        bgcolor: 'rgba(255, 152, 0, 0.2)',
                                        transform: 'scale(1.1)'
                                      }
                                    }}
                                  >
                                    <PauseIcon />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {download.status === 'paused' && (
                                <Tooltip title="Retomar">
                                  <IconButton
                                    onClick={() => handleAction(download, 'resume')}
                                    sx={{
                                      color: currentColors.primary,
                                      bgcolor: `${currentColors.primary}10`,
                                      '&:hover': {
                                        bgcolor: `${currentColors.primary}20`,
                                        transform: 'scale(1.1)'
                                      }
                                    }}
                                  >
                                    <ResumeIcon />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {download.status === 'failed' && (
                                <Tooltip title="Tentar Novamente">
                                  <IconButton
                                    onClick={() => handleAction(download, 'retry')}
                                    sx={{
                                      color: '#4CAF50',
                                      bgcolor: 'rgba(76, 175, 80, 0.1)',
                                      '&:hover': {
                                        bgcolor: 'rgba(76, 175, 80, 0.2)',
                                        transform: 'scale(1.1)'
                                      }
                                    }}
                                  >
                                    <RefreshIcon />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {(download.status === 'downloading' || download.status === 'paused') && (
                                <Tooltip title="Cancelar">
                                  <IconButton
                                    onClick={() => handleAction(download, 'cancel')}
                                    sx={{
                                      color: '#F44336',
                                      bgcolor: 'rgba(244, 67, 54, 0.1)',
                                      '&:hover': {
                                        bgcolor: 'rgba(244, 67, 54, 0.2)',
                                        transform: 'scale(1.1)'
                                      }
                                    }}
                                  >
                                    <CancelIcon />
                                  </IconButton>
                                </Tooltip>
                              )}

                              <Tooltip title="Detalhes">
                                <IconButton
                                  onClick={() => {
                                    setSelectedDownload(download);
                                    setShowDetails(true);
                                  }}
                                  sx={{
                                    color: 'text.secondary',
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    '&:hover': {
                                      bgcolor: 'rgba(255,255,255,0.1)',
                                      transform: 'scale(1.1)'
                                    }
                                  }}
                                >
                                  <InfoIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Mensagem quando não há downloads */}
            {filteredDownloads.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(15px)',
                    border: `1px solid ${currentColors.primary}20`,
                    borderRadius: 3,
                    textAlign: 'center',
                    py: 6
                  }}
                >
                  <CardContent>
                    <CloudIcon
                      sx={{
                        fontSize: 80,
                        color: currentColors.primary,
                        opacity: 0.5,
                        mb: 2
                      }}
                    />
                    <Typography variant="h5" sx={{ color: 'text.primary', mb: 1 }}>
                      Nenhum download encontrado
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      {filter === 'all'
                        ? 'Você ainda não iniciou nenhum download'
                        : `Nenhum download com status "${filter}"`
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Modal de detalhes */}
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(8, 16, 20, 0.95)',
            backdropFilter: 'blur(30px)',
            border: `2px solid ${currentColors.primary}30`,
            borderRadius: 3,
            color: 'text.primary'
          }
        }}
      >
        {selectedDownload && (
          <>
            <DialogTitle sx={{
              borderBottom: `1px solid ${currentColors.primary}20`,
              pb: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={selectedDownload.image}
                  sx={{ width: 50, height: 50, borderRadius: 2 }}
                />
                <Box>
                  <Typography variant="h6" sx={{ color: 'text.primary' }}>
                    {selectedDownload.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Detalhes do Download
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>

            <DialogContent sx={{ py: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: currentColors.primary }}>
                    Informações Gerais
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Status</Typography>
                      <Typography variant="body1" sx={{ color: getStatusConfig(selectedDownload.status).color }}>
                        {getStatusConfig(selectedDownload.status).label}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Progresso</Typography>
                      <Typography variant="body1">{selectedDownload.progress}%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Tamanho Total</Typography>
                      <Typography variant="body1">{selectedDownload.size}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Baixado</Typography>
                      <Typography variant="body1">{selectedDownload.downloaded}</Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: currentColors.accent }}>
                    Performance
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Velocidade</Typography>
                      <Typography variant="body1">{selectedDownload.speed}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Tempo Restante</Typography>
                      <Typography variant="body1">{selectedDownload.eta}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Prioridade</Typography>
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {selectedDownload.priority}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: `1px solid ${currentColors.primary}20` }}>
              <CustomButton
                onClick={() => setShowDetails(false)}
                variant="outlined"
              >
                Fechar
              </CustomButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default DownloadsView;