import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Configurações específicas para cada tipo de controle
const CONTROLLER_CONFIGS = {
  // 8BitDo Controllers (MOVIDO PARA O TOPO PARA PRIORIDADE)
  BITDO: {
    patterns: [
      '8bitdo', '8bit', 'sn30', 'sf30', 'm30', 'n30', 'zero', 'lite',
      'pro 2', 'sn30 pro', 'sf30 pro', 'arcade stick', 'retro receiver',
      '2dc8-', // ID específico de alguns 8BitDo
      'pro+', 'ultimate', '8bitdo sn30 pro', '8bitdo sf30 pro'
    ],
    buttonMap: {
      0: 'B', 1: 'A', 2: 'Y', 3: 'X',
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

  // PlayStation Controllers (PS4/PS5) - PADRÕES MAIS ESPECÍFICOS
  PLAYSTATION: {
    patterns: [
      'dualshock', 'dualsense', 'ps4 controller', 'ps5 controller',
      'sony computer entertainment', '054c-05c4', '054c-09cc', // IDs específicos PS4/PS5
      'playstation(r)', 'wireless controller' // Só aceita se tiver esses termos específicos
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

  // Nintendo Switch Pro Controller
  SWITCH: {
    patterns: [
      'pro controller', 'nintendo switch', 'nintendo co', '057e-'
    ],
    buttonMap: {
      0: 'B', 1: 'A', 2: 'Y', 3: 'X',
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

export const useGamepad = () => {
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [gamepadIndex, setGamepadIndex] = useState(null);
  const [controllerType, setControllerType] = useState(null);
  const [controllerConfig, setControllerConfig] = useState(null);
  const [buttonStates, setButtonStates] = useState({});
  const [lastButtonPress, setLastButtonPress] = useState(null);
  const [hapticSupported, setHapticSupported] = useState(false);
  const { playSound } = useTheme();

  // Detectar tipo de controle baseado no ID
  const detectControllerType = useCallback((gamepadId) => {
    const id = gamepadId.toLowerCase();

    for (const [type, config] of Object.entries(CONTROLLER_CONFIGS)) {
      if (config.patterns.some(pattern => id.includes(pattern))) {
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

  // Polling aprimorado dos botões do controle
  useEffect(() => {
    if (!gamepadConnected || gamepadIndex === null || !controllerConfig) return;

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[gamepadIndex];

      if (!gamepad) return;

      const newButtonStates = {};
      const config = controllerConfig;

      // Verificar botões com debounce
      gamepad.buttons.forEach((button, index) => {
        const buttonName = config.buttonMap[index];
        if (buttonName) {
          const wasPressed = buttonStates[buttonName]?.pressed || false;
          const isPressed = button.pressed;

          newButtonStates[buttonName] = {
            pressed: isPressed,
            value: button.value,
            justPressed: !wasPressed && isPressed,
            justReleased: wasPressed && !isPressed
          };

          // Registrar último botão pressionado
          if (!wasPressed && isPressed) {
            setLastButtonPress({ button: buttonName, timestamp: Date.now() });
          }
        }
      });

      // Verificar analógicos com deadzone
      const deadzone = config.deadzone;

      const applyDeadzone = (value) => {
        return Math.abs(value) < deadzone ? 0 : value;
      };

      const leftStick = {
        x: applyDeadzone(gamepad.axes[config.axes.leftX] || 0),
        y: applyDeadzone(gamepad.axes[config.axes.leftY] || 0)
      };

      const rightStick = {
        x: applyDeadzone(gamepad.axes[config.axes.rightX] || 0),
        y: applyDeadzone(gamepad.axes[config.axes.rightY] || 0)
      };

      newButtonStates.leftStick = leftStick;
      newButtonStates.rightStick = rightStick;

      // Detectar movimento dos analógicos
      newButtonStates.leftStickMove = Math.abs(leftStick.x) > 0 || Math.abs(leftStick.y) > 0;
      newButtonStates.rightStickMove = Math.abs(rightStick.x) > 0 || Math.abs(rightStick.y) > 0;

      setButtonStates(newButtonStates);
    };

    const interval = setInterval(pollGamepad, 16); // ~60 FPS
    return () => clearInterval(interval);
  }, [gamepadConnected, gamepadIndex, controllerConfig, buttonStates]);

  // Função para verificar se um botão foi pressionado
  const isButtonPressed = useCallback((buttonName) => {
    return buttonStates[buttonName]?.pressed || false;
  }, [buttonStates]);

  // Função para verificar se um botão foi pressionado agora
  const isButtonJustPressed = useCallback((buttonName) => {
    return buttonStates[buttonName]?.justPressed || false;
  }, [buttonStates]);

  // Função para obter valor do analógico
  const getStickValue = useCallback((stick) => {
    return buttonStates[stick] || { x: 0, y: 0 };
  }, [buttonStates]);

  // Navegar com D-pad ou analógico esquerdo (melhorado)
  const getNavigationInput = useCallback(() => {
    const leftStick = getStickValue('leftStick');
    const threshold = 0.7;

    // Mapeamento universal para navegação
    const getUniversalButton = (action) => {
      if (!controllerType) return false;

      const actionMap = {
        up: isButtonJustPressed('Up') || (leftStick.y < -threshold),
        down: isButtonJustPressed('Down') || (leftStick.y > threshold),
        left: isButtonJustPressed('Left') || (leftStick.x < -threshold),
        right: isButtonJustPressed('Right') || (leftStick.x > threshold),
        confirm: isButtonJustPressed(getConfirmButton()),
        cancel: isButtonJustPressed(getCancelButton()),
        menu: isButtonJustPressed(getMenuButton()),
        back: isButtonJustPressed(getBackButton()),
        leftBumper: isButtonJustPressed(getLeftBumper()),
        rightBumper: isButtonJustPressed(getRightBumper())
      };

      return actionMap[action] || false;
    };

    return {
      up: getUniversalButton('up'),
      down: getUniversalButton('down'),
      left: getUniversalButton('left'),
      right: getUniversalButton('right'),
      confirm: getUniversalButton('confirm'),
      cancel: getUniversalButton('cancel'),
      menu: getUniversalButton('menu'),
      back: getUniversalButton('back'),
      leftBumper: getUniversalButton('leftBumper'),
      rightBumper: getUniversalButton('rightBumper')
    };
  }, [isButtonJustPressed, getStickValue, controllerType]);

  // Mapear botões universais baseado no tipo de controle
  const getConfirmButton = useCallback(() => {
    switch (controllerType) {
      case 'XBOX': return 'A';
      case 'PLAYSTATION': return 'Cross';
      case 'SWITCH': return 'A';
      case 'BITDO': return 'A';
      case 'DIRECTINPUT': return 'Button1';
      default: return 'A';
    }
  }, [controllerType]);

  const getCancelButton = useCallback(() => {
    switch (controllerType) {
      case 'XBOX': return 'B';
      case 'PLAYSTATION': return 'Circle';
      case 'SWITCH': return 'B';
      case 'BITDO': return 'B';
      case 'DIRECTINPUT': return 'Button2';
      default: return 'B';
    }
  }, [controllerType]);

  const getMenuButton = useCallback(() => {
    switch (controllerType) {
      case 'XBOX': return 'Start';
      case 'PLAYSTATION': return 'Options';
      case 'SWITCH': return 'Plus';
      case 'BITDO': return 'Start';
      case 'DIRECTINPUT': return 'Button10';
      default: return 'Start';
    }
  }, [controllerType]);

  const getBackButton = useCallback(() => {
    switch (controllerType) {
      case 'XBOX': return 'Back';
      case 'PLAYSTATION': return 'Share';
      case 'SWITCH': return 'Minus';
      case 'BITDO': return 'Select';
      case 'DIRECTINPUT': return 'Button9';
      default: return 'Back';
    }
  }, [controllerType]);

  const getLeftBumper = useCallback(() => {
    switch (controllerType) {
      case 'XBOX': return 'LB';
      case 'PLAYSTATION': return 'L1';
      case 'SWITCH': return 'L';
      case 'BITDO': return 'L';
      case 'DIRECTINPUT': return 'Button5';
      default: return 'LB';
    }
  }, [controllerType]);

  const getRightBumper = useCallback(() => {
    switch (controllerType) {
      case 'XBOX': return 'RB';
      case 'PLAYSTATION': return 'R1';
      case 'SWITCH': return 'R';
      case 'BITDO': return 'R';
      case 'DIRECTINPUT': return 'Button6';
      default: return 'RB';
    }
  }, [controllerType]);

  // Vibração aprimorada do controle
  const vibrate = useCallback((pattern = 'short', intensity = 0.8) => {
    if (!gamepadConnected || gamepadIndex === null || !hapticSupported) return;

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[gamepadIndex];

    if (!gamepad?.vibrationActuator) return;

    const patterns = {
      short: { duration: 100, strongMagnitude: intensity, weakMagnitude: intensity * 0.5 },
      medium: { duration: 200, strongMagnitude: intensity, weakMagnitude: intensity * 0.7 },
      long: { duration: 500, strongMagnitude: intensity * 0.8, weakMagnitude: intensity },
      pulse: { duration: 50, strongMagnitude: intensity, weakMagnitude: 0 },
      rumble: { duration: 300, strongMagnitude: 0, weakMagnitude: intensity }
    };

    const effect = patterns[pattern] || patterns.short;

    gamepad.vibrationActuator.playEffect('dual-rumble', effect).catch(() => {
      console.warn('Haptic feedback não suportado');
    });
  }, [gamepadConnected, gamepadIndex, hapticSupported]);

  // Calibrar controle (resetar deadzone e configurações)
  const calibrateController = useCallback(() => {
    if (!controllerConfig) return;

    console.log(`🎮 Calibrando ${controllerConfig.name}...`);
    setButtonStates({});
    vibrate('pulse');
    playSound('confirm');
  }, [controllerConfig, vibrate, playSound]);

  // Obter informações detalhadas do controle (NOVA FUNÇÃO)
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
    // Estados básicos
    gamepadConnected,
    gamepadIndex,
    controllerType,
    controllerConfig,
    buttonStates,
    lastButtonPress,
    hapticSupported,

    // Funções de input
    isButtonPressed,
    isButtonJustPressed,
    getStickValue,
    getNavigationInput,

    // Mapeamento universal
    getConfirmButton,
    getCancelButton,
    getMenuButton,
    getBackButton,
    getLeftBumper,
    getRightBumper,

    // Funcionalidades extras
    vibrate,
    calibrateController,
    getControllerInfo, // NOVA FUNÇÃO ADICIONADA

    // Configurações disponíveis
    CONTROLLER_CONFIGS
  };
};