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
  DialogActions
} from '@mui/material';
import {
  VolumeUp as SoundIcon,
  Download as DownloadIcon,
  Update as UpdateIcon,
  Folder as FolderIcon,
  Games as GamesIcon,
  Security as SecurityIcon,
  Storage as CacheIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useGames } from '../contexts/GamesContext';
import { useGamepad } from '../hooks/useGamepad';
import CacheService from '../services/CacheService';
import CustomButton from './CustomButton';

const SettingsPanel = () => {
  const { soundsEnabled, toggleSounds, currentTheme, playSound } = useTheme();
  const { API_CONFIG, syncWithRemoteAPI } = useGames();
  const gamepad = useGamepad();

  const [selectedSection, setSelectedSection] = useState(0);
  const [downloadPath, setDownloadPath] = useState('./downloads');
  const [yuzuPath, setYuzuPath] = useState('./emulators/yuzu');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [lastUpdateCheck, setLastUpdateCheck] = useState(new Date().toLocaleString());
  const [cacheSize, setCacheSize] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const sections = [
    { id: 'audio', label: 'Áudio', icon: SoundIcon },
    { id: 'downloads', label: 'Downloads', icon: DownloadIcon },
    { id: 'emulator', label: 'Emulador', icon: GamesIcon },
    { id: 'updates', label: 'Atualizações', icon: UpdateIcon },
    { id: 'advanced', label: 'Avançado', icon: SecurityIcon },
    { id: 'cache', label: 'Cache', icon: CacheIcon }
  ];

  // Navegação com gamepad
  useEffect(() => {
    const handleGamepadNavigation = () => {
      const nav = gamepad.getNavigationInput();

      if (nav.left && selectedSection > 0) {
        setSelectedSection(prev => prev - 1);
        playSound('navigate');
      }

      if (nav.right && selectedSection < sections.length - 1) {
        setSelectedSection(prev => prev + 1);
        playSound('navigate');
      }
    };

    if (gamepad.gamepadConnected) {
      const interval = setInterval(handleGamepadNavigation, 150);
      return () => clearInterval(interval);
    }
  }, [gamepad, selectedSection, sections.length, playSound]);

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
      // Simular verificação de atualizações
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLastUpdateCheck(new Date().toLocaleString());

      // Verificar atualizações do banco de jogos
      await syncWithRemoteAPI();

    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
    } finally {
      setCheckingUpdates(false);
    }
  };

  const downloadYuzuEmulator = async () => {
    playSound('confirm');

    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.downloadFile(
          API_CONFIG.yuzuDownload,
          `${yuzuPath}/yuzu.zip`
        );

        if (result.success) {
          window.electronAPI.showNotification(
            'Download concluído',
            'Yuzu baixado com sucesso!'
          );
        }
      }
    } catch (error) {
      console.error('Erro ao baixar Yuzu:', error);
    }
  };

  const handleClearCache = async () => {
    playSound('confirm');
    setDialogOpen(false);

    try {
      await CacheService.clearCache();
      setCacheSize(0);
      window.electronAPI.showNotification('Cache Limpo', 'O cache foi limpo com sucesso!');
    } catch (error) {
      console.error('Erro ao limpar o cache:', error);
    }
  };

  const renderSectionContent = () => {
    const section = sections[selectedSection];

    switch (section.id) {
      case 'audio':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configurações de Áudio
            </Typography>

            <Card sx={{
              mb: 2,
              bgcolor: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(15px)',
              border: theme => `1px solid ${theme.palette.primary.main}25`,
              borderRadius: 2,
              boxShadow: theme => `0 8px 20px ${theme.palette.primary.main}10`
            }}>
              <CardContent>
                <FormControlLabel
                  control={
                    <Switch
                      checked={soundsEnabled}
                      onChange={toggleSounds}
                      color="primary"
                    />
                  }
                  label="Ativar sons de navegação"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Sons personalizados baseados no tema selecionado
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{
              bgcolor: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(15px)',
              border: theme => `1px solid ${theme.palette.primary.main}25`,
              borderRadius: 2,
              boxShadow: theme => `0 8px 20px ${theme.palette.primary.main}10`
            }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Tema de Som Atual
                </Typography>
                <Chip
                  label={currentTheme.toUpperCase()}
                  color="primary"
                  sx={{ textTransform: 'capitalize' }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Os sons mudam automaticamente com o tema
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      case 'downloads':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configurações de Download
            </Typography>

            <Card sx={{
              mb: 2,
              bgcolor: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(15px)',
              border: theme => `1px solid ${theme.palette.primary.main}25`,
              borderRadius: 2,
              boxShadow: theme => `0 8px 20px ${theme.palette.primary.main}10`
            }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Pasta de Downloads
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    value={downloadPath}
                    onChange={(e) => setDownloadPath(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(255,255,255,0.05)',
                        '& fieldset': {
                          borderColor: theme => `${theme.palette.primary.main}30`
                        }
                      }
                    }}
                  />
                  <CustomButton
                    variant="outlined"
                    startIcon={<FolderIcon />}
                    onClick={() => handleSelectPath('downloads')}
                  >
                    Procurar
                  </CustomButton>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{
              bgcolor: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(15px)',
              border: theme => `1px solid ${theme.palette.primary.main}25`,
              borderRadius: 2,
              boxShadow: theme => `0 8px 20px ${theme.palette.primary.main}10`
            }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  URLs de Download
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Yuzu Emulator"
                    value={API_CONFIG.yuzuDownload}
                    variant="outlined"
                    size="small"
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Firmware"
                    value={API_CONFIG.firmwareDownload}
                    variant="outlined"
                    size="small"
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      case 'emulator':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configurações do Emulador
            </Typography>

            <Card sx={{
              mb: 2,
              bgcolor: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(15px)',
              border: theme => `1px solid ${theme.palette.primary.main}25`,
              borderRadius: 2,
              boxShadow: theme => `0 8px 20px ${theme.palette.primary.main}10`
            }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Pasta do Yuzu
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                  <TextField
                    fullWidth
                    value={yuzuPath}
                    onChange={(e) => setYuzuPath(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(255,255,255,0.05)',
                        '& fieldset': {
                          borderColor: theme => `${theme.palette.primary.main}30`
                        }
                      }
                    }}
                  />
                  <CustomButton
                    variant="outlined"
                    startIcon={<FolderIcon />}
                    onClick={() => handleSelectPath('yuzu')}
                  >
                    Procurar
                  </CustomButton>
                </Box>

                <CustomButton
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={downloadYuzuEmulator}
                  fullWidth
                >
                  Baixar Yuzu Emulator
                </CustomButton>
              </CardContent>
            </Card>

            <Alert
              severity="info"
              sx={{
                mb: 2,
                bgcolor: 'rgba(3, 169, 244, 0.1)',
                border: theme => `1px solid ${theme.palette.info.main}30`,
                color: 'info.main'
              }}
            >
              O Yuzu é necessário para executar jogos de Nintendo Switch.
              Certifique-se de ter as prod.keys e firmware instalados.
            </Alert>

            <Card sx={{
              bgcolor: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(15px)',
              border: theme => `1px solid ${theme.palette.primary.main}25`,
              borderRadius: 2,
              boxShadow: theme => `0 8px 20px ${theme.palette.primary.main}10`
            }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Status do Emulador
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Yuzu:</Typography>
                    <Chip label="Não instalado" color="error" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Firmware:</Typography>
                    <Chip label="Não instalado" color="error" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Prod Keys:</Typography>
                    <Chip label="Não instalado" color="error" size="small" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      case 'updates':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Atualizações
            </Typography>

            <Card sx={{
              mb: 2,
              bgcolor: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(15px)',
              border: theme => `1px solid ${theme.palette.primary.main}25`,
              borderRadius: 2,
              boxShadow: theme => `0 8px 20px ${theme.palette.primary.main}10`
            }}>
              <CardContent>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoUpdate}
                      onChange={(e) => setAutoUpdate(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Verificar atualizações automaticamente"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Verificar atualizações do app e banco de jogos
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{
              mb: 2,
              bgcolor: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(15px)',
              border: theme => `1px solid ${theme.palette.primary.main}25`,
              borderRadius: 2,
              boxShadow: theme => `0 8px 20px ${theme.palette.primary.main}10`
            }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Verificação Manual
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Última verificação: {lastUpdateCheck}
                </Typography>

                {checkingUpdates && (
                  <LinearProgress sx={{ mb: 2 }} />
                )}

                <CustomButton
                  variant="contained"
                  startIcon={<UpdateIcon />}
                  onClick={handleCheckUpdates}
                  disabled={checkingUpdates}
                  fullWidth
                >
                  {checkingUpdates ? 'Verificando...' : 'Verificar Atualizações'}
                </CustomButton>
              </CardContent>
            </Card>

            <Alert
              severity="success"
              sx={{
                bgcolor: 'rgba(76, 175, 80, 0.1)',
                border: theme => `1px solid ${theme.palette.success.main}30`,
                color: 'success.main'
              }}
            >
              Você está usando a versão mais recente do Gamepass Launcher!
            </Alert>
          </Box>
        );

      case 'advanced':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configurações Avançadas
            </Typography>

            <Card sx={{
              mb: 2,
              bgcolor: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(15px)',
              border: theme => `1px solid ${theme.palette.primary.main}25`,
              borderRadius: 2,
              boxShadow: theme => `0 8px 20px ${theme.palette.primary.main}10`
            }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  API do Servidor
                </Typography>
                <TextField
                  label="URL da API"
                  value={API_CONFIG.gamesApi}
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.05)',
                      '& fieldset': {
                        borderColor: theme => `${theme.palette.primary.main}30`
                      }
                    }
                  }}
                  InputProps={{ readOnly: true }}
                />
                <CustomButton
                  variant="outlined"
                  onClick={syncWithRemoteAPI}
                  fullWidth
                >
                  Sincronizar com Servidor
                </CustomButton>
              </CardContent>
            </Card>

            <Card sx={{
              bgcolor: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(15px)',
              border: theme => `1px solid ${theme.palette.primary.main}25`,
              borderRadius: 2,
              boxShadow: theme => `0 8px 20px ${theme.palette.primary.main}10`
            }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Resetar Configurações
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Isso irá resetar todas as configurações para os valores padrão
                </Typography>
                <CustomButton
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                >
                  Resetar Configurações
                </CustomButton>
              </CardContent>
            </Card>
          </Box>
        );

      case 'cache':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configurações de Cache
            </Typography>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Tamanho do Cache
                </Typography>
                <Chip
                  label={`${cacheSize} MB`}
                  color="primary"
                  size="small"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  O cache é usado para armazenar dados temporários e acelerar o carregamento
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <CustomButton
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDialogOpen(true)}
                  fullWidth
                >
                  Limpar Cache
                </CustomButton>
              </CardContent>
            </Card>

            <Dialog
              open={dialogOpen}
              onClose={() => setDialogOpen(false)}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                {"Limpar Cache"}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Tem certeza de que deseja limpar o cache? Isso pode liberar até {cacheSize} MB de espaço.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <CustomButton onClick={() => setDialogOpen(false)} color="primary">
                  Cancelar
                </CustomButton>
                <CustomButton onClick={handleClearCache} color="secondary" autoFocus>
                  Limpar Cache
                </CustomButton>
              </DialogActions>
            </Dialog>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      sx={{
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        bgcolor: 'background.default',
        color: 'text.primary',
        position: 'relative',
        // Remover margens e paddings
        m: 0,
        p: 0
      }}
    >
      {/* Background com gradiente temático */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme => `linear-gradient(135deg, 
            ${theme.palette.background.default} 0%, 
            ${theme.palette.background.paper} 30%, 
            ${theme.palette.background.default} 70%, 
            ${theme.palette.primary.main}10 100%)`,
          zIndex: 0
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
        {/* Header estilizado */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              color: 'text.primary',
              fontWeight: 800,
              mb: 1,
              background: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: `drop-shadow(0 0 20px ${theme => theme.palette.primary.main}40)`
            }}
          >
            Configurações
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', opacity: 0.8 }}>
            Personalize sua experiência de jogo
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ height: 'calc(100% - 120px)' }}>
          {/* Menu lateral aprimorado */}
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                height: '100%',
                bgcolor: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: theme => `1px solid ${theme.palette.primary.main}30`,
                borderRadius: 3,
                boxShadow: theme => `0 10px 30px ${theme.palette.primary.main}20`
              }}
            >
              <CardContent sx={{ p: 2, height: '100%' }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    color: 'primary.main',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}
                >
                  Categorias
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {sections.map((section, index) => {
                    const Icon = section.icon;
                    const isSelected = selectedSection === index;
                    const isGamepadSelected = gamepad.gamepadConnected && selectedSection === index;

                    return (
                      <Box
                        key={section.id}
                        component={motion.div}
                        whileHover={{ x: 8, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <CustomButton
                          fullWidth
                          variant={isSelected ? "contained" : "text"}
                          startIcon={<Icon />}
                          onClick={() => setSelectedSection(index)}
                          sx={{
                            justifyContent: 'flex-start',
                            py: 1.5,
                            px: 2,
                            borderRadius: 2,
                            border: isGamepadSelected ? 2 : (isSelected ? 1 : 0),
                            borderColor: isGamepadSelected ? 'secondary.main' : 'primary.main',
                            color: isSelected ? 'white' : 'text.primary',
                            bgcolor: isSelected
                              ? 'primary.main'
                              : 'transparent',
                            '&:hover': {
                              bgcolor: isSelected
                                ? 'primary.dark'
                                : theme => `${theme.palette.primary.main}15`,
                              boxShadow: theme => `0 8px 25px ${theme.palette.primary.main}30`
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        >
                          {section.label}
                        </CustomButton>
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Conteúdo aprimorado */}
          <Grid item xs={12} md={9}>
            <Card
              sx={{
                height: '100%',
                bgcolor: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: theme => `1px solid ${theme.palette.primary.main}20`,
                borderRadius: 3,
                boxShadow: theme => `0 10px 30px ${theme.palette.primary.main}15`,
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: 0, height: '100%' }}>
                {/* Header da seção */}
                <Box
                  sx={{
                    p: 3,
                    borderBottom: theme => `1px solid ${theme.palette.primary.main}20`,
                    background: theme => `linear-gradient(90deg, 
                      ${theme.palette.primary.main}10, 
                      transparent)`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {sections[selectedSection] && (
                      <>
                        {React.createElement(sections[selectedSection].icon, {
                          sx: {
                            color: 'primary.main',
                            fontSize: 28,
                            filter: theme => `drop-shadow(0 0 10px ${theme.palette.primary.main}60)`
                          }
                        })}
                        <Typography
                          variant="h5"
                          sx={{
                            color: 'text.primary',
                            fontWeight: 700
                          }}
                        >
                          {sections[selectedSection].label}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>

                {/* Conteúdo da seção */}
                <Box sx={{ p: 3, height: 'calc(100% - 80px)', overflow: 'auto' }}>
                  <motion.div
                    key={selectedSection}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderSectionContent()}
                  </motion.div>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SettingsPanel;