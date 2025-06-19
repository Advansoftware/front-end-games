import React, { useState } from 'react';
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
  Divider
} from '@mui/material';
import {
  Gamepad as GamepadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  Vibration as VibrationIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { useGamepad } from '../../../hooks/useGamepad';
import CustomButton from '../../CustomButton';

const GamepadSettings = () => {
  const gamepad = useGamepad();
  const [calibrating, setCalibrating] = useState(false);
  const [testingVibration, setTestingVibration] = useState(false);

  const buttonMappings = [
    { button: 'A', action: 'Confirmar / Selecionar', icon: '🅰️' },
    { button: 'B', action: 'Voltar / Cancelar', icon: '🅱️' },
    { button: 'X', action: 'Ação Secundária', icon: '❌' },
    { button: 'Y', action: 'Menu Rápido', icon: '🔻' },
    { button: 'LB', action: 'Categoria Anterior', icon: '⬅️' },
    { button: 'RB', action: 'Próxima Categoria', icon: '➡️' },
    { button: 'LT', action: 'Filtros', icon: '🎯' },
    { button: 'RT', action: 'Busca Rápida', icon: '🔍' },
    { button: 'D-Pad', action: 'Navegação', icon: '🎮' },
    { button: 'Analógico L', action: 'Movimento', icon: '🕹️' },
    { button: 'Analógico R', action: 'Câmera/Scroll', icon: '🕹️' }
  ];

  const handleCalibration = async () => {
    setCalibrating(true);
    // Simular calibração
    await new Promise(resolve => setTimeout(resolve, 3000));
    setCalibrating(false);
  };

  const handleVibrationTest = async () => {
    setTestingVibration(true);
    if (gamepad.gamepadConnected) {
      gamepad.vibrate(0.5, 500);
    }
    setTimeout(() => setTestingVibration(false), 1000);
  };

  return (
    <Box>
      {/* Status do Gamepad */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontWeight: 600 }}>
          Status do Controle
        </Typography>

        <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <GamepadIcon sx={{ fontSize: 32, color: gamepad.gamepadConnected ? 'success.main' : 'error.main' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {gamepad.gamepadConnected ? 'Controle Conectado' : 'Nenhum Controle'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {gamepad.gamepadConnected ? `${gamepad.gamepadId || 'Gamepad Genérico'}` : 'Conecte um controle para continuar'}
                  </Typography>
                </Box>
              </Box>

              {gamepad.gamepadConnected && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Controle detectado e funcionando corretamente
                </Alert>
              )}

              {!gamepad.gamepadConnected && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Pressione qualquer botão no seu controle para conectar
                </Alert>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 2 }}>
                <CustomButton
                  variant="outlined"
                  onClick={handleCalibration}
                  disabled={!gamepad.gamepadConnected || calibrating}
                  startIcon={<SettingsIcon />}
                  fullWidth
                >
                  {calibrating ? 'Calibrando...' : 'Calibrar Controle'}
                </CustomButton>

                <CustomButton
                  variant="outlined"
                  onClick={handleVibrationTest}
                  disabled={!gamepad.gamepadConnected || testingVibration}
                  startIcon={<VibrationIcon />}
                  fullWidth
                >
                  {testingVibration ? 'Testando...' : 'Testar Vibração'}
                </CustomButton>
              </Box>
            </Grid>
          </Grid>

          {calibrating && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Calibrando controle...
              </Typography>
              <LinearProgress />
            </Box>
          )}
        </Card>
      </Box>

      <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Configurações de Input */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontWeight: 600 }}>
          Configurações de Input
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Sensibilidade
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Vibração</Typography>
                  <Switch defaultChecked size="small" />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Ativar feedback háptico
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Auto-detecção</Typography>
                  <Switch defaultChecked size="small" />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Detectar controles automaticamente
                </Typography>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Sons de Navegação</Typography>
                  <Switch defaultChecked size="small" />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Sons ao navegar com controle
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Dead Zone
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Analógico Esquerdo
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="caption">0%</Typography>
                  <Box sx={{ flex: 1, mx: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={15}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="caption">100%</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Atual: 15%
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Analógico Direito
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="caption">0%</Typography>
                  <Box sx={{ flex: 1, mx: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={12}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="caption">100%</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Atual: 12%
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Mapeamento de Botões */}
      <Box>
        <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontWeight: 600 }}>
          Mapeamento de Botões
        </Typography>

        <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600 }}>
            Controles Padrão
          </Typography>

          <Grid container spacing={2}>
            {buttonMappings.map((mapping, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      bgcolor: 'rgba(255,255,255,0.03)',
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.1)'
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
                    <CheckIcon sx={{ color: 'success.main', fontSize: 18 }} />
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <CustomButton variant="outlined">
              Personalizar Botões
            </CustomButton>
            <CustomButton variant="outlined">
              Restaurar Padrão
            </CustomButton>
          </Box>
        </Card>
      </Box>

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <CustomButton variant="outlined">
          Resetar Configurações
        </CustomButton>
        <CustomButton variant="contained">
          Salvar Configurações
        </CustomButton>
      </Box>
    </Box>
  );
};

export default GamepadSettings;