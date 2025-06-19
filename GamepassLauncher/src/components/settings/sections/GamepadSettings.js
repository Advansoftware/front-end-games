import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Switch,
  Button,
  LinearProgress,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Slider,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Gamepad as GamepadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  Vibration as VibrationIcon,
  Tune as TuneIcon,
  Refresh as RefreshIcon,
  PlayArrow as TestIcon,
  Pause as PauseIcon,
  Bluetooth as BluetoothIcon,
  Usb as UsbIcon,
  Gamepad2 as Gamepad2Icon,
  SportsEsports as SportsIcon,
  AutoFixHigh as AutoIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

import { useGamepad } from '../../../hooks/useGamepad';
import CustomButton from '../../CustomButton';

const GamepadSettings = () => {
  const gamepad = useGamepad();
  const [calibrating, setCalibrating] = useState(false);
  const [testingVibration, setTestingVibration] = useState(false);
  const [testingButtons, setTestingButtons] = useState(false);
  const [selectedController, setSelectedController] = useState('auto');
  const [deadzoneLeft, setDeadzoneLeft] = useState(15);
  const [deadzoneRight, setDeadzoneRight] = useState(12);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [vibrationIntensity, setVibrationIntensity] = useState(80);
  const [autoDetect, setAutoDetect] = useState(true);
  const [navigationSounds, setNavigationSounds] = useState(true);
  const [activeTest, setActiveTest] = useState(null);

  // Detectar e mostrar informações do controle conectado
  const getControllerIcon = () => {
    switch (gamepad.controllerType) {
      case 'XBOX': return '🎮';
      case 'PLAYSTATION': return '🎮';
      case 'SWITCH': return '🕹️';
      case 'BITDO': return '🎮';
      case 'DIRECTINPUT': return '🎮';
      default: return '🎮';
    }
  };

  const getControllerColor = () => {
    switch (gamepad.controllerType) {
      case 'XBOX': return '#107C10';
      case 'PLAYSTATION': return '#003791';
      case 'SWITCH': return '#E60012';
      case 'BITDO': return '#FF6B35';
      case 'DIRECTINPUT': return '#666666';
      default: return '#2196F3';
    }
  };

  // Mapeamento de botões baseado no tipo de controle
  const getButtonMappings = () => {
    if (!gamepad.controllerType) return [];

    const baseActions = [
      { action: 'Confirmar / Selecionar', key: 'confirm' },
      { action: 'Voltar / Cancelar', key: 'cancel' },
      { action: 'Menu Principal', key: 'menu' },
      { action: 'Menu Secundário', key: 'back' },
      { action: 'Categoria Anterior', key: 'leftBumper' },
      { action: 'Próxima Categoria', key: 'rightBumper' },
      { action: 'Navegação', key: 'dpad' },
      { action: 'Movimento', key: 'leftStick' },
      { action: 'Câmera/Scroll', key: 'rightStick' }
    ];

    return baseActions.map(action => {
      let buttonName = '';
      let icon = '🎮';

      switch (action.key) {
        case 'confirm':
          buttonName = gamepad.getConfirmButton();
          icon = gamepad.controllerType === 'PLAYSTATION' ? '❌' : '🅰️';
          break;
        case 'cancel':
          buttonName = gamepad.getCancelButton();
          icon = gamepad.controllerType === 'PLAYSTATION' ? '⭕' : '🅱️';
          break;
        case 'menu':
          buttonName = gamepad.getMenuButton();
          icon = '☰';
          break;
        case 'back':
          buttonName = gamepad.getBackButton();
          icon = '⬅️';
          break;
        case 'leftBumper':
          buttonName = gamepad.getLeftBumper();
          icon = '⬆️';
          break;
        case 'rightBumper':
          buttonName = gamepad.getRightBumper();
          icon = '⬆️';
          break;
        case 'dpad':
          buttonName = 'D-Pad';
          icon = '✚';
          break;
        case 'leftStick':
          buttonName = 'Analógico L';
          icon = '🕹️';
          break;
        case 'rightStick':
          buttonName = 'Analógico R';
          icon = '🕹️';
          break;
        default:
          buttonName = 'Unknown';
      }

      return {
        button: buttonName,
        action: action.action,
        icon,
        key: action.key
      };
    });
  };

  // Testar botões em tempo real
  const handleButtonTest = async () => {
    setTestingButtons(true);
    setActiveTest('buttons');

    // Testar por 10 segundos
    setTimeout(() => {
      setTestingButtons(false);
      setActiveTest(null);
    }, 10000);
  };

  // Calibração avançada
  const handleAdvancedCalibration = async () => {
    setCalibrating(true);

    if (gamepad.gamepadConnected) {
      // Feedback háptico durante calibração
      gamepad.vibrate('pulse', 0.3);

      // Simular calibração com feedback
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));
        gamepad.vibrate('short', 0.2);
      }

      // Calibrar usando a função do hook
      gamepad.calibrateController();
    }

    setCalibrating(false);
  };

  // Teste de vibração com padrões
  const handleVibrationTest = async (pattern = 'short') => {
    setTestingVibration(true);

    if (gamepad.gamepadConnected && vibrationEnabled) {
      gamepad.vibrate(pattern, vibrationIntensity / 100);
    }

    setTimeout(() => setTestingVibration(false), 1000);
  };

  // Monitorar inputs em tempo real para o teste
  useEffect(() => {
    if (testingButtons && gamepad.lastButtonPress) {
      console.log('🎮 Botão testado:', gamepad.lastButtonPress);
    }
  }, [testingButtons, gamepad.lastButtonPress]);

  return (
    <Box>
      {/* Status Avançado do Controle */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontWeight: 600 }}>
          🎮 Status do Controle
        </Typography>

        <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 3, position: 'relative', overflow: 'hidden' }}>
          {/* Indicador visual do tipo de controle */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              bgcolor: gamepad.gamepadConnected ? getControllerColor() : 'grey.500'
            }}
          />

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 64,
                    height: 64,
                    borderRadius: 3,
                    bgcolor: gamepad.gamepadConnected ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                    border: `2px solid ${gamepad.gamepadConnected ? '#4CAF50' : '#F44336'}`,
                    fontSize: '2rem'
                  }}
                >
                  {getControllerIcon()}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {gamepad.gamepadConnected ? gamepad.controllerConfig?.name : 'Nenhum Controle'}
                    </Typography>

                    {gamepad.gamepadConnected && (
                      <Badge
                        badgeContent={gamepad.hapticSupported ? 'Haptic' : 'Basic'}
                        color={gamepad.hapticSupported ? 'success' : 'warning'}
                        sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem' } }}
                      />
                    )}
                  </Box>

                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    {gamepad.gamepadConnected
                      ? `Índice: ${gamepad.gamepadIndex} • Tipo: ${gamepad.controllerType}`
                      : 'Conecte um controle para acessar todas as funcionalidades'
                    }
                  </Typography>

                  {gamepad.gamepadConnected && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        icon={<CheckIcon />}
                        label="Conectado"
                        color="success"
                        variant="outlined"
                      />
                      {gamepad.hapticSupported && (
                        <Chip
                          size="small"
                          icon={<VibrationIcon />}
                          label="Vibração"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                      <Chip
                        size="small"
                        icon={gamepad.controllerType === 'DIRECTINPUT' ? <UsbIcon /> : <BluetoothIcon />}
                        label={gamepad.controllerType === 'DIRECTINPUT' ? 'USB' : 'Wireless'}
                        variant="outlined"
                      />
                    </Box>
                  )}
                </Box>
              </Box>

              {gamepad.gamepadConnected && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <strong>{gamepad.controllerConfig?.name}</strong> detectado e funcionando corretamente!
                  {gamepad.hapticSupported && ' Suporte completo a feedback háptico disponível.'}
                </Alert>
              )}

              {!gamepad.gamepadConnected && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <strong>Controles Suportados:</strong> Xbox (XInput), PlayStation 4/5 (DualShock/DualSense),
                  Nintendo Switch Pro, 8BitDo, e qualquer controle DirectInput compatível.
                </Alert>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <CustomButton
                  variant="outlined"
                  onClick={handleAdvancedCalibration}
                  disabled={!gamepad.gamepadConnected || calibrating}
                  startIcon={calibrating ? <RefreshIcon className="rotating" /> : <TuneIcon />}
                  fullWidth
                >
                  {calibrating ? 'Calibrando...' : 'Calibração Avançada'}
                </CustomButton>

                <CustomButton
                  variant="outlined"
                  onClick={handleButtonTest}
                  disabled={!gamepad.gamepadConnected || testingButtons}
                  startIcon={testingButtons ? <PauseIcon /> : <TestIcon />}
                  fullWidth
                  color={testingButtons ? 'warning' : 'primary'}
                >
                  {testingButtons ? 'Testando...' : 'Testar Botões'}
                </CustomButton>

                {gamepad.hapticSupported && (
                  <CustomButton
                    variant="outlined"
                    onClick={() => handleVibrationTest('medium')}
                    disabled={!vibrationEnabled || testingVibration}
                    startIcon={<VibrationIcon />}
                    fullWidth
                  >
                    {testingVibration ? 'Vibrando...' : 'Testar Vibração'}
                  </CustomButton>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Barra de progresso para calibração */}
          <AnimatePresence>
            {calibrating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Calibrando deadzone e sensibilidade dos analógicos...
                  </Typography>
                  <LinearProgress />
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </Box>

      <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Configurações Avançadas */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontWeight: 600 }}>
          ⚙️ Configurações Avançadas
        </Typography>

        <Grid container spacing={3}>
          {/* Configurações Gerais */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 3, height: '100%' }}>
              <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon /> Configurações Gerais
              </Typography>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoDetect}
                      onChange={(e) => setAutoDetect(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Auto-detecção de Controles"
                />
                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}>
                  Detectar automaticamente novos controles conectados
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={navigationSounds}
                      onChange={(e) => setNavigationSounds(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Sons de Navegação"
                />
                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}>
                  Reproduzir sons ao navegar com o controle
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={vibrationEnabled}
                      onChange={(e) => setVibrationEnabled(e.target.checked)}
                      size="small"
                      disabled={!gamepad.hapticSupported}
                    />
                  }
                  label="Feedback Háptico"
                />
                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}>
                  {gamepad.hapticSupported ? 'Ativar vibração do controle' : 'Controle não suporta vibração'}
                </Typography>
              </Box>

              {vibrationEnabled && gamepad.hapticSupported && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Intensidade da Vibração: {vibrationIntensity}%
                  </Typography>
                  <Slider
                    value={vibrationIntensity}
                    onChange={(e, value) => setVibrationIntensity(value)}
                    min={10}
                    max={100}
                    step={10}
                    marks
                    size="small"
                  />
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button size="small" onClick={() => handleVibrationTest('short')}>Fraco</Button>
                    <Button size="small" onClick={() => handleVibrationTest('medium')}>Médio</Button>
                    <Button size="small" onClick={() => handleVibrationTest('long')}>Forte</Button>
                  </Box>
                </Box>
              )}
            </Card>
          </Grid>

          {/* Configurações de Deadzone */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 3, height: '100%' }}>
              <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon /> Deadzone dos Analógicos
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Analógico Esquerdo: {deadzoneLeft}%
                </Typography>
                <Slider
                  value={deadzoneLeft}
                  onChange={(e, value) => setDeadzoneLeft(value)}
                  min={0}
                  max={50}
                  step={1}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 25, label: '25%' },
                    { value: 50, label: '50%' }
                  ]}
                  size="small"
                />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Movimento mínimo necessário para registrar input
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Analógico Direito: {deadzoneRight}%
                </Typography>
                <Slider
                  value={deadzoneRight}
                  onChange={(e, value) => setDeadzoneRight(value)}
                  min={0}
                  max={50}
                  step={1}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 25, label: '25%' },
                    { value: 50, label: '50%' }
                  ]}
                  size="small"
                />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Controla a sensibilidade para câmera/scroll
                </Typography>
              </Box>

              <CustomButton
                variant="outlined"
                onClick={() => {
                  setDeadzoneLeft(15);
                  setDeadzoneRight(12);
                }}
                size="small"
                startIcon={<AutoIcon />}
              >
                Restaurar Padrão
              </CustomButton>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Mapeamento de Botões Dinâmico */}
      <Box>
        <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontWeight: 600 }}>
          🎮 Mapeamento de Botões
        </Typography>

        <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {gamepad.controllerConfig?.name || 'Controles Padrão'}
            </Typography>

            {testingButtons && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Chip
                  label="Pressione qualquer botão"
                  color="warning"
                  icon={<TestIcon />}
                />
              </motion.div>
            )}
          </Box>

          <Grid container spacing={2}>
            {getButtonMappings().map((mapping, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Paper
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      bgcolor: testingButtons && gamepad.lastButtonPress?.button === mapping.button
                        ? 'rgba(76, 175, 80, 0.2)'
                        : 'rgba(255,255,255,0.03)',
                      border: testingButtons && gamepad.lastButtonPress?.button === mapping.button
                        ? '2px solid #4CAF50'
                        : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 2,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                      {mapping.icon}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {mapping.button}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {mapping.action}
                      </Typography>
                    </Box>
                    <CheckIcon
                      sx={{
                        color: testingButtons && gamepad.lastButtonPress?.button === mapping.button
                          ? 'success.main'
                          : 'success.main',
                        fontSize: 18
                      }}
                    />
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <CustomButton variant="outlined" startIcon={<SettingsIcon />}>
              Personalizar Botões
            </CustomButton>
            <CustomButton variant="outlined" startIcon={<RefreshIcon />}>
              Restaurar Padrão
            </CustomButton>
            <CustomButton variant="outlined" startIcon={<AutoIcon />}>
              Auto-configurar
            </CustomButton>
          </Box>
        </Card>
      </Box>

      {/* Ações principais */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <CustomButton variant="outlined" startIcon={<RefreshIcon />}>
          Resetar Todas as Configurações
        </CustomButton>
        <CustomButton variant="contained" startIcon={<CheckIcon />}>
          Salvar Configurações
        </CustomButton>
      </Box>

      {/* CSS para animação de rotação */}
      <style jsx>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotating {
          animation: rotate 2s linear infinite;
        }
      `}</style>
    </Box>
  );
};

export default GamepadSettings;