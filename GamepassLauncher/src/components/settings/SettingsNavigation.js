import React, { useEffect } from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, Chip } from '@mui/material';
import {
  Palette as ThemeIcon,
  VolumeUp as SoundIcon,
  SportsEsports as GamesIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  DisplaySettings as DisplayIcon,
  Gamepad as GamepadIcon,
  Download as DownloadIcon,
  Update as UpdateIcon,
  Storage as CacheIcon,
  Wifi as WifiIcon,
  Backup as ExportIcon,
  Info as InfoIcon,
  VolumeDown as VolumeDownIcon,
  Notifications as NotificationIcon,
  Speed as PerformanceIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { useGamepad } from '../../hooks/useGamepad';
import { useTheme } from '../../contexts/ThemeContext';

const SettingsNavigation = ({ selectedCategory, selectedSection, onCategoryChange, onSectionChange }) => {
  const gamepad = useGamepad();
  const { currentTheme, playSound } = useTheme();

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

  // Navegação com gamepad
  useEffect(() => {
    const handleGamepadNavigation = () => {
      const nav = gamepad.getNavigationInput();

      if (nav.leftBumper && selectedCategory > 0) {
        onCategoryChange(selectedCategory - 1);
        onSectionChange(0);
        playSound('navigate');
      }

      if (nav.rightBumper && selectedCategory < categories.length - 1) {
        onCategoryChange(selectedCategory + 1);
        onSectionChange(0);
        playSound('navigate');
      }

      if (nav.up && selectedSection > 0) {
        onSectionChange(selectedSection - 1);
        playSound('navigate');
      }

      if (nav.down && selectedSection < currentCategory?.sections.length - 1) {
        onSectionChange(selectedSection + 1);
        playSound('navigate');
      }
    };

    if (gamepad.gamepadConnected) {
      const interval = setInterval(handleGamepadNavigation, 150);
      return () => clearInterval(interval);
    }
  }, [gamepad, selectedCategory, selectedSection, categories.length, currentCategory?.sections.length, playSound, onCategoryChange, onSectionChange]);

  return (
    <Box
      sx={{
        width: 320,
        height: '100%',
        bgcolor: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 3,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Categorias
        </Typography>
      </Box>

      {/* Lista de categorias */}
      <Box sx={{ p: 2 }}>
        <List sx={{ p: 0 }}>
          {categories.map((category, index) => {
            const CategoryIcon = category.icon;
            const isSelected = selectedCategory === index;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ListItem
                  button
                  onClick={() => {
                    onCategoryChange(index);
                    onSectionChange(0);
                    playSound('confirm');
                  }}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: isSelected ? 'primary.main' : 'transparent',
                    color: isSelected ? 'white' : 'text.primary',
                    '&:hover': {
                      bgcolor: isSelected ? 'primary.main' : 'rgba(255,255,255,0.05)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <ListItemIcon>
                    <CategoryIcon sx={{ color: isSelected ? 'white' : 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={category.label}
                    primaryTypographyProps={{
                      fontWeight: isSelected ? 700 : 500
                    }}
                  />
                  <Chip
                    label={category.sections.length}
                    size="small"
                    sx={{
                      bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                      color: isSelected ? 'white' : 'text.secondary',
                      fontSize: '0.7rem'
                    }}
                  />
                </ListItem>
              </motion.div>
            );
          })}
        </List>
      </Box>

      {/* Seções da categoria atual */}
      {currentCategory && (
        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
            {currentCategory.label}
          </Typography>

          <List sx={{ p: 0 }}>
            {currentCategory.sections.map((section, index) => {
              const SectionIcon = section.icon;
              const isSelected = selectedSection === index;

              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ListItem
                    button
                    onClick={() => {
                      onSectionChange(index);
                      playSound('navigate');
                    }}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      pl: 3,
                      bgcolor: isSelected ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: isSelected ? 'primary.main' : 'text.secondary',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.05)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <SectionIcon sx={{
                        fontSize: 18,
                        color: isSelected ? 'primary.main' : 'text.secondary'
                      }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={section.label}
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        fontWeight: isSelected ? 600 : 400
                      }}
                    />
                  </ListItem>
                </motion.div>
              );
            })}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default SettingsNavigation;