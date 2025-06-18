import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Button,
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

            <Card sx={{ mb: 2 }}>
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

            <Card>
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

            <Card sx={{ mb: 2 }}>
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
                  />
                  <Button
                    variant="outlined"
                    startIcon={<FolderIcon />}
                    onClick={() => handleSelectPath('downloads')}
                  >
                    Procurar
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Card>
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

            <Card sx={{ mb: 2 }}>
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
                  />
                  <Button
                    variant="outlined"
                    startIcon={<FolderIcon />}
                    onClick={() => handleSelectPath('yuzu')}
                  >
                    Procurar
                  </Button>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={downloadYuzuEmulator}
                  fullWidth
                >
                  Baixar Yuzu Emulator
                </Button>
              </CardContent>
            </Card>

            <Alert severity="info" sx={{ mb: 2 }}>
              O Yuzu é necessário para executar jogos de Nintendo Switch.
              Certifique-se de ter as prod.keys e firmware instalados.
            </Alert>

            <Card>
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

            <Card sx={{ mb: 2 }}>
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

            <Card sx={{ mb: 2 }}>
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

                <Button
                  variant="contained"
                  startIcon={<UpdateIcon />}
                  onClick={handleCheckUpdates}
                  disabled={checkingUpdates}
                  fullWidth
                >
                  {checkingUpdates ? 'Verificando...' : 'Verificar Atualizações'}
                </Button>
              </CardContent>
            </Card>

            <Alert severity="success">
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

            <Card sx={{ mb: 2 }}>
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
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: true }}
                />
                <Button
                  variant="outlined"
                  onClick={syncWithRemoteAPI}
                  fullWidth
                >
                  Sincronizar com Servidor
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Resetar Configurações
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Isso irá resetar todas as configurações para os valores padrão
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                >
                  Resetar Configurações
                </Button>
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
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDialogOpen(true)}
                  fullWidth
                >
                  Limpar Cache
                </Button>
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
                <Button onClick={() => setDialogOpen(false)} color="primary">
                  Cancelar
                </Button>
                <Button onClick={handleClearCache} color="secondary" autoFocus>
                  Limpar Cache
                </Button>
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
      sx={{ height: '100%', overflow: 'auto' }}
    >
      <Typography variant="h4" gutterBottom>
        Configurações
      </Typography>

      <Grid container spacing={3}>
        {/* Menu lateral */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ p: 1 }}>
              {sections.map((section, index) => {
                const Icon = section.icon;
                const isSelected = selectedSection === index;
                const isGamepadSelected = gamepad.gamepadConnected && selectedSection === index;

                return (
                  <Button
                    key={section.id}
                    fullWidth
                    variant={isSelected ? "contained" : "text"}
                    startIcon={<Icon />}
                    onClick={() => setSelectedSection(index)}
                    sx={{
                      justifyContent: 'flex-start',
                      mb: 0.5,
                      border: isGamepadSelected ? 2 : 0,
                      borderColor: 'secondary.main'
                    }}
                  >
                    {section.label}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* Conteúdo */}
        <Grid item xs={12} md={9}>
          <motion.div
            key={selectedSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderSectionContent()}
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPanel;