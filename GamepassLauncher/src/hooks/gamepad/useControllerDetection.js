import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Configurações específicas para cada tipo de controle
export const CONTROLLER_CONFIGS = {
  // 8BitDo Controllers (PRIORIDADE) - MAPEAMENTO CORRIGIDO
  BITDO: {
    patterns: [
      '8bitdo', '8bit', 'sn30', 'sf30', 'm30', 'n30', 'zero', 'lite',
      'pro 2', 'sn30 pro', 'sf30 pro', 'arcade stick', 'retro receiver',
      '2dc8-', // ID específico de alguns 8BitDo
      'pro+', 'ultimate', '8bitdo sn30 pro', '8bitdo sf30 pro'
    ],
    buttonMap: {
      0: 'A', 1: 'B', 2: 'Y', 3: 'X', // CORRIGIDO: 0=A (confirm), 1=B (cancel)
      4: 'L', 5: 'R', 6: 'L2', 7: 'R2',
      8: 'Select', 9: 'Start', 10: 'LS', 11: 'RS',
      12: 'Up', 13: 'Down', 14: 'Left', 15: 'Right', 16: 'Home'
    },
    axes: { leftX: 0, leftY: 1, rightX: 2, rightY: 3 },
    deadzone: 0.1,
    name: '8BitDo Controller'
  },

  // Xbox Controllers
  XBOX: {
    patterns: [
      'xbox', 'microsoft', 'xinput', '045e-', 'x-box'
    ],
    buttonMap: {
      0: 'A', 1: 'B', 2: 'X', 3: 'Y',
      4: 'LB', 5: 'RB', 6: 'LT', 7: 'RT',
      8: 'Back', 9: 'Start', 10: 'LS', 11: 'RS',
      12: 'Up', 13: 'Down', 14: 'Left', 15: 'Right', 16: 'Home'
    },
    axes: { leftX: 0, leftY: 1, rightX: 2, rightY: 3 },
    deadzone: 0.15,
    name: 'Xbox Controller'
  },

  // PlayStation Controllers (PS4/PS5)
  PLAYSTATION: {
    patterns: [
      'dualshock', 'dualsense', 'ps4 controller', 'ps5 controller',
      'sony computer entertainment', '054c-05c4', '054c-09cc',
      'playstation(r)', 'wireless controller'
    ],
    buttonMap: {
      0: 'Cross', 1: 'Circle', 2: 'Square', 3: 'Triangle',
      4: 'L1', 5: 'R1', 6: 'L2', 7: 'R2',
      8: 'Share', 9: 'Options', 10: 'L3', 11: 'R3',
      12: 'Up', 13: 'Down', 14: 'Left', 15: 'Right', 16: 'PS'
    },
    axes: { leftX: 0, leftY: 1, rightX: 2, rightY: 3 },
    deadzone: 0.1,
    name: 'PlayStation Controller'
  },

  // Nintendo Switch Pro Controller - MAPEAMENTO CORRIGIDO
  SWITCH: {
    patterns: [
      'pro controller', 'nintendo switch', 'nintendo co', '057e-'
    ],
    buttonMap: {
      0: 'A', 1: 'B', 2: 'Y', 3: 'X', // CORRIGIDO: 0=A (confirm), 1=B (cancel)
      4: 'L', 5: 'R', 6: 'ZL', 7: 'ZR',
      8: 'Minus', 9: 'Plus', 10: 'LS', 11: 'RS',
      12: 'Up', 13: 'Down', 14: 'Left', 15: 'Right', 16: 'Home'
    },
    axes: { leftX: 0, leftY: 1, rightX: 2, rightY: 3 },
    deadzone: 0.12,
    name: 'Nintendo Switch Pro Controller'
  },

  // DirectInput Controllers (Genérico)
  DIRECTINPUT: {
    patterns: [
      'directinput', 'generic', 'usb gamepad', 'gamepad'
    ],
    buttonMap: {
      0: 'Button1', 1: 'Button2', 2: 'Button3', 3: 'Button4',
      4: 'Button5', 5: 'Button6', 6: 'Button7', 7: 'Button8',
      8: 'Button9', 9: 'Button10', 10: 'Button11', 11: 'Button12',
      12: 'Up', 13: 'Down', 14: 'Left', 15: 'Right'
    },
    axes: { leftX: 0, leftY: 1, rightX: 2, rightY: 3 },
    deadzone: 0.2,
    name: 'DirectInput Controller'
  }
};

export const useControllerDetection = () => {
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [gamepadIndex, setGamepadIndex] = useState(null);
  const [controllerType, setControllerType] = useState(null);
  const [controllerConfig, setControllerConfig] = useState(null);
  const [hapticSupported, setHapticSupported] = useState(false);
  const { playSound } = useTheme();

  // Detectar tipo de controle baseado no ID
  const detectControllerType = useCallback((gamepadId) => {
    const id = gamepadId.toLowerCase();

    for (const [type, config] of Object.entries(CONTROLLER_CONFIGS)) {
      if (config.patterns.some(pattern => id.includes(pattern))) {
        // CORREÇÃO ESPECÍFICA PARA ELECTRON: Ajustar mapeamento do botão Start
        if (typeof window !== 'undefined' && window.electronAPI) {
          const electronConfig = { ...config };

          // Para Xbox no Electron, o botão Start pode estar no índice 7 em vez de 9
          if (type === 'XBOX') {
            electronConfig.buttonMap = {
              ...config.buttonMap,
              7: 'Start', // Mapeamento alternativo para Electron
              9: 'Start'  // Manter o original também
            };
          }

          // Para PlayStation no Electron, o botão Options pode estar em índice diferente
          if (type === 'PLAYSTATION') {
            electronConfig.buttonMap = {
              ...config.buttonMap,
              8: 'Options', // Mapeamento alternativo para Electron
              9: 'Options'  // Manter o original também
            };
          }

          console.log('🎮 Electron: Usando mapeamento ajustado para', type);
          return { type, config: electronConfig };
        }

        return { type, config };
      }
    }

    // Fallback para DirectInput se não encontrar match específico
    return {
      type: 'DIRECTINPUT',
      config: CONTROLLER_CONFIGS.DIRECTINPUT
    };
  }, []);

  // Detectar conexão/desconexão de controles
  useEffect(() => {
    const handleGamepadConnected = (e) => {
      console.log('🎮 Controle conectado:', e.gamepad.id);

      const { type, config } = detectControllerType(e.gamepad.id);

      setGamepadConnected(true);
      setGamepadIndex(e.gamepad.index);
      setControllerType(type);
      setControllerConfig(config);

      // Verificar suporte a haptic feedback
      setHapticSupported(!!e.gamepad.vibrationActuator);

      console.log(`🎮 Tipo detectado: ${config.name}`);
      playSound('controller-connect');
    };

    const handleGamepadDisconnected = (e) => {
      console.log('🎮 Controle desconectado:', e.gamepad.id);
      setGamepadConnected(false);
      setGamepadIndex(null);
      setControllerType(null);
      setControllerConfig(null);
      setHapticSupported(false);
      playSound('controller-disconnect');
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    // Verificar controles já conectados
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        const { type, config } = detectControllerType(gamepads[i].id);
        setGamepadConnected(true);
        setGamepadIndex(i);
        setControllerType(type);
        setControllerConfig(config);
        setHapticSupported(!!gamepads[i].vibrationActuator);
        break;
      }
    }

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, [detectControllerType, playSound]);

  // Obter informações detalhadas do controle
  const getControllerInfo = useCallback(() => {
    if (!gamepadConnected || !controllerConfig || gamepadIndex === null) {
      return null;
    }

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[gamepadIndex];

    if (!gamepad) return null;

    // Detectar tipo de conexão
    const isWireless = gamepad.id.toLowerCase().includes('wireless') ||
      gamepad.id.toLowerCase().includes('bluetooth');

    return {
      id: gamepad.id,
      index: gamepad.index,
      connected: gamepad.connected,
      timestamp: gamepad.timestamp,
      mapping: {
        name: controllerConfig.name,
        type: controllerType,
        standard: gamepad.mapping === 'standard'
      },
      connection: {
        type: isWireless ? 'Bluetooth' : 'USB',
        wireless: isWireless
      },
      capabilities: {
        vibration: hapticSupported,
        axes: gamepad.axes.length,
        buttons: gamepad.buttons.length
      },
      status: {
        batteryLevel: gamepad.battery || null,
        charging: gamepad.charging || false
      }
    };
  }, [gamepadConnected, controllerConfig, gamepadIndex, controllerType, hapticSupported]);

  return {
    gamepadConnected,
    gamepadIndex,
    controllerType,
    controllerConfig,
    hapticSupported,
    getControllerInfo,
    CONTROLLER_CONFIGS
  };
};