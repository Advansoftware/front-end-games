import React from 'react';
import { Box, Typography, Card, Grid, Switch, Slider } from '@mui/material';

const SoundsSettings = () => (
  <Box>
    <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontWeight: 600 }}>
      Configurações de Som
    </Typography>

    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Sons da Interface
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2">Sons de Navegação</Typography>
              <Switch defaultChecked size="small" />
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2">Sons de Confirmação</Typography>
              <Switch defaultChecked size="small" />
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Volume dos Efeitos
            </Typography>
            <Slider
              defaultValue={70}
              valueLabelDisplay="auto"
              min={0}
              max={100}
              size="small"
            />
          </Box>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default SoundsSettings;