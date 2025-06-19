import React from 'react';
import { Box, Typography, Card, Grid, Switch, Slider, Select, MenuItem, FormControl, InputLabel, Divider } from '@mui/material';
import { motion } from 'framer-motion';

import CustomButton from '../../CustomButton';

const DisplaySettings = () => {
  return (
    <Box>
      {/* Configurações de Resolução */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontWeight: 600 }}>
          Resolução e Display
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Configurações de Tela
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Resolução</InputLabel>
                <Select defaultValue="1920x1080" label="Resolução">
                  <MenuItem value="1280x720">1280 x 720 (HD)</MenuItem>
                  <MenuItem value="1920x1080">1920 x 1080 (Full HD)</MenuItem>
                  <MenuItem value="2560x1440">2560 x 1440 (2K)</MenuItem>
                  <MenuItem value="3840x2160">3840 x 2160 (4K)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Modo de Tela</InputLabel>
                <Select defaultValue="fullscreen" label="Modo de Tela">
                  <MenuItem value="windowed">Janela</MenuItem>
                  <MenuItem value="borderless">Sem Bordas</MenuItem>
                  <MenuItem value="fullscreen">Tela Cheia</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">V-Sync</Typography>
                  <Switch defaultChecked size="small" />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Sincronização vertical
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Qualidade Visual
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Taxa de Atualização
                </Typography>
                <Slider
                  defaultValue={60}
                  valueLabelDisplay="auto"
                  step={30}
                  marks={[
                    { value: 30, label: '30 FPS' },
                    { value: 60, label: '60 FPS' },
                    { value: 120, label: '120 FPS' },
                    { value: 144, label: '144 FPS' }
                  ]}
                  min={30}
                  max={144}
                  size="small"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Qualidade Gráfica
                </Typography>
                <Slider
                  defaultValue={3}
                  valueLabelDisplay="auto"
                  step={1}
                  marks={[
                    { value: 1, label: 'Baixa' },
                    { value: 2, label: 'Média' },
                    { value: 3, label: 'Alta' },
                    { value: 4, label: 'Ultra' }
                  ]}
                  min={1}
                  max={4}
                  size="small"
                />
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* HDR e Cores */}
      <Box>
        <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontWeight: 600 }}>
          HDR e Cores
        </Typography>

        <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">HDR Ativado</Typography>
                  <Switch size="small" />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  High Dynamic Range
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Brilho
                </Typography>
                <Slider
                  defaultValue={50}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Contraste
                </Typography>
                <Slider
                  defaultValue={50}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                  size="small"
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Saturação
                </Typography>
                <Slider
                  defaultValue={50}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Box>

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <CustomButton variant="outlined">
          Testar Configurações
        </CustomButton>
        <CustomButton variant="contained">
          Aplicar Mudanças
        </CustomButton>
      </Box>
    </Box>
  );
};

export default DisplaySettings;