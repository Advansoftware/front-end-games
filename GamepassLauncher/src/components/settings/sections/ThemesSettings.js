import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Slider,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';

import { useTheme } from '../../../contexts/ThemeContext';
import CustomButton from '../../CustomButton';

const ThemesSettings = () => {
  const { currentTheme, changeTheme, playSound } = useTheme(); // Mudança: usar changeTheme em vez de setTheme

  const themes = [
    {
      id: 'xbox',
      name: 'Xbox',
      description: 'Tema verde inspirado no Xbox',
      preview: 'linear-gradient(135deg, #107C10 0%, #40E040 100%)'
    },
    {
      id: 'ps5',
      name: 'PlayStation',
      description: 'Tema azul inspirado no PlayStation',
      preview: 'linear-gradient(135deg, #0070F3 0%, #40B4FF 100%)'
    },
    {
      id: 'switch',
      name: 'Nintendo Switch',
      description: 'Tema vermelho inspirado no Nintendo Switch',
      preview: 'linear-gradient(135deg, #E60012 0%, #FF4040 100%)'
    }
  ];

  const handleThemeChange = (themeId) => {
    changeTheme(themeId); // Mudança: usar changeTheme em vez de setTheme
    playSound('confirm');
  };

  return (
    <Box>
      {/* Seletor de tema */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
          Tema Principal
        </Typography>

        <Grid container spacing={3}>
          {themes.map((theme, index) => (
            <Grid item xs={12} md={4} key={theme.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: currentTheme === theme.id ? '2px solid' : '1px solid',
                    borderColor: currentTheme === theme.id ? 'primary.main' : 'rgba(255,255,255,0.1)',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                    }
                  }}
                  onClick={() => handleThemeChange(theme.id)}
                >
                  {/* Preview do tema */}
                  <Box
                    sx={{
                      height: 80,
                      background: theme.preview,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {currentTheme === theme.id && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          bgcolor: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'primary.main'
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {theme.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {theme.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Configurações adicionais */}
      <Box>
        <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontWeight: 600 }}>
          Personalização
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Efeitos Visuais
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Animações</Typography>
                  <Switch defaultChecked size="small" />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Ativar animações e transições
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Glassmorphism</Typography>
                  <Switch defaultChecked size="small" />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Efeitos de vidro e blur
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Intensidade dos Efeitos
                </Typography>
                <Slider
                  defaultValue={75}
                  valueLabelDisplay="auto"
                  step={25}
                  marks
                  min={0}
                  max={100}
                  size="small"
                />
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Interface
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Modo Escuro</Typography>
                  <Switch defaultChecked size="small" />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Interface em cores escuras
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Compacto</Typography>
                  <Switch size="small" />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Reduzir espaçamentos
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Tamanho da Fonte
                </Typography>
                <Slider
                  defaultValue={100}
                  valueLabelDisplay="auto"
                  step={10}
                  marks={[
                    { value: 80, label: 'Pequeno' },
                    { value: 100, label: 'Normal' },
                    { value: 120, label: 'Grande' }
                  ]}
                  min={80}
                  max={120}
                  size="small"
                />
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <CustomButton variant="outlined">
          Resetar para Padrão
        </CustomButton>
        <CustomButton variant="contained">
          Salvar Configurações
        </CustomButton>
      </Box>
    </Box>
  );
};

export default ThemesSettings;