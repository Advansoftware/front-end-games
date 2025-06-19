import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Slider,
  Avatar,
  IconButton,
  Tooltip,
  Stack,
  Paper,
  Tab,
  Tabs
} from '@mui/material';
import {
  VolumeUp as SoundIcon,
  Download as DownloadIcon,
  Update as UpdateIcon,
  Folder as FolderIcon,
  Games as GamesIcon,
  Security as SecurityIcon,
  Storage as CacheIcon,
  Delete as DeleteIcon,
  Palette as ThemeIcon,
  DisplaySettings as DisplayIcon,
  Gamepad as GamepadIcon,
  Notifications as NotificationIcon,
  CloudDownload as CloudIcon,
  Settings as SettingsIcon,
  Brightness4 as BrightnessIcon,
  Language as LanguageIcon,
  VolumeDown as VolumeDownIcon,
  VolumeOff as VolumeOffIcon,
  Wifi as WifiIcon,
  Memory as MemoryIcon,
  Speed as PerformanceIcon,
  AutoMode as AutoIcon,
  Restore as RestoreIcon,
  SaveAlt as ExportIcon,
  Publish as ImportIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useGames } from '../contexts/GamesContext';
import { useGamepad } from '../hooks/useGamepad';
import CacheService from '../services/CacheService';
import CustomButton from './CustomButton';

const SettingsPanel = () => {
  const { soundsEnabled, toggleSounds, currentTheme, changeTheme, playSound } = useTheme();
  const { API_CONFIG, syncWithRemoteAPI } = useGames();
  const gamepad = useGamepad();

  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedSection, setSelectedSection] = useState(0);
  const [downloadPath, setDownloadPath] = useState('./downloads');
  const [yuzuPath, setYuzuPath] = useState('./emulators/yuzu');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [lastUpdateCheck, setLastUpdateCheck] = useState(new Date().toLocaleString());
  const [cacheSize, setCacheSize] = useState(245);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [soundVolume, setSoundVolume] = useState(80);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState('pt-BR');
  const [performanceMode, setPerformanceMode] = useState('balanced');

  // Cores por tema
  const themeColors = {
    xbox: {
      primary: '#107C10',
      secondary: '#0E6A0E',
      accent: '#40E040',
      glow: '#40E040',
      background: 'linear-gradient(135deg, #0C1618 0%, #1A2B32 50%, #107C10 100%)'
    },
    ps5: {
      primary: '#0070F3',
      secondary: '#0051CC',
      accent: '#40B4FF',
      glow: '#40B4FF',
      background: 'linear-gradient(135deg, #0C1618 0%, #1A2B32 50%, #0070F3 100%)'
    },
    switch: {
      primary: '#E60012',
      secondary: '#CC0010',
      accent: '#FF4040',
      glow: '#FF4040',
      background: 'linear-gradient(135deg, #0C1618 0%, #1A2B32 50%, #E60012 100%)'
    }
  };

  const currentColors = themeColors[currentTheme];

  const categories = [
    {
      id: 'appearance',
      label: 'Aparência',
      icon: ThemeIcon,
      sections: [
        { id: 'themes', label: 'Temas', icon: ThemeIcon },
        { id: 'display', label: 'Display', icon: DisplayIcon },
        { id: 'ui', label: 'Interface', icon: SettingsIcon }
      ]
    },
    {
      id: 'audio',
      label: 'Áudio & Som',
      icon: SoundIcon,
      sections: [
        { id: 'sounds', label: 'Sons', icon: SoundIcon },
        { id: 'volume', label: 'Volume', icon: VolumeDownIcon },
        { id: 'notifications', label: 'Notificações', icon: NotificationIcon }
      ]
    },
    {
      id: 'gaming',
      label: 'Gaming',
      icon: GamesIcon,
      sections: [
        { id: 'emulator', label: 'Emulador', icon: GamesIcon },
        { id: 'gamepad', label: 'Controle', icon: GamepadIcon },
        { id: 'performance', label: 'Performance', icon: PerformanceIcon }
      ]
    },
    {
      id: 'system',
      label: 'Sistema',
      icon: SettingsIcon,
      sections: [
        { id: 'downloads', label: 'Downloads', icon: DownloadIcon },
        { id: 'updates', label: 'Atualizações', icon: UpdateIcon },
        { id: 'cache', label: 'Cache & Dados', icon: CacheIcon }
      ]
    },
    {
      id: 'advanced',
      label: 'Avançado',
      icon: SecurityIcon,
      sections: [
        { id: 'network', label: 'Rede', icon: WifiIcon },
        { id: 'backup', label: 'Backup', icon: ExportIcon },
        { id: 'debug', label: 'Debug', icon: InfoIcon }
      ]
    }
  ];

  const currentCategory = categories[selectedCategory];
  const currentSection = currentCategory?.sections[selectedSection];

  // Navegação com gamepad
  useEffect(() => {
    const handleGamepadNavigation = () => {
      const nav = gamepad.getNavigationInput();

      if (nav.leftBumper && selectedCategory > 0) {
        setSelectedCategory(prev => prev - 1);
        setSelectedSection(0);
        playSound('navigate');
      }

      if (nav.rightBumper && selectedCategory < categories.length - 1) {
        setSelectedCategory(prev => prev + 1);
        setSelectedSection(0);
        playSound('navigate');
      }

      if (nav.up && selectedSection > 0) {
        setSelectedSection(prev => prev - 1);
        playSound('navigate');
      }

      if (nav.down && selectedSection < currentCategory?.sections.length - 1) {
        setSelectedSection(prev => prev + 1);
        playSound('navigate');
      }
    };

    if (gamepad.gamepadConnected) {
      const interval = setInterval(handleGamepadNavigation, 150);
      return () => clearInterval(interval);
    }
  }, [gamepad, selectedCategory, selectedSection, categories.length, currentCategory?.sections.length, playSound]);

  // Funções auxiliares
  const handleSelectPath = async (type) => {
    if (window.electronAPI) {
      const result = await window.electronAPI.showDialog('open', {
        properties: ['openDirectory'],
        title: `Selecionar pasta para ${type}`
      });

      if (result.success && !result.result.canceled) {
        const path = result.result.filePaths[0];
        if (type === 'downloads') {
          setDownloadPath(path);
        } else if (type === 'yuzu') {
          setYuzuPath(path);
        }
        playSound('confirm');
      }
    }
  };

  const handleCheckUpdates = async () => {
    setCheckingUpdates(true);
    playSound('confirm');
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLastUpdateCheck(new Date().toLocaleString());
      await syncWithRemoteAPI();
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
    } finally {
      setCheckingUpdates(false);
    }
  };

  const handleThemeChange = (theme) => {
    changeTheme(theme);
    playSound('confirm');
  };

  const handleClearCache = async () => {
    playSound('confirm');
    setDialogOpen(false);
    try {
      await CacheService.clearCache();
      setCacheSize(0);
      if (window.electronAPI) {
        window.electronAPI.showNotification('Cache Limpo', 'O cache foi limpo com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao limpar o cache:', error);
    }
  };

  const renderSectionContent = () => {
    if (!currentSection) return null;

    switch (currentSection.id) {
      case 'themes':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, color: currentColors.primary, fontWeight: 700 }}>
              Temas de Plataforma
            </Typography>

            <Grid container spacing={3}>
              {Object.entries(themeColors).map(([themeKey, colors]) => (
                <Grid item xs={12} md={4} key={themeKey}>
                  <Card
                    component={motion.div}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleThemeChange(themeKey)}
                    sx={{
                      cursor: 'pointer',
                      background: colors.background,
                      border: currentTheme === themeKey ? `3px solid ${colors.primary}` : `1px solid ${colors.primary}40`,
                      borderRadius: 3,
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: currentTheme === themeKey
                        ? `0 15px 40px ${colors.primary}30`
                        : `0 8px 25px ${colors.primary}15`,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {/* Indicador de tema ativo */}
                    {currentTheme === themeKey && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          background: `linear-gradient(45deg, ${colors.primary}, ${colors.accent})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 2
                        }}
                      >
                        <Typography sx={{ color: 'white', fontSize: '1.2rem' }}>✓</Typography>
                      </Box>
                    )}

                    {/* Efeito de brilho animado */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(90deg, transparent, ${colors.glow}20, transparent)`,
                        animation: currentTheme === themeKey ? 'shimmer 2s infinite' : 'none',
                        '@keyframes shimmer': {
                          '0%': { left: '-100%' },
                          '100%': { left: '100%' }
                        }
                      }}
                    />

                    <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            mx: 'auto',
                            mb: 2,
                            background: `linear-gradient(45deg, ${colors.primary}, ${colors.accent})`,
                            fontSize: '2rem'
                          }}
                        >
                          {themeKey === 'xbox' ? '🎮' : themeKey === 'ps5' ? '🎯' : '🎲'}
                        </Avatar>
                        <Typography
                          variant="h6"
                          sx={{
                            color: 'white',
                            fontWeight: 700,
                            mb: 1,
                            textTransform: 'capitalize'
                          }}
                        >
                          {themeKey === 'xbox' ? 'Xbox' : themeKey === 'ps5' ? 'PlayStation' : 'Nintendo Switch'}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(255,255,255,0.8)',
                            mb: 2
                          }}
                        >
                          {themeKey === 'xbox' ? 'Verde clássico do Xbox' :
                            themeKey === 'ps5' ? 'Azul icônico da PlayStation' :
                              'Vermelho vibrante do Switch'}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 12, height: 12, bgcolor: colors.primary, borderRadius: '50%' }} />
                          <Box sx={{ width: 12, height: 12, bgcolor: colors.accent, borderRadius: '50%' }} />
                          <Box sx={{ width: 12, height: 12, bgcolor: colors.secondary, borderRadius: '50%' }} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Card sx={{
              mt: 3,
              bgcolor: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${currentColors.primary}30`,
              borderRadius: 3
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: currentColors.accent }}>
                  Personalização Avançada
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />}
                      label="Modo Escuro"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Switch checked={true} disabled />}
                      label="Animações Avançadas"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      case 'sounds':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, color: currentColors.primary, fontWeight: 700 }}>
              Configurações de Som
            </Typography>

            <Card sx={{
              mb: 3,
              bgcolor: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${currentColors.primary}30`,
              borderRadius: 3
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SoundIcon sx={{ color: currentColors.primary, fontSize: 28 }} />
                    <Typography variant="h6">Sons de Navegação</Typography>
                  </Box>
                  <Switch
                    checked={soundsEnabled}
                    onChange={toggleSounds}
                    sx={{
                      '& .MuiSwitch-thumb': {
                        bgcolor: soundsEnabled ? currentColors.primary : 'grey.400'
                      },
                      '& .MuiSwitch-track': {
                        bgcolor: soundsEnabled ? `${currentColors.primary}50` : 'grey.600'
                      }
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  Sons personalizados baseados no tema selecionado com efeitos imersivos
                </Typography>

                <Typography variant="subtitle2" sx={{ mb: 2, color: currentColors.accent }}>
                  Volume dos Efeitos Sonoros
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <VolumeOffIcon sx={{ color: 'text.secondary' }} />
                  <Slider
                    value={soundVolume}
                    onChange={(e, value) => setSoundVolume(value)}
                    disabled={!soundsEnabled}
                    sx={{
                      color: currentColors.primary,
                      '& .MuiSlider-thumb': {
                        bgcolor: currentColors.primary,
                        boxShadow: `0 0 15px ${currentColors.glow}60`
                      },
                      '& .MuiSlider-track': {
                        background: `linear-gradient(90deg, ${currentColors.primary}, ${currentColors.accent})`
                      }
                    }}
                  />
                  <VolumeUp sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ color: currentColors.primary, minWidth: 35 }}>
                    {soundVolume}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{
              bgcolor: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${currentColors.primary}30`,
              borderRadius: 3
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Perfil de Som Atual
                </Typography>
                <Chip
                  label={`${currentTheme.toUpperCase()} SOUND PACK`}
                  sx={{
                    background: `linear-gradient(45deg, ${currentColors.primary}, ${currentColors.accent})`,
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    px: 2,
                    py: 1
                  }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
                  Cada tema possui sons únicos que complementam a experiência visual
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      case 'emulator':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, color: currentColors.primary, fontWeight: 700 }}>
              Configurações do Emulador
            </Typography>

            <Card sx={{
              mb: 3,
              bgcolor: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${currentColors.primary}30`,
              borderRadius: 3
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Yuzu Emulator
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
                  <TextField
                    fullWidth
                    value={yuzuPath}
                    onChange={(e) => setYuzuPath(e.target.value)}
                    label="Pasta do Yuzu"
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(255,255,255,0.05)',
                        '& fieldset': {
                          borderColor: `${currentColors.primary}30`
                        },
                        '&:hover fieldset': {
                          borderColor: `${currentColors.primary}50`
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: currentColors.primary
                        }
                      }
                    }}
                  />
                  <CustomButton
                    variant="outlined"
                    startIcon={<FolderIcon />}
                    onClick={() => handleSelectPath('yuzu')}
                    sx={{ minWidth: 120 }}
                  >
                    Procurar
                  </CustomButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <CustomButton
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() => playSound('confirm')}
                      fullWidth
                      sx={{
                        background: `linear-gradient(45deg, ${currentColors.primary}, ${currentColors.accent})`,
                        '&:hover': {
                          background: `linear-gradient(45deg, ${currentColors.secondary}, ${currentColors.primary})`
                        }
                      }}
                    >
                      Baixar Yuzu
                    </CustomButton>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomButton
                      variant="outlined"
                      startIcon={<CloudIcon />}
                      onClick={() => playSound('confirm')}
                      fullWidth
                    >
                      Baixar Firmware
                    </CustomButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{
              bgcolor: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${currentColors.primary}30`,
              borderRadius: 3
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Status dos Componentes
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { label: 'Yuzu Emulator', status: 'success', value: 'Instalado' },
                    { label: 'Firmware 17.0.1', status: 'warning', value: 'Pendente' },
                    { label: 'Prod Keys', status: 'error', value: 'Não encontrado' }
                  ].map((item, index) => (
                    <Grid item xs={12} key={index}>
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        bgcolor: 'rgba(255,255,255,0.03)',
                        borderRadius: 2,
                        border: `1px solid rgba(255,255,255,0.1)`
                      }}>
                        <Typography variant="body1">{item.label}</Typography>
                        <Chip
                          label={item.value}
                          color={item.status}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            ...(item.status === 'success' && {
                              bgcolor: '#4CAF50',
                              color: 'white'
                            })
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      case 'performance':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, color: currentColors.primary, fontWeight: 700 }}>
              Configurações de Performance
            </Typography>

            <Card sx={{
              mb: 3,
              bgcolor: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${currentColors.primary}30`,
              borderRadius: 3
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Modo de Performance
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={performanceMode}
                    onChange={(e) => setPerformanceMode(e.target.value)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.05)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: `${currentColors.primary}30`
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: `${currentColors.primary}50`
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: currentColors.primary
                      }
                    }}
                  >
                    <MenuItem value="performance">⚡ Performance Máxima</MenuItem>
                    <MenuItem value="balanced">⚖️ Balanceado</MenuItem>
                    <MenuItem value="quality">🎨 Qualidade Máxima</MenuItem>
                    <MenuItem value="battery">🔋 Economia de Energia</MenuItem>
                  </Select>
                </FormControl>

                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
                  {performanceMode === 'performance' && 'Prioriza FPS e responsividade, reduzindo efeitos visuais'}
                  {performanceMode === 'balanced' && 'Equilibra performance e qualidade visual'}
                  {performanceMode === 'quality' && 'Máxima qualidade visual, pode reduzir performance'}
                  {performanceMode === 'battery' && 'Otimizado para economia de energia em laptops'}
                </Typography>
              </CardContent>
            </Card>

            <Grid container spacing={2}>
              {[
                { icon: MemoryIcon, label: 'Uso de RAM', value: '2.4 GB', status: 'good' },
                { icon: PerformanceIcon, label: 'FPS Médio', value: '60 FPS', status: 'excellent' },
                { icon: BrightnessIcon, label: 'GPU Usage', value: '45%', status: 'good' }
              ].map((metric, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Card sx={{
                    bgcolor: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${currentColors.primary}30`,
                    borderRadius: 3,
                    textAlign: 'center'
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <metric.icon sx={{
                        color: currentColors.primary,
                        fontSize: 32,
                        mb: 1,
                        filter: `drop-shadow(0 0 10px ${currentColors.glow}60)`
                      }} />
                      <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700 }}>
                        {metric.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {metric.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 'downloads':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, color: currentColors.primary, fontWeight: 700 }}>
              Configurações de Download
            </Typography>

            <Card sx={{
              mb: 3,
              bgcolor: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${currentColors.primary}30`,
              borderRadius: 3
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Pasta de Downloads
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    value={downloadPath}
                    onChange={(e) => setDownloadPath(e.target.value)}
                    label="Caminho da pasta"
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(255,255,255,0.05)',
                        '& fieldset': {
                          borderColor: `${currentColors.primary}30`
                        }
                      }
                    }}
                  />
                  <CustomButton
                    variant="outlined"
                    startIcon={<FolderIcon />}
                    onClick={() => handleSelectPath('downloads')}
                    sx={{ minWidth: 120 }}
                  >
                    Procurar
                  </CustomButton>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{
              bgcolor: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${currentColors.primary}30`,
              borderRadius: 3
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Configurações Avançadas
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Downloads Paralelos"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Verificar Integridade"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      case 'cache':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, color: currentColors.primary, fontWeight: 700 }}>
              Gerenciamento de Cache
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card sx={{
                  mb: 3,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${currentColors.primary}30`,
                  borderRadius: 3
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Tamanho Total do Cache
                      </Typography>
                      <Chip
                        label={`${cacheSize} MB`}
                        sx={{
                          background: `linear-gradient(45deg, ${currentColors.primary}, ${currentColors.accent})`,
                          color: 'white',
                          fontWeight: 700
                        }}
                      />
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={(cacheSize / 500) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${currentColors.primary}, ${currentColors.accent})`,
                          borderRadius: 4
                        }
                      }}
                    />

                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                      {cacheSize}/500 MB utilizados
                    </Typography>
                  </CardContent>
                </Card>

                <CustomButton
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDialogOpen(true)}
                  fullWidth
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 700
                  }}
                >
                  Limpar Todo o Cache
                </CustomButton>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{
                  bgcolor: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${currentColors.primary}30`,
                  borderRadius: 3,
                  height: 'fit-content'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                      Tipos de Cache
                    </Typography>
                    <Stack spacing={2}>
                      {[
                        { label: 'Imagens', size: '156 MB', color: currentColors.primary },
                        { label: 'Metadados', size: '45 MB', color: currentColors.accent },
                        { label: 'Screenshots', size: '32 MB', color: currentColors.secondary },
                        { label: 'Temporários', size: '12 MB', color: '#FF9800' }
                      ].map((item, index) => (
                        <Box key={index} sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          p: 1,
                          bgcolor: 'rgba(255,255,255,0.05)',
                          borderRadius: 1,
                          border: `1px solid ${item.color}30`
                        }}>
                          <Typography variant="body2">{item.label}</Typography>
                          <Typography variant="body2" sx={{ color: item.color, fontWeight: 600 }}>
                            {item.size}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Dialog de confirmação */}
            <Dialog
              open={dialogOpen}
              onClose={() => setDialogOpen(false)}
              PaperProps={{
                sx: {
                  bgcolor: 'rgba(8, 16, 20, 0.95)',
                  backdropFilter: 'blur(30px)',
                  border: `2px solid ${currentColors.primary}30`,
                  borderRadius: 3
                }
              }}
            >
              <DialogTitle sx={{ color: 'text.primary' }}>
                Confirmar Limpeza do Cache
              </DialogTitle>
              <DialogContent>
                <DialogContentText sx={{ color: 'text.secondary' }}>
                  Tem certeza de que deseja limpar todo o cache? Isso irá liberar {cacheSize} MB de espaço,
                  mas alguns dados precisarão ser baixados novamente.
                </DialogContentText>
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <CustomButton onClick={() => setDialogOpen(false)} variant="outlined">
                  Cancelar
                </CustomButton>
                <CustomButton onClick={handleClearCache} variant="contained" color="error">
                  Limpar Cache
                </CustomButton>
              </DialogActions>
            </Dialog>
          </Box>
        );

      default:
        return (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <InfoIcon sx={{ fontSize: 64, color: currentColors.primary, opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Seção em desenvolvimento
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Esta funcionalidade será implementada em breve
            </Typography>
          </Box>
        );
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
      {/* Background revolucionário com efeitos glassmorphism */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: currentColors.background,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 25% 25%, ${currentColors.glow}15 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, ${currentColors.accent}10 0%, transparent 50%),
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 100px,
                ${currentColors.primary}05 101px,
                ${currentColors.primary}05 102px
              )
            `,
            animation: 'float 20s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateX(0) translateY(0)' },
              '25%': { transform: 'translateX(10px) translateY(-10px)' },
              '50%': { transform: 'translateX(-5px) translateY(5px)' },
              '75%': { transform: 'translateX(15px) translateY(-5px)' }
            }
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              linear-gradient(135deg, 
                transparent 0%, 
                ${currentColors.primary}03 25%, 
                ${currentColors.accent}05 50%, 
                ${currentColors.secondary}03 75%, 
                transparent 100%)
            `,
            animation: 'breathe 8s ease-in-out infinite',
            '@keyframes breathe': {
              '0%, 100%': { opacity: 0.8 },
              '50%': { opacity: 1 }
            }
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
          pt: 8,
          px: 4,
          pb: 4
        }}
      >
        {/* Header épico */}
        <Box sx={{ mb: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                mb: 2,
                background: `linear-gradient(45deg, ${currentColors.primary}, ${currentColors.accent}, ${currentColors.glow})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: `drop-shadow(0 0 30px ${currentColors.glow}40)`,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <SettingsIcon sx={{
                fontSize: '3rem',
                color: currentColors.primary,
                filter: `drop-shadow(0 0 20px ${currentColors.glow}60)`,
                animation: 'spin 10s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }} />
              Central de Configurações
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                opacity: 0.9,
                maxWidth: 800
              }}
            >
              Configure cada aspecto da sua experiência de gaming com controles avançados e personalizações únicas
            </Typography>
          </motion.div>
        </Box>

        <Grid container spacing={3} sx={{ height: 'calc(100% - 180px)' }}>
          {/* Menu de categorias futurista */}
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                height: '100%',
                bgcolor: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(25px)',
                border: `1px solid ${currentColors.primary}25`,
                borderRadius: 4,
                boxShadow: `0 15px 50px ${currentColors.primary}20`,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {/* Efeito de brilho no card */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, ${currentColors.primary}, ${currentColors.accent}, ${currentColors.glow})`,
                  animation: 'glow 3s ease-in-out infinite',
                  '@keyframes glow': {
                    '0%, 100%': { opacity: 0.7 },
                    '50%': { opacity: 1 }
                  }
                }}
              />

              <CardContent sx={{ p: 3, height: '100%' }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    color: currentColors.primary,
                    fontWeight: 900,
                    textAlign: 'center',
                    filter: `drop-shadow(0 0 10px ${currentColors.glow}40)`
                  }}
                >
                  Categorias
                </Typography>

                <Stack spacing={1}>
                  {categories.map((category, index) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategory === index;

                    return (
                      <motion.div
                        key={category.id}
                        whileHover={{ x: 8, scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <CustomButton
                          fullWidth
                          variant={isSelected ? "contained" : "text"}
                          startIcon={<Icon />}
                          onClick={() => {
                            setSelectedCategory(index);
                            setSelectedSection(0);
                            playSound('navigate');
                          }}
                          sx={{
                            justifyContent: 'flex-start',
                            py: 2,
                            px: 3,
                            borderRadius: 3,
                            color: isSelected ? 'white' : 'text.primary',
                            bgcolor: isSelected
                              ? `linear-gradient(45deg, ${currentColors.primary}, ${currentColors.accent})`
                              : 'transparent',
                            border: isSelected ? `2px solid ${currentColors.glow}50` : 'none',
                            boxShadow: isSelected ? `0 10px 30px ${currentColors.primary}40` : 'none',
                            '&:hover': {
                              bgcolor: isSelected
                                ? `linear-gradient(45deg, ${currentColors.secondary}, ${currentColors.primary})`
                                : `${currentColors.primary}15`,
                              transform: 'translateX(8px)',
                              boxShadow: `0 8px 25px ${currentColors.primary}30`
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            fontSize: '1rem',
                            fontWeight: isSelected ? 700 : 600
                          }}
                        >
                          {category.label}
                        </CustomButton>
                      </motion.div>
                    );
                  })}
                </Stack>

                {/* Indicador de gamepad */}
                {gamepad.gamepadConnected && (
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Chip
                      icon={<GamepadIcon />}
                      label="Controle Conectado"
                      size="small"
                      sx={{
                        bgcolor: `${currentColors.primary}20`,
                        color: currentColors.primary,
                        border: `1px solid ${currentColors.primary}50`,
                        fontSize: '0.8rem'
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Área de conteúdo principal */}
          <Grid item xs={12} md={9}>
            <Card
              sx={{
                height: '100%',
                bgcolor: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(25px)',
                border: `1px solid ${currentColors.primary}20`,
                borderRadius: 4,
                boxShadow: `0 15px 50px ${currentColors.primary}15`,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {/* Header da seção com tabs */}
              <Box
                sx={{
                  borderBottom: `1px solid ${currentColors.primary}20`,
                  background: `linear-gradient(90deg, 
                    ${currentColors.primary}08, 
                    transparent, 
                    ${currentColors.accent}05)`
                }}
              >
                <Tabs
                  value={selectedSection}
                  onChange={(e, value) => {
                    setSelectedSection(value);
                    playSound('navigate');
                  }}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTab-root': {
                      color: 'text.secondary',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      textTransform: 'none',
                      minHeight: 60,
                      '&.Mui-selected': {
                        color: currentColors.primary,
                        fontWeight: 700
                      }
                    },
                    '& .MuiTabs-indicator': {
                      background: `linear-gradient(90deg, ${currentColors.primary}, ${currentColors.accent})`,
                      height: 3,
                      borderRadius: 1.5
                    }
                  }}
                >
                  {currentCategory?.sections.map((section, index) => {
                    const Icon = section.icon;
                    return (
                      <Tab
                        key={section.id}
                        icon={<Icon />}
                        iconPosition="start"
                        label={section.label}
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          gap: 1
                        }}
                      />
                    );
                  })}
                </Tabs>
              </Box>

              {/* Conteúdo da seção */}
              <Box sx={{ height: 'calc(100% - 61px)', overflow: 'auto', p: 4 }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${selectedCategory}-${selectedSection}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderSectionContent()}
                  </motion.div>
                </AnimatePresence>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SettingsPanel;
