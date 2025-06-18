import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Badge,
  IconButton
} from '@mui/material';
import {
  Home as HomeIcon,
  Settings as SettingsIcon,
  Download as DownloadIcon,
  SportsEsports as GamepadIcon,
  Close as CloseIcon,
  Games as XboxIcon,
  VideogameAsset as PS5Icon,
  Casino as SwitchIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useGames } from '../contexts/GamesContext';
import { useGamepad } from '../hooks/useGamepad';

const Sidebar = ({ open, onClose, currentView, onViewChange }) => {
  const { currentTheme, changeTheme, playSound } = useTheme();
  const { games, downloadProgress } = useGames();
  const gamepad = useGamepad();

  const [selectedIndex, setSelectedIndex] = useState(0);

  const activeDownloads = Object.keys(downloadProgress).length;
  const installedGames = games.filter(game => game.installed).length;

  const menuItems = [
    {
      id: 'home',
      label: 'Início',
      icon: HomeIcon,
      badge: games.length
    },
    {
      id: 'downloads',
      label: 'Downloads',
      icon: DownloadIcon,
      badge: activeDownloads > 0 ? activeDownloads : null
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: SettingsIcon
    }
  ];

  const themeItems = [
    {
      id: 'xbox',
      label: 'Xbox',
      icon: XboxIcon,
      color: '#107C10'
    },
    {
      id: 'ps5',
      label: 'PlayStation 5',
      icon: PS5Icon,
      color: '#0070F3'
    },
    {
      id: 'switch',
      label: 'Nintendo Switch',
      icon: SwitchIcon,
      color: '#E60012'
    }
  ];

  // Navegação com gamepad
  useEffect(() => {
    const handleGamepadNavigation = () => {
      if (!open) return;

      const nav = gamepad.getNavigationInput();
      const totalItems = menuItems.length + themeItems.length;

      if (nav.up && selectedIndex > 0) {
        setSelectedIndex(prev => prev - 1);
        playSound('navigate');
      }

      if (nav.down && selectedIndex < totalItems - 1) {
        setSelectedIndex(prev => prev + 1);
        playSound('navigate');
      }

      if (nav.confirm) {
        if (selectedIndex < menuItems.length) {
          const item = menuItems[selectedIndex];
          onViewChange(item.id);
          playSound('confirm');
        } else {
          const themeIndex = selectedIndex - menuItems.length;
          const theme = themeItems[themeIndex];
          changeTheme(theme.id);
          playSound('confirm');
        }
      }

      if (nav.cancel || nav.back) {
        onClose();
        playSound('cancel');
      }
    };

    if (gamepad.gamepadConnected && open) {
      const interval = setInterval(handleGamepadNavigation, 150);
      return () => clearInterval(interval);
    }
  }, [gamepad, open, selectedIndex, menuItems, themeItems, onViewChange, changeTheme, onClose, playSound]);

  const handleMenuItemClick = (itemId) => {
    onViewChange(itemId);
    playSound('confirm');
    if (window.innerWidth < 960) {
      onClose();
    }
  };

  const handleThemeChange = (themeId) => {
    changeTheme(themeId);
    playSound('theme-change');
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          zIndex: 1300, // Abaixo do header (1400)
          marginTop: '56px', // Altura do header para não sobrepor
          height: 'calc(100vh - 56px)', // Altura ajustada
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, pt: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 40,
                height: 40
              }}
            >
              <GamepadIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Gamepass
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {installedGames} jogos instalados
              </Typography>
            </Box>
          </Box>

          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mx: 2 }} />

        {/* Menu Principal */}
        <List sx={{ flex: 1, px: 1 }}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isSelected = currentView === item.id;
            const isGamepadSelected = gamepad.gamepadConnected && selectedIndex === index;

            return (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  component={motion.div}
                  whileHover={{ x: 8 }}
                  whileTap={{ scale: 0.98 }}
                  selected={isSelected || isGamepadSelected}
                  onClick={() => handleMenuItemClick(item.id)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    border: isGamepadSelected ? 2 : 0,
                    borderColor: 'secondary.main',
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isSelected ? 'white' : 'inherit' }}>
                    {item.badge ? (
                      <Badge badgeContent={item.badge} color="error">
                        <Icon />
                      </Badge>
                    ) : (
                      <Icon />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{ color: isSelected ? 'white' : 'inherit' }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ mx: 2 }} />

        {/* Seletor de Temas */}
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Temas
          </Typography>

          <List sx={{ p: 0 }}>
            {themeItems.map((theme, index) => {
              const Icon = theme.icon;
              const isActive = currentTheme === theme.id;
              const globalIndex = menuItems.length + index;
              const isGamepadSelected = gamepad.gamepadConnected && selectedIndex === globalIndex;

              return (
                <ListItem key={theme.id} disablePadding>
                  <ListItemButton
                    component={motion.div}
                    whileHover={{ x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    selected={isActive || isGamepadSelected}
                    onClick={() => handleThemeChange(theme.id)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      border: isGamepadSelected ? 2 : (isActive ? 1 : 0),
                      borderColor: isGamepadSelected ? 'secondary.main' : theme.color,
                      '&.Mui-selected': {
                        bgcolor: `${theme.color}20`,
                        borderColor: theme.color,
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Icon sx={{ color: isActive ? theme.color : 'inherit' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={theme.label}
                      sx={{
                        color: isActive ? theme.color : 'inherit',
                        '& .MuiListItemText-primary': {
                          fontWeight: isActive ? 600 : 400
                        }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* Status do Controle */}
        {gamepad.gamepadConnected && (
          <>
            <Divider sx={{ mx: 2 }} />
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge color="success" variant="dot">
                  <GamepadIcon sx={{ color: 'success.main' }} />
                </Badge>
                <Typography variant="caption" color="success.main">
                  Controle conectado
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar;