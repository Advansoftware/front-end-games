import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';

import ThemesSettings from './sections/ThemesSettings';
import DisplaySettings from './sections/DisplaySettings';
import UISettings from './sections/UISettings';
import SoundsSettings from './sections/SoundsSettings';
import VolumeSettings from './sections/VolumeSettings';
import NotificationsSettings from './sections/NotificationsSettings';
import EmulatorSettings from './sections/EmulatorSettings';
import GamepadSettings from './sections/GamepadSettings';
import PerformanceSettings from './sections/PerformanceSettings';
import DownloadsSettings from './sections/DownloadsSettings';
import UpdatesSettings from './sections/UpdatesSettings';
import CacheSettings from './sections/CacheSettings';
import NetworkSettings from './sections/NetworkSettings';
import BackupSettings from './sections/BackupSettings';
import DebugSettings from './sections/DebugSettings';

const SettingsContent = ({ selectedCategory, selectedSection }) => {
  const categories = [
    {
      id: 'appearance',
      label: 'Aparência',
      sections: [
        { id: 'themes', label: 'Temas', component: ThemesSettings },
        { id: 'display', label: 'Display', component: DisplaySettings },
        { id: 'ui', label: 'Interface', component: UISettings }
      ]
    },
    {
      id: 'audio',
      label: 'Áudio & Som',
      sections: [
        { id: 'sounds', label: 'Sons', component: SoundsSettings },
        { id: 'volume', label: 'Volume', component: VolumeSettings },
        { id: 'notifications', label: 'Notificações', component: NotificationsSettings }
      ]
    },
    {
      id: 'gaming',
      label: 'Gaming',
      sections: [
        { id: 'emulator', label: 'Emulador', component: EmulatorSettings },
        { id: 'gamepad', label: 'Controle', component: GamepadSettings },
        { id: 'performance', label: 'Performance', component: PerformanceSettings }
      ]
    },
    {
      id: 'system',
      label: 'Sistema',
      sections: [
        { id: 'downloads', label: 'Downloads', component: DownloadsSettings },
        { id: 'updates', label: 'Atualizações', component: UpdatesSettings },
        { id: 'cache', label: 'Cache & Dados', component: CacheSettings }
      ]
    },
    {
      id: 'advanced',
      label: 'Avançado',
      sections: [
        { id: 'network', label: 'Rede', component: NetworkSettings },
        { id: 'backup', label: 'Backup', component: BackupSettings },
        { id: 'debug', label: 'Debug', component: DebugSettings }
      ]
    }
  ];

  const currentCategory = categories[selectedCategory];
  const currentSection = currentCategory?.sections[selectedSection];
  const SettingsComponent = currentSection?.component;

  return (
    <Box sx={{ flex: 1, height: '100%', overflow: 'auto' }}>
      <motion.div
        key={`${selectedCategory}-${selectedSection}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          sx={{
            height: '100%',
            bgcolor: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3
          }}
        >
          <CardContent sx={{ p: 4, height: '100%' }}>
            {/* Header da seção */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                {currentSection?.label}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Configurações de {currentSection?.label.toLowerCase()}
              </Typography>
            </Box>

            {/* Conteúdo da seção */}
            {SettingsComponent ? (
              <SettingsComponent />
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                  Seção em desenvolvimento
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default SettingsContent;