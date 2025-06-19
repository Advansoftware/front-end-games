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
          // Background usando as cores do tema atual
          background: theme => `linear-gradient(145deg, 
            ${theme.palette.background.paper}F0 0%, 
            ${theme.palette.background.default}E0 100%)`,
          backdropFilter: 'blur(20px)',
          borderRight: theme => `1px solid ${theme.palette.primary.main}30`,
          color: theme => theme.palette.text.primary,
          zIndex: 1300,
          marginTop: '56px',
          height: 'calc(100vh - 56px)',
        },
      }}
    >
      <Box sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        color: 'text.primary' // Garantir texto branco
      }}>
        {/* Header */}
        <Box sx={{
          p: 2,
          pt: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: theme => `1px solid ${theme.palette.primary.main}20`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 40,
                height: 40,
                border: theme => `2px solid ${theme.palette.primary.main}40`
              }}
            >
              <GamepadIcon sx={{ color: 'white' }} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{
                fontWeight: 700,
                color: 'text.primary' // Texto branco
              }}>
                Gamepass
              </Typography>
              <Typography variant="caption" sx={{
                color: 'text.secondary' // Texto secundário
              }}>
                {installedGames} jogos instalados
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'white'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Menu Principal */}
        <List sx={{ flex: 1, px: 1, py: 2 }}>
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
                    color: 'text.primary', // Texto branco
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    },
                    '&:hover': {
                      bgcolor: theme => `${theme.palette.primary.main}20`,
                    }
                  }}
                >
                  <ListItemIcon sx={{
                    color: isSelected ? 'white' : 'text.primary'
                  }}>
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
                    sx={{
                      color: isSelected ? 'white' : 'text.primary',
                      '& .MuiListItemText-primary': {
                        fontWeight: isSelected ? 600 : 400
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Seletor de Temas */}
        <Box sx={{
          p: 2,
          borderTop: theme => `1px solid ${theme.palette.primary.main}20`
        }}>
          <Typography variant="subtitle2" sx={{
            mb: 2,
            color: 'text.secondary',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
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
                      color: 'text.primary', // Texto branco
                      '&.Mui-selected': {
                        bgcolor: `${theme.color}20`,
                        borderColor: theme.color,
                        color: theme.color,
                      },
                      '&:hover': {
                        bgcolor: `${theme.color}15`,
                      }
                    }}
                  >
                    <ListItemIcon>
                      <Icon sx={{
                        color: isActive ? theme.color : 'text.primary',
                        filter: isActive ? `drop-shadow(0 0 8px ${theme.color}60)` : 'none'
                      }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={theme.label}
                      sx={{
                        color: isActive ? theme.color : 'text.primary',
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
          <Box sx={{
            p: 2,
            borderTop: theme => `1px solid ${theme.palette.success.main}30`,
            bgcolor: theme => `${theme.palette.success.main}10`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Badge color="success" variant="dot">
                <GamepadIcon sx={{ color: 'success.main' }} />
              </Badge>
              <Typography variant="caption" sx={{
                color: 'success.main',
                fontWeight: 600
              }}>
                Controle conectado
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar;